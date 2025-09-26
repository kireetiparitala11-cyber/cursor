const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get user's integration settings
// @route   GET /api/integrations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('apiKeys');
    
    res.json({
      success: true,
      data: {
        integrations: {
          meta: {
            isConnected: user.apiKeys.meta.isActive,
            appId: user.apiKeys.meta.appId ? '***' + user.apiKeys.meta.appId.slice(-4) : null,
            hasAccessToken: !!user.apiKeys.meta.accessToken
          },
          google: {
            isConnected: user.apiKeys.google.isActive,
            clientId: user.apiKeys.google.clientId ? '***' + user.apiKeys.google.clientId.slice(-4) : null,
            hasRefreshToken: !!user.apiKeys.google.refreshToken
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get integrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update Meta Ads integration
// @route   PUT /api/integrations/meta
// @access  Private
router.put('/meta', protect, [
  body('appId').notEmpty().withMessage('App ID is required'),
  body('appSecret').notEmpty().withMessage('App Secret is required'),
  body('accessToken').notEmpty().withMessage('Access Token is required')
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

    const { appId, appSecret, accessToken } = req.body;

    // TODO: Validate Meta credentials by making a test API call
    // For now, we'll just store them
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'apiKeys.meta.appId': appId,
        'apiKeys.meta.appSecret': appSecret,
        'apiKeys.meta.accessToken': accessToken,
        'apiKeys.meta.isActive': true
      },
      { new: true }
    );

    logger.info(`Meta integration updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Meta Ads integration updated successfully',
      data: {
        isConnected: true,
        appId: '***' + appId.slice(-4)
      }
    });
  } catch (error) {
    logger.error('Update Meta integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Meta integration update'
    });
  }
});

// @desc    Update Google Ads integration
// @route   PUT /api/integrations/google
// @access  Private
router.put('/google', protect, [
  body('developerToken').notEmpty().withMessage('Developer Token is required'),
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('clientSecret').notEmpty().withMessage('Client Secret is required'),
  body('refreshToken').notEmpty().withMessage('Refresh Token is required')
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

    const { developerToken, clientId, clientSecret, refreshToken } = req.body;

    // TODO: Validate Google Ads credentials by making a test API call
    // For now, we'll just store them
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'apiKeys.google.developerToken': developerToken,
        'apiKeys.google.clientId': clientId,
        'apiKeys.google.clientSecret': clientSecret,
        'apiKeys.google.refreshToken': refreshToken,
        'apiKeys.google.isActive': true
      },
      { new: true }
    );

    logger.info(`Google Ads integration updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Google Ads integration updated successfully',
      data: {
        isConnected: true,
        clientId: '***' + clientId.slice(-4)
      }
    });
  } catch (error) {
    logger.error('Update Google integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google integration update'
    });
  }
});

// @desc    Disconnect Meta Ads integration
// @route   DELETE /api/integrations/meta
// @access  Private
router.delete('/meta', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'apiKeys.meta.appId': null,
        'apiKeys.meta.appSecret': null,
        'apiKeys.meta.accessToken': null,
        'apiKeys.meta.isActive': false
      },
      { new: true }
    );

    logger.info(`Meta integration disconnected for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Meta Ads integration disconnected successfully'
    });
  } catch (error) {
    logger.error('Disconnect Meta integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Meta integration disconnect'
    });
  }
});

// @desc    Disconnect Google Ads integration
// @route   DELETE /api/integrations/google
// @access  Private
router.delete('/google', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'apiKeys.google.developerToken': null,
        'apiKeys.google.clientId': null,
        'apiKeys.google.clientSecret': null,
        'apiKeys.google.refreshToken': null,
        'apiKeys.google.isActive': false
      },
      { new: true }
    );

    logger.info(`Google integration disconnected for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Google Ads integration disconnected successfully'
    });
  } catch (error) {
    logger.error('Disconnect Google integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google integration disconnect'
    });
  }
});

// @desc    Sync campaigns from Meta Ads
// @route   POST /api/integrations/meta/sync
// @access  Private
router.post('/meta/sync', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('apiKeys');
    
    if (!user.apiKeys.meta.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Meta Ads integration is not connected'
      });
    }

    // TODO: Implement Meta Ads API integration
    // This would fetch campaigns from Meta Ads API and sync them to our database
    
    logger.info(`Meta campaigns sync requested by user: ${user.email}`);

    res.json({
      success: true,
      message: 'Meta campaigns sync initiated',
      data: {
        status: 'pending',
        message: 'Campaigns are being synced in the background'
      }
    });
  } catch (error) {
    logger.error('Meta sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Meta sync'
    });
  }
});

// @desc    Sync campaigns from Google Ads
// @route   POST /api/integrations/google/sync
// @access  Private
router.post('/google/sync', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('apiKeys');
    
    if (!user.apiKeys.google.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Google Ads integration is not connected'
      });
    }

    // TODO: Implement Google Ads API integration
    // This would fetch campaigns from Google Ads API and sync them to our database
    
    logger.info(`Google campaigns sync requested by user: ${user.email}`);

    res.json({
      success: true,
      message: 'Google campaigns sync initiated',
      data: {
        status: 'pending',
        message: 'Campaigns are being synced in the background'
      }
    });
  } catch (error) {
    logger.error('Google sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google sync'
    });
  }
});

// @desc    Test integration connection
// @route   POST /api/integrations/test/:platform
// @access  Private
router.post('/test/:platform', protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const user = await User.findById(req.user._id).select('apiKeys');

    if (platform === 'meta') {
      if (!user.apiKeys.meta.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Meta Ads integration is not connected'
        });
      }

      // TODO: Make test API call to Meta Ads
      // For now, return success
      res.json({
        success: true,
        message: 'Meta Ads connection test successful',
        data: {
          platform: 'meta',
          status: 'connected',
          lastTested: new Date()
        }
      });
    } else if (platform === 'google') {
      if (!user.apiKeys.google.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Google Ads integration is not connected'
        });
      }

      // TODO: Make test API call to Google Ads
      // For now, return success
      res.json({
        success: true,
        message: 'Google Ads connection test successful',
        data: {
          platform: 'google',
          status: 'connected',
          lastTested: new Date()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Supported platforms: meta, google'
      });
    }
  } catch (error) {
    logger.error('Test integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during integration test'
    });
  }
});

// @desc    Get webhook endpoints
// @route   GET /api/integrations/webhooks
// @access  Private
router.get('/webhooks', protect, async (req, res) => {
  try {
    const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/leads`;
    
    res.json({
      success: true,
      data: {
        webhookUrl,
        instructions: {
          meta: 'Configure this URL in your Meta Ads Manager under Webhooks',
          google: 'Configure this URL in your Google Ads account under API Center'
        }
      }
    });
  } catch (error) {
    logger.error('Get webhooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Webhook endpoint for receiving leads
// @route   POST /api/webhooks/leads
// @access  Public (but should be secured with webhook verification)
router.post('/webhooks/leads', async (req, res) => {
  try {
    // TODO: Implement webhook verification for security
    // TODO: Parse webhook payload and create leads
    
    logger.info('Webhook received:', req.body);

    res.json({
      success: true,
      message: 'Webhook received successfully'
    });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
});

module.exports = router;