export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'admin' | 'user' | 'viewer';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    dashboard: {
      defaultView: 'leads' | 'campaigns' | 'analytics';
      itemsPerPage: number;
    };
  };
  createdAt: string;
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  campaign: Campaign;
  adPlatform: 'meta' | 'google' | 'manual';
  adId: string;
  adSetId?: string;
  campaignId?: string;
  source: 'facebook' | 'instagram' | 'google' | 'manual' | 'other';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  formData?: Record<string, any>;
  engagement: {
    pageViews: number;
    timeOnSite: number;
    bounceRate: number;
    lastActivity?: string;
    interactions: Interaction[];
  };
  score: {
    current: number;
    previous: number;
    factors: ScoringFactor[];
    lastCalculated: string;
    confidence: number;
  };
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'unqualified';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: User;
  owner: User;
  conversion: {
    isConverted: boolean;
    convertedAt?: string;
    conversionValue: number;
    conversionType?: string;
    notes?: string;
  };
  notes: Note[];
  tags: string[];
  quality: {
    emailValid: boolean;
    phoneValid: boolean;
    companyValid: boolean;
    completeness: number;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    ipAddress?: string;
  };
  device?: {
    type?: string;
    os?: string;
    browser?: string;
    userAgent?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  platform: 'meta' | 'google' | 'manual';
  platformCampaignId: string;
  type: 'lead_generation' | 'awareness' | 'conversion' | 'retargeting' | 'other';
  objective: 'leads' | 'traffic' | 'engagement' | 'sales' | 'brand_awareness';
  budget: {
    daily: number;
    total: number;
    spent: number;
    currency: string;
  };
  targeting: {
    demographics: {
      ageMin?: number;
      ageMax?: number;
      genders?: string[];
      locations?: string[];
      languages?: string[];
    };
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
    lookalikeAudiences?: string[];
  };
  creative: {
    adFormat?: 'single_image' | 'carousel' | 'video' | 'text' | 'other';
    headline?: string;
    description?: string;
    callToAction?: string;
    images?: string[];
    videos?: string[];
    landingPageUrl?: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    costPerClick: number;
    costPerConversion: number;
    clickThroughRate: number;
    conversionRate: number;
    lastUpdated: string;
  };
  status: 'active' | 'paused' | 'completed' | 'draft' | 'archived';
  startDate: string;
  endDate?: string;
  owner: User;
  scoringConfig: {
    enabled: boolean;
    factors: ScoringConfigFactor[];
    autoUpdate: boolean;
    updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  };
  integration: {
    webhookUrl?: string;
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    lastSync?: string;
  };
  tags: string[];
  category?: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  type: 'email_open' | 'email_click' | 'page_view' | 'form_submit' | 'download';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ScoringFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
  timestamp: string;
}

export interface ScoringConfigFactor {
  name: string;
  weight: number;
  enabled: boolean;
  description: string;
}

export interface Note {
  content: string;
  author: User;
  timestamp: string;
  isPrivate?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  errors?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilters extends PaginationParams {
  status?: string;
  priority?: string;
  campaign?: string;
  assignedTo?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  minScore?: number;
  maxScore?: number;
}

export interface CampaignFilters extends PaginationParams {
  status?: string;
  platform?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardAnalytics {
  overview: {
    totalLeads: number;
    totalCampaigns: number;
    activeCampaigns: number;
    avgScore: number;
  };
  distribution: {
    byStatus: Array<{ _id: string; count: number }>;
    bySource: Array<{ _id: string; count: number }>;
    byPriority: Array<{ _id: string; count: number }>;
  };
  conversions: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalValue: number;
    avgValue: number;
  };
  recentLeads: Lead[];
  topCampaigns: Array<{
    campaignName: string;
    platform: string;
    leadCount: number;
    avgScore: number;
    convertedCount: number;
    conversionRate: number;
  }>;
  trends: {
    leadsOverTime: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
      avgScore: number;
    }>;
  };
}

export interface ScoringExplanation {
  totalScore: number;
  confidence: number;
  factors: Array<{
    name: string;
    score: number;
    weight: number;
    description: string;
    impact: number;
  }>;
  recommendations: string[];
}

export interface IntegrationSettings {
  meta: {
    isConnected: boolean;
    appId?: string;
    hasAccessToken: boolean;
  };
  google: {
    isConnected: boolean;
    clientId?: string;
    hasRefreshToken: boolean;
  };
}