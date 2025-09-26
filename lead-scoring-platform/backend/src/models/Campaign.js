const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Platform information
  platform: {
    type: String,
    enum: ['meta', 'google', 'manual'],
    required: true
  },
  platformCampaignId: {
    type: String,
    required: true
  },
  
  // Campaign details
  type: {
    type: String,
    enum: ['lead_generation', 'awareness', 'conversion', 'retargeting', 'other'],
    default: 'lead_generation'
  },
  objective: {
    type: String,
    enum: ['leads', 'traffic', 'engagement', 'sales', 'brand_awareness'],
    default: 'leads'
  },
  
  // Budget and performance
  budget: {
    daily: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Targeting information
  targeting: {
    demographics: {
      ageMin: { type: Number, min: 13, max: 65 },
      ageMax: { type: Number, min: 13, max: 65 },
      genders: [{ type: String, enum: ['male', 'female', 'other'] }],
      locations: [String],
      languages: [String]
    },
    interests: [String],
    behaviors: [String],
    customAudiences: [String],
    lookalikeAudiences: [String]
  },
  
  // Creative information
  creative: {
    adFormat: {
      type: String,
      enum: ['single_image', 'carousel', 'video', 'text', 'other']
    },
    headline: String,
    description: String,
    callToAction: String,
    images: [String],
    videos: [String],
    landingPageUrl: String
  },
  
  // Performance metrics
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    costPerClick: { type: Number, default: 0 },
    costPerConversion: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'draft', 'archived'],
    default: 'active'
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  
  // Ownership
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Scoring configuration
  scoringConfig: {
    enabled: { type: Boolean, default: true },
    factors: [{
      name: String,
      weight: { type: Number, min: 0, max: 1 },
      enabled: { type: Boolean, default: true },
      description: String
    }],
    autoUpdate: { type: Boolean, default: true },
    updateFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'weekly'],
      default: 'hourly'
    }
  },
  
  // Integration settings
  integration: {
    webhookUrl: String,
    autoSync: { type: Boolean, default: true },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'hourly'
    },
    lastSync: Date
  },
  
  // Tags and categorization
  tags: [String],
  category: String,
  
  // Notes
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ platform: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ owner: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ tags: 1 });

// Virtual for campaign duration in days
campaignSchema.virtual('durationInDays').get(function() {
  if (!this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for campaign performance score
campaignSchema.virtual('performanceScore').get(function() {
  const metrics = this.metrics;
  if (!metrics.impressions || !metrics.clicks) return 0;
  
  const ctr = metrics.clickThroughRate || (metrics.clicks / metrics.impressions) * 100;
  const conversionRate = metrics.conversionRate || (metrics.conversions / metrics.clicks) * 100;
  
  // Simple performance score based on CTR and conversion rate
  return Math.round((ctr * 0.4 + conversionRate * 0.6) * 10) / 10;
});

// Method to update metrics
campaignSchema.methods.updateMetrics = function(newMetrics) {
  this.metrics = { ...this.metrics, ...newMetrics };
  this.metrics.lastUpdated = new Date();
  return this.save();
};

// Method to add note
campaignSchema.methods.addNote = function(content, author) {
  this.notes.push({
    content,
    author,
    timestamp: new Date()
  });
  return this.save();
};

// Method to check if campaign is active
campaignSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
};

module.exports = mongoose.model('Campaign', campaignSchema);