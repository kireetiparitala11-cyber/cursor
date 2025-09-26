const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'paused', 'completed', 'draft', 'archived']),
  query('platform').optional().isIn(['meta', 'google', 'manual']),
  query('sortBy').optional().isIn(['name', 'createdAt', 'startDate', 'performanceScore']),
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
    if (req.query.platform) filter.platform = req.query.platform;

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const campaigns = await Campaign.find(filter)
      .populate('owner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Campaign.countDocuments(filter);

    res.json({
      success: true,
      count: campaigns.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: campaigns
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('notes.author', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this campaign'
      });
    }

    // Get campaign statistics
    const leadStats = await Lead.aggregate([
      { $match: { campaign: campaign._id } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          avgScore: { $avg: '$score.current' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    const stats = leadStats[0] || { totalLeads: 0, avgScore: 0, statusCounts: [] };
    
    // Count statuses
    const statusCounts = stats.statusCounts.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        campaign,
        statistics: {
          totalLeads: stats.totalLeads,
          averageScore: Math.round(stats.avgScore || 0),
          statusCounts
        }
      }
    });
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Campaign name is required'),
  body('platform').isIn(['meta', 'google', 'manual']).withMessage('Valid platform is required'),
  body('platformCampaignId').notEmpty().withMessage('Platform campaign ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('type').optional().isIn(['lead_generation', 'awareness', 'conversion', 'retargeting', 'other']),
  body('objective').optional().isIn(['leads', 'traffic', 'engagement', 'sales', 'brand_awareness'])
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

    const campaignData = {
      ...req.body,
      owner: req.user._id
    };

    // Check for duplicate platform campaign ID
    const existingCampaign = await Campaign.findOne({
      platformCampaignId: req.body.platformCampaignId,
      platform: req.body.platform,
      owner: req.user._id
    });

    if (existingCampaign) {
      return res.status(400).json({
        success: false,
        message: 'Campaign with this platform ID already exists'
      });
    }

    // Create campaign
    const campaign = await Campaign.create(campaignData);
    await campaign.populate('owner', 'name email');

    logger.info(`New campaign created: ${campaign.name} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during campaign creation'
    });
  }
});

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Update campaign
    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'name email');

    logger.info(`Campaign updated: ${campaign.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during campaign update'
    });
  }
});

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    // Check if campaign has leads
    const leadCount = await Lead.countDocuments({ campaign: campaign._id });
    if (leadCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete campaign with ${leadCount} leads. Please delete or reassign leads first.`
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    logger.info(`Campaign deleted: ${campaign.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during campaign deletion'
    });
  }
});

// @desc    Add note to campaign
// @route   POST /api/campaigns/:id/notes
// @access  Private
router.post('/:id/notes', protect, [
  body('content').trim().notEmpty().withMessage('Note content is required')
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

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this campaign'
      });
    }

    await campaign.addNote(req.body.content, req.user._id);

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    logger.error('Add campaign note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during note addition'
    });
  }
});

// @desc    Update campaign metrics
// @route   PUT /api/campaigns/:id/metrics
// @access  Private
router.put('/:id/metrics', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    await campaign.updateMetrics(req.body);

    logger.info(`Campaign metrics updated: ${campaign.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Campaign metrics updated successfully',
      data: campaign.metrics
    });
  } catch (error) {
    logger.error('Update campaign metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during metrics update'
    });
  }
});

// @desc    Get campaign leads
// @route   GET /api/campaigns/:id/leads
// @access  Private
router.get('/:id/leads', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified']),
  query('sortBy').optional().isIn(['score', 'createdAt', 'firstName', 'lastName']),
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

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this campaign'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { campaign: campaign._id };

    if (req.query.status) filter.status = req.query.status;

    // Build sort object
    const sortBy = req.query.sortBy || 'score';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const leads = await Lead.find(filter)
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
    logger.error('Get campaign leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;