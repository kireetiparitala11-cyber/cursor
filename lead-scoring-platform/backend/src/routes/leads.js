const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const scoringService = require('../services/scoringService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('campaign').optional().isMongoId(),
  query('assignedTo').optional().isMongoId(),
  query('sortBy').optional().isIn(['score', 'createdAt', 'updatedAt', 'firstName', 'lastName']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { owner: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.campaign) filter.campaign = req.query.campaign;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    // Build sort object
    const sortBy = req.query.sortBy || 'score';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const leads = await Lead.find(filter)
      .populate('campaign', 'name platform type')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      count: leads.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('campaign', 'name platform type metrics')
      .populate('assignedTo', 'name email')
      .populate('owner', 'name email')
      .populate('notes.author', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    logger.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
router.post('/', protect, [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('campaign').isMongoId().withMessage('Valid campaign ID is required'),
  body('adPlatform').isIn(['meta', 'google', 'manual']).withMessage('Valid ad platform is required'),
  body('adId').notEmpty().withMessage('Ad ID is required'),
  body('source').isIn(['facebook', 'instagram', 'google', 'manual', 'other']).withMessage('Valid source is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const leadData = {
      ...req.body,
      owner: req.user._id
    };

    // Verify campaign exists and user has access
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create leads for this campaign'
      });
    }

    // Create lead
    const lead = await Lead.create(leadData);

    // Calculate initial score
    const scoringResult = await scoringService.calculateLeadScore(lead, campaign);
    await lead.updateScore(scoringResult.factors);

    // Populate the lead for response
    await lead.populate('campaign', 'name platform type');
    await lead.populate('owner', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('new_lead', lead);

    logger.info(`New lead created: ${lead.email} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lead creation'
    });
  }
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // Update lead
    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('campaign', 'name platform type')
      .populate('assignedTo', 'name email')
      .populate('owner', 'name email');

    // Recalculate score if relevant fields changed
    const scoreAffectingFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'formData'];
    const hasScoreAffectingChanges = scoreAffectingFields.some(field => req.body[field] !== undefined);
    
    if (hasScoreAffectingChanges) {
      const campaign = await Campaign.findById(lead.campaign);
      const scoringResult = await scoringService.calculateLeadScore(lead, campaign);
      await lead.updateScore(scoringResult.factors);
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('lead_updated', lead);

    logger.info(`Lead updated: ${lead.email} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    logger.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lead update'
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lead'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('lead_deleted', { id: req.params.id });

    logger.info(`Lead deleted: ${lead.email} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    logger.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lead deletion'
    });
  }
});

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
router.post('/:id/notes', protect, [
  body('content').trim().notEmpty().withMessage('Note content is required'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this lead'
      });
    }

    await lead.addNote(req.body.content, req.user._id, req.body.isPrivate || false);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('lead_note_added', { leadId: req.params.id });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    logger.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during note addition'
    });
  }
});

// @desc    Add interaction to lead
// @route   POST /api/leads/:id/interactions
// @access  Private
router.post('/:id/interactions', protect, [
  body('type').isIn(['email_open', 'email_click', 'page_view', 'form_submit', 'download']).withMessage('Valid interaction type is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add interactions to this lead'
      });
    }

    await lead.addInteraction(req.body.type, req.body.metadata || {});

    // Recalculate score after interaction
    const campaign = await Campaign.findById(lead.campaign);
    const scoringResult = await scoringService.calculateLeadScore(lead, campaign);
    await lead.updateScore(scoringResult.factors);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('lead_interaction_added', { leadId: req.params.id });

    res.json({
      success: true,
      message: 'Interaction added successfully'
    });
  } catch (error) {
    logger.error('Add interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during interaction addition'
    });
  }
});

// @desc    Get lead scoring explanation
// @route   GET /api/leads/:id/scoring
// @access  Private
router.get('/:id/scoring', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('campaign', 'name platform type metrics');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view scoring for this lead'
      });
    }

    const scoringResult = await scoringService.calculateLeadScore(lead, lead.campaign);
    const explanation = scoringService.getScoringExplanation(lead, scoringResult);

    res.json({
      success: true,
      data: explanation
    });
  } catch (error) {
    logger.error('Get scoring explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;