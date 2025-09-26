const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/auth');
const scoringService = require('../services/scoringService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Recalculate lead scores
// @route   POST /api/scoring/recalculate
// @access  Private
router.post('/recalculate', protect, [
  body('leadIds').optional().isArray().withMessage('Lead IDs must be an array'),
  body('campaignId').optional().isMongoId().withMessage('Valid campaign ID is required'),
  body('allLeads').optional().isBoolean().withMessage('allLeads must be a boolean')
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

    const { leadIds, campaignId, allLeads } = req.body;
    let leads = [];

    if (allLeads) {
      // Recalculate all leads for the user
      leads = await Lead.find({ owner: req.user._id })
        .populate('campaign');
    } else if (leadIds && leadIds.length > 0) {
      // Recalculate specific leads
      leads = await Lead.find({
        _id: { $in: leadIds },
        owner: req.user._id
      }).populate('campaign');
    } else if (campaignId) {
      // Recalculate leads for a specific campaign
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || campaign.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found or not authorized'
        });
      }

      leads = await Lead.find({ campaign: campaignId })
        .populate('campaign');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please specify leadIds, campaignId, or set allLeads to true'
      });
    }

    const results = [];
    const errors = [];

    for (const lead of leads) {
      try {
        const scoringResult = await scoringService.calculateLeadScore(lead, lead.campaign);
        await lead.updateScore(scoringResult.factors);
        
        results.push({
          leadId: lead._id,
          email: lead.email,
          oldScore: lead.score.previous,
          newScore: lead.score.current,
          confidence: scoringResult.confidence
        });
      } catch (error) {
        logger.error(`Error recalculating score for lead ${lead._id}:`, error);
        errors.push({
          leadId: lead._id,
          email: lead.email,
          error: error.message
        });
      }
    }

    logger.info(`Score recalculation completed by user: ${req.user.email}. Processed: ${results.length}, Errors: ${errors.length}`);

    res.json({
      success: true,
      message: `Score recalculation completed. Processed: ${results.length}, Errors: ${errors.length}`,
      data: {
        processed: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    logger.error('Recalculate scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during score recalculation'
    });
  }
});

// @desc    Get scoring configuration
// @route   GET /api/scoring/config
// @access  Private
router.get('/config', protect, async (req, res) => {
  try {
    const config = {
      defaultFactors: scoringService.defaultFactors,
      availableFactors: [
        {
          name: 'formCompleteness',
          description: 'Form completion percentage',
          weight: 0.15,
          type: 'percentage'
        },
        {
          name: 'emailQuality',
          description: 'Email domain quality and validity',
          weight: 0.10,
          type: 'score'
        },
        {
          name: 'phoneProvided',
          description: 'Phone number provided',
          weight: 0.08,
          type: 'boolean'
        },
        {
          name: 'companyProvided',
          description: 'Company information provided',
          weight: 0.07,
          type: 'boolean'
        },
        {
          name: 'pageViews',
          description: 'Number of page views',
          weight: 0.12,
          type: 'count'
        },
        {
          name: 'timeOnSite',
          description: 'Time spent on website',
          weight: 0.10,
          type: 'duration'
        },
        {
          name: 'bounceRate',
          description: 'Bounce rate (lower is better)',
          weight: 0.08,
          type: 'percentage'
        },
        {
          name: 'emailOpens',
          description: 'Email open rate',
          weight: 0.10,
          type: 'count'
        },
        {
          name: 'emailClicks',
          description: 'Email click rate',
          weight: 0.08,
          type: 'count'
        },
        {
          name: 'campaignPerformance',
          description: 'Campaign performance metrics',
          weight: 0.12,
          type: 'score'
        },
        {
          name: 'sourceQuality',
          description: 'Lead source quality',
          weight: 0.10,
          type: 'score'
        }
      ]
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Get scoring config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update scoring configuration for campaign
// @route   PUT /api/scoring/config/:campaignId
// @access  Private
router.put('/config/:campaignId', protect, [
  body('factors').isArray().withMessage('Factors must be an array'),
  body('factors.*.name').notEmpty().withMessage('Factor name is required'),
  body('factors.*.weight').isFloat({ min: 0, max: 1 }).withMessage('Factor weight must be between 0 and 1'),
  body('factors.*.enabled').isBoolean().withMessage('Factor enabled must be a boolean')
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

    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check ownership
    if (campaign.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Validate that weights sum to 1
    const totalWeight = req.body.factors.reduce((sum, factor) => sum + factor.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Factor weights must sum to 1.0'
      });
    }

    // Update campaign scoring configuration
    campaign.scoringConfig.factors = req.body.factors;
    campaign.scoringConfig.enabled = req.body.enabled !== undefined ? req.body.enabled : campaign.scoringConfig.enabled;
    campaign.scoringConfig.autoUpdate = req.body.autoUpdate !== undefined ? req.body.autoUpdate : campaign.scoringConfig.autoUpdate;
    campaign.scoringConfig.updateFrequency = req.body.updateFrequency || campaign.scoringConfig.updateFrequency;

    await campaign.save();

    logger.info(`Scoring configuration updated for campaign: ${campaign.name} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Scoring configuration updated successfully',
      data: campaign.scoringConfig
    });
  } catch (error) {
    logger.error('Update scoring config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during configuration update'
    });
  }
});

// @desc    Get scoring analytics
// @route   GET /api/scoring/analytics
// @access  Private
router.get('/analytics', protect, [
  query('campaignId').optional().isMongoId().withMessage('Valid campaign ID is required'),
  query('dateFrom').optional().isISO8601().withMessage('Valid date format required'),
  query('dateTo').optional().isISO8601().withMessage('Valid date format required')
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

    const { campaignId, dateFrom, dateTo } = req.query;

    // Build filter
    const filter = { owner: req.user._id };
    if (campaignId) filter.campaign = campaignId;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Get scoring analytics
    const analytics = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          avgScore: { $avg: '$score.current' },
          maxScore: { $max: '$score.current' },
          minScore: { $min: '$score.current' },
          scoreDistribution: {
            $push: '$score.current'
          },
          highQualityLeads: {
            $sum: { $cond: [{ $gte: ['$score.current', 80] }, 1, 0] }
          },
          mediumQualityLeads: {
            $sum: { $cond: [{ $and: [{ $gte: ['$score.current', 50] }, { $lt: ['$score.current', 80] }] }, 1, 0] }
          },
          lowQualityLeads: {
            $sum: { $cond: [{ $lt: ['$score.current', 50] }, 1, 0] }
          }
        }
      }
    ]);

    // Get score distribution by ranges
    const scoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    const distribution = await Promise.all(
      scoreRanges.map(async (range) => {
        const count = await Lead.countDocuments({
          ...filter,
          'score.current': { $gte: range.min, $lte: range.max }
        });
        return {
          range: range.range,
          count,
          percentage: 0 // Will be calculated below
        };
      })
    );

    // Calculate percentages
    const totalLeads = analytics[0]?.totalLeads || 0;
    distribution.forEach(item => {
      item.percentage = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
    });

    // Get top performing factors
    const topFactors = await Lead.aggregate([
      { $match: filter },
      { $unwind: '$score.factors' },
      {
        $group: {
          _id: '$score.factors.name',
          avgValue: { $avg: '$score.factors.value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgValue: -1 } },
      { $limit: 10 }
    ]);

    const result = {
      summary: analytics[0] || {
        totalLeads: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        highQualityLeads: 0,
        mediumQualityLeads: 0,
        lowQualityLeads: 0
      },
      distribution,
      topFactors
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get scoring analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get lead score history
// @route   GET /api/scoring/history/:leadId
// @access  Private
router.get('/history/:leadId', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead'
      });
    }

    // Get score history from factors
    const scoreHistory = lead.score.factors.map(factor => ({
      timestamp: factor.timestamp,
      factors: lead.score.factors.filter(f => f.timestamp.getTime() === factor.timestamp.getTime()),
      score: lead.score.current
    }));

    // Remove duplicates and sort by timestamp
    const uniqueHistory = scoreHistory.filter((item, index, self) => 
      index === self.findIndex(t => t.timestamp.getTime() === item.timestamp.getTime())
    ).sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      success: true,
      data: {
        leadId: lead._id,
        currentScore: lead.score.current,
        previousScore: lead.score.previous,
        lastCalculated: lead.score.lastCalculated,
        confidence: lead.score.confidence,
        history: uniqueHistory
      }
    });
  } catch (error) {
    logger.error('Get score history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;