const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Basic lead information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  
  // Campaign information
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  adPlatform: {
    type: String,
    enum: ['meta', 'google', 'manual'],
    required: true
  },
  adId: {
    type: String,
    required: true
  },
  adSetId: String,
  campaignId: String,
  
  // Lead source and tracking
  source: {
    type: String,
    enum: ['facebook', 'instagram', 'google', 'manual', 'other'],
    required: true
  },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  
  // Form data (flexible schema for different form fields)
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Engagement signals
  engagement: {
    pageViews: { type: Number, default: 0 },
    timeOnSite: { type: Number, default: 0 }, // in seconds
    bounceRate: { type: Number, default: 0 },
    lastActivity: Date,
    interactions: [{
      type: { type: String, enum: ['email_open', 'email_click', 'page_view', 'form_submit', 'download'] },
      timestamp: { type: Date, default: Date.now },
      metadata: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Scoring information
  score: {
    current: { type: Number, default: 0, min: 0, max: 100 },
    previous: { type: Number, default: 0 },
    factors: [{
      name: String,
      value: Number,
      weight: Number,
      description: String,
      timestamp: { type: Date, default: Date.now }
    }],
    lastCalculated: { type: Date, default: Date.now },
    confidence: { type: Number, default: 0, min: 0, max: 1 }
  },
  
  // Lead status and lifecycle
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Assignment and ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Conversion tracking
  conversion: {
    isConverted: { type: Boolean, default: false },
    convertedAt: Date,
    conversionValue: { type: Number, default: 0 },
    conversionType: String,
    notes: String
  },
  
  // Notes and comments
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }],
  
  // Tags for categorization
  tags: [String],
  
  // Lead quality indicators
  quality: {
    emailValid: { type: Boolean, default: false },
    phoneValid: { type: Boolean, default: false },
    companyValid: { type: Boolean, default: false },
    completeness: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  // Geographic information
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    ipAddress: String
  },
  
  // Device and browser information
  device: {
    type: String,
    os: String,
    browser: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ campaign: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ 'score.current': -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ owner: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ tags: 1 });

// Compound indexes
leadSchema.index({ owner: 1, status: 1 });
leadSchema.index({ campaign: 1, status: 1 });
leadSchema.index({ 'score.current': -1, status: 1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for lead age in days
leadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to update lead score
leadSchema.methods.updateScore = function(factors) {
  this.score.previous = this.score.current;
  this.score.factors = factors;
  
  // Calculate weighted score
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedScore = factors.reduce((sum, factor) => {
    return sum + (factor.value * factor.weight);
  }, 0);
  
  this.score.current = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  this.score.lastCalculated = new Date();
  
  return this.save();
};

// Method to add interaction
leadSchema.methods.addInteraction = function(type, metadata = {}) {
  this.engagement.interactions.push({
    type,
    metadata,
    timestamp: new Date()
  });
  this.engagement.lastActivity = new Date();
  return this.save();
};

// Method to add note
leadSchema.methods.addNote = function(content, author, isPrivate = false) {
  this.notes.push({
    content,
    author,
    isPrivate
  });
  return this.save();
};

module.exports = mongoose.model('Lead', leadSchema);