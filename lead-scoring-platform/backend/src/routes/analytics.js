const express = require('express');
const { query, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, [
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

    const { dateFrom, dateTo } = req.query;

    // Build date filter
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get user's leads and campaigns
    const userFilter = { owner: req.user._id };
    const leadFilter = { ...userFilter, ...dateFilter };

    // Get basic metrics
    const [
      totalLeads,
      totalCampaigns,
      activeCampaigns,
      leadsByStatus,
      leadsBySource,
      leadsByPriority,
      avgScore,
      conversionMetrics,
      recentLeads,
      topCampaigns
    ] = await Promise.all([
      // Total leads
      Lead.countDocuments(leadFilter),
      
      // Total campaigns
      Campaign.countDocuments(userFilter),
      
      // Active campaigns
      Campaign.countDocuments({ ...userFilter, status: 'active' }),
      
      // Leads by status
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Leads by source
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Leads by priority
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Average score
      Lead.aggregate([
        { $match: leadFilter },
        { $group: { _id: null, avgScore: { $avg: '$score.current' } } }
      ]),
      
      // Conversion metrics
      Lead.aggregate([
        { $match: leadFilter },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            convertedLeads: { $sum: { $cond: ['$conversion.isConverted', 1, 0] } },
            totalValue: { $sum: '$conversion.conversionValue' },
            avgValue: { $avg: '$conversion.conversionValue' }
          }
        }
      ]),
      
      // Recent leads (last 10)
      Lead.find(leadFilter)
        .populate('campaign', 'name platform')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email score.current status createdAt campaign'),
      
      // Top performing campaigns
      Lead.aggregate([
        { $match: leadFilter },
        {
          $group: {
            _id: '$campaign',
            leadCount: { $sum: 1 },
            avgScore: { $avg: '$score.current' },
            convertedCount: { $sum: { $cond: ['$conversion.isConverted', 1, 0] } }
          }
        },
        { $sort: { avgScore: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'campaigns',
            localField: '_id',
            foreignField: '_id',
            as: 'campaign'
          }
        },
        { $unwind: '$campaign' },
        {
          $project: {
            campaignName: '$campaign.name',
            platform: '$campaign.platform',
            leadCount: 1,
            avgScore: { $round: ['$avgScore', 1] },
            convertedCount: 1,
            conversionRate: {
              $round: [
                { $multiply: [{ $divide: ['$convertedCount', '$leadCount'] }, 100] },
                1
              ]
            }
          }
        }
      ])
    ]);

    // Get trend data (leads over time)
    const trendData = await Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$score.current' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    const analytics = {
      overview: {
        totalLeads,
        totalCampaigns,
        activeCampaigns,
        avgScore: avgScore[0]?.avgScore ? Math.round(avgScore[0].avgScore) : 0
      },
      distribution: {
        byStatus: leadsByStatus,
        bySource: leadsBySource,
        byPriority: leadsByPriority
      },
      conversions: {
        totalLeads: conversionMetrics[0]?.totalLeads || 0,
        convertedLeads: conversionMetrics[0]?.convertedLeads || 0,
        conversionRate: conversionMetrics[0]?.totalLeads > 0 
          ? Math.round((conversionMetrics[0].convertedLeads / conversionMetrics[0].totalLeads) * 100)
          : 0,
        totalValue: conversionMetrics[0]?.totalValue || 0,
        avgValue: conversionMetrics[0]?.avgValue ? Math.round(conversionMetrics[0].avgValue) : 0
      },
      recentLeads,
      topCampaigns,
      trends: {
        leadsOverTime: trendData
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get campaign performance analytics
// @route   GET /api/analytics/campaigns
// @access  Private
router.get('/campaigns', protect, [
  query('dateFrom').optional().isISO8601().withMessage('Valid date format required'),
  query('dateTo').optional().isISO8601().withMessage('Valid date format required'),
  query('platform').optional().isIn(['meta', 'google', 'manual']).withMessage('Valid platform required')
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

    const { dateFrom, dateTo, platform } = req.query;

    // Build filters
    const campaignFilter = { owner: req.user._id };
    if (platform) campaignFilter.platform = platform;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get campaign performance data
    const campaignPerformance = await Lead.aggregate([
      { $match: { owner: req.user._id, ...dateFilter } },
      {
        $group: {
          _id: '$campaign',
          leadCount: { $sum: 1 },
          avgScore: { $avg: '$score.current' },
          maxScore: { $max: '$score.current' },
          minScore: { $min: '$score.current' },
          highQualityLeads: { $sum: { $cond: [{ $gte: ['$score.current', 80] }, 1, 0] } },
          mediumQualityLeads: { $sum: { $cond: [{ $and: [{ $gte: ['$score.current', 50] }, { $lt: ['$score.current', 80] }] }, 1, 0] } },
          lowQualityLeads: { $sum: { $cond: [{ $lt: ['$score.current', 50] }, 1, 0] } },
          convertedLeads: { $sum: { $cond: ['$conversion.isConverted', 1, 0] } },
          totalValue: { $sum: '$conversion.conversionValue' },
          statusCounts: { $push: '$status' }
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $match: platform ? { 'campaign.platform': platform } : {}
      },
      {
        $project: {
          campaignId: '$_id',
          campaignName: '$campaign.name',
          platform: '$campaign.platform',
          status: '$campaign.status',
          startDate: '$campaign.startDate',
          endDate: '$campaign.endDate',
          budget: '$campaign.budget',
          metrics: '$campaign.metrics',
          leadCount: 1,
          avgScore: { $round: ['$avgScore', 1] },
          maxScore: 1,
          minScore: 1,
          highQualityLeads: 1,
          mediumQualityLeads: 1,
          lowQualityLeads: 1,
          convertedLeads: 1,
          conversionRate: {
            $round: [
              { $multiply: [{ $divide: ['$convertedLeads', '$leadCount'] }, 100] },
              1
            ]
          },
          totalValue: 1,
          avgValue: {
            $round: [
              { $divide: ['$totalValue', { $cond: [{ $gt: ['$convertedLeads', 0] }, '$convertedLeads', 1] }] },
              2
            ]
          },
          costPerLead: {
            $round: [
              { $divide: ['$campaign.budget.spent', '$leadCount'] },
              2
            ]
          },
          costPerConversion: {
            $round: [
              { $divide: ['$campaign.budget.spent', { $cond: [{ $gt: ['$convertedLeads', 0] }, '$convertedLeads', 1] }] },
              2
            ]
          }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    // Get platform comparison
    const platformComparison = await Lead.aggregate([
      { $match: { owner: req.user._id, ...dateFilter } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $group: {
          _id: '$campaign.platform',
          leadCount: { $sum: 1 },
          avgScore: { $avg: '$score.current' },
          convertedLeads: { $sum: { $cond: ['$conversion.isConverted', 1, 0] } },
          totalValue: { $sum: '$conversion.conversionValue' }
        }
      },
      {
        $project: {
          platform: '$_id',
          leadCount: 1,
          avgScore: { $round: ['$avgScore', 1] },
          conversionRate: {
            $round: [
              { $multiply: [{ $divide: ['$convertedLeads', '$leadCount'] }, 100] },
              1
            ]
          },
          totalValue: 1,
          avgValue: {
            $round: [
              { $divide: ['$totalValue', { $cond: [{ $gt: ['$convertedLeads', 0] }, '$convertedLeads', 1] }] },
              2
            ]
          }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        campaignPerformance,
        platformComparison
      }
    });
  } catch (error) {
    logger.error('Get campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get lead quality analytics
// @route   GET /api/analytics/quality
// @access  Private
router.get('/quality', protect, [
  query('dateFrom').optional().isISO8601().withMessage('Valid date format required'),
  query('dateTo').optional().isISO8601().withMessage('Valid date format required'),
  query('campaignId').optional().isMongoId().withMessage('Valid campaign ID required')
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

    const { dateFrom, dateTo, campaignId } = req.query;

    // Build filters
    const filter = { owner: req.user._id };
    if (campaignId) filter.campaign = campaignId;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    const leadFilter = { ...filter, ...dateFilter };

    // Get quality metrics
    const qualityMetrics = await Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          avgScore: { $avg: '$score.current' },
          highQuality: { $sum: { $cond: [{ $gte: ['$score.current', 80] }, 1, 0] } },
          mediumQuality: { $sum: { $cond: [{ $and: [{ $gte: ['$score.current', 50] }, { $lt: ['$score.current', 80] }] }, 1, 0] } },
          lowQuality: { $sum: { $cond: [{ $lt: ['$score.current', 50] }, 1, 0] } },
          avgConfidence: { $avg: '$score.confidence' },
          completeProfiles: { $sum: { $cond: [{ $gte: ['$quality.completeness', 80] }, 1, 0] } },
          validEmails: { $sum: { $cond: ['$quality.emailValid', 1, 0] } },
          validPhones: { $sum: { $cond: ['$quality.phoneValid', 1, 0] } },
          validCompanies: { $sum: { $cond: ['$quality.companyValid', 1, 0] } }
        }
      }
    ]);

    // Get score distribution
    const scoreDistribution = await Promise.all([
      Lead.countDocuments({ ...leadFilter, 'score.current': { $gte: 0, $lt: 20 } }),
      Lead.countDocuments({ ...leadFilter, 'score.current': { $gte: 20, $lt: 40 } }),
      Lead.countDocuments({ ...leadFilter, 'score.current': { $gte: 40, $lt: 60 } }),
      Lead.countDocuments({ ...leadFilter, 'score.current': { $gte: 60, $lt: 80 } }),
      Lead.countDocuments({ ...leadFilter, 'score.current': { $gte: 80, $lte: 100 } })
    ]);

    // Get top scoring factors
    const topFactors = await Lead.aggregate([
      { $match: leadFilter },
      { $unwind: '$score.factors' },
      {
        $group: {
          _id: '$score.factors.name',
          avgValue: { $avg: '$score.factors.value' },
          avgWeight: { $avg: '$score.factors.weight' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgValue: -1 } },
      { $limit: 10 }
    ]);

    // Get quality trends over time
    const qualityTrends = await Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          avgScore: { $avg: '$score.current' },
          leadCount: { $sum: 1 },
          highQualityCount: { $sum: { $cond: [{ $gte: ['$score.current', 80] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    const metrics = qualityMetrics[0] || {
      totalLeads: 0,
      avgScore: 0,
      highQuality: 0,
      mediumQuality: 0,
      lowQuality: 0,
      avgConfidence: 0,
      completeProfiles: 0,
      validEmails: 0,
      validPhones: 0,
      validCompanies: 0
    };

    const result = {
      overview: {
        totalLeads: metrics.totalLeads,
        avgScore: Math.round(metrics.avgScore || 0),
        avgConfidence: Math.round((metrics.avgConfidence || 0) * 100) / 100,
        qualityDistribution: {
          high: metrics.highQuality,
          medium: metrics.mediumQuality,
          low: metrics.lowQuality
        },
        dataQuality: {
          completeProfiles: metrics.completeProfiles,
          validEmails: metrics.validEmails,
          validPhones: metrics.validPhones,
          validCompanies: metrics.validCompanies
        }
      },
      scoreDistribution: [
        { range: '0-19', count: scoreDistribution[0] },
        { range: '20-39', count: scoreDistribution[1] },
        { range: '40-59', count: scoreDistribution[2] },
        { range: '60-79', count: scoreDistribution[3] },
        { range: '80-100', count: scoreDistribution[4] }
      ],
      topFactors,
      trends: qualityTrends
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get quality analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;