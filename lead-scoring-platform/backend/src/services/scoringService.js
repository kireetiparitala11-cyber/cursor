const logger = require('../utils/logger');

class ScoringService {
  constructor() {
    this.defaultFactors = {
      // Form completion factors
      formCompleteness: { weight: 0.15, description: 'Form completion percentage' },
      emailQuality: { weight: 0.10, description: 'Email domain quality and validity' },
      phoneProvided: { weight: 0.08, description: 'Phone number provided' },
      companyProvided: { weight: 0.07, description: 'Company information provided' },
      
      // Engagement factors
      pageViews: { weight: 0.12, description: 'Number of page views' },
      timeOnSite: { weight: 0.10, description: 'Time spent on website' },
      bounceRate: { weight: 0.08, description: 'Bounce rate (lower is better)' },
      emailOpens: { weight: 0.10, description: 'Email open rate' },
      emailClicks: { weight: 0.08, description: 'Email click rate' },
      
      // Campaign factors
      campaignPerformance: { weight: 0.12, description: 'Campaign performance metrics' },
      sourceQuality: { weight: 0.10, description: 'Lead source quality' }
    };
  }

  /**
   * Calculate lead score based on various factors
   * @param {Object} lead - Lead document
   * @param {Object} campaign - Campaign document
   * @param {Object} customFactors - Custom scoring factors
   * @returns {Object} Scoring result with factors and final score
   */
  async calculateLeadScore(lead, campaign, customFactors = {}) {
    try {
      const factors = { ...this.defaultFactors, ...customFactors };
      const scoringFactors = [];

      // Form completeness factor
      if (factors.formCompleteness?.weight > 0) {
        const completeness = this.calculateFormCompleteness(lead);
        scoringFactors.push({
          name: 'formCompleteness',
          value: completeness,
          weight: factors.formCompleteness.weight,
          description: factors.formCompleteness.description
        });
      }

      // Email quality factor
      if (factors.emailQuality?.weight > 0) {
        const emailScore = this.calculateEmailQuality(lead.email);
        scoringFactors.push({
          name: 'emailQuality',
          value: emailScore,
          weight: factors.emailQuality.weight,
          description: factors.emailQuality.description
        });
      }

      // Phone provided factor
      if (factors.phoneProvided?.weight > 0) {
        const phoneScore = lead.phone ? 100 : 0;
        scoringFactors.push({
          name: 'phoneProvided',
          value: phoneScore,
          weight: factors.phoneProvided.weight,
          description: factors.phoneProvided.description
        });
      }

      // Company provided factor
      if (factors.companyProvided?.weight > 0) {
        const companyScore = lead.company ? 100 : 0;
        scoringFactors.push({
          name: 'companyProvided',
          value: companyScore,
          weight: factors.companyProvided.weight,
          description: factors.companyProvided.description
        });
      }

      // Engagement factors
      if (factors.pageViews?.weight > 0) {
        const pageViewScore = this.calculatePageViewScore(lead.engagement.pageViews);
        scoringFactors.push({
          name: 'pageViews',
          value: pageViewScore,
          weight: factors.pageViews.weight,
          description: factors.pageViews.description
        });
      }

      if (factors.timeOnSite?.weight > 0) {
        const timeScore = this.calculateTimeOnSiteScore(lead.engagement.timeOnSite);
        scoringFactors.push({
          name: 'timeOnSite',
          value: timeScore,
          weight: factors.timeOnSite.weight,
          description: factors.timeOnSite.description
        });
      }

      if (factors.bounceRate?.weight > 0) {
        const bounceScore = this.calculateBounceRateScore(lead.engagement.bounceRate);
        scoringFactors.push({
          name: 'bounceRate',
          value: bounceScore,
          weight: factors.bounceRate.weight,
          description: factors.bounceRate.description
        });
      }

      // Email engagement factors
      if (factors.emailOpens?.weight > 0) {
        const emailOpenScore = this.calculateEmailEngagementScore(lead, 'email_open');
        scoringFactors.push({
          name: 'emailOpens',
          value: emailOpenScore,
          weight: factors.emailOpens.weight,
          description: factors.emailOpens.description
        });
      }

      if (factors.emailClicks?.weight > 0) {
        const emailClickScore = this.calculateEmailEngagementScore(lead, 'email_click');
        scoringFactors.push({
          name: 'emailClicks',
          value: emailClickScore,
          weight: factors.emailClicks.weight,
          description: factors.emailClicks.description
        });
      }

      // Campaign performance factor
      if (factors.campaignPerformance?.weight > 0) {
        const campaignScore = this.calculateCampaignPerformanceScore(campaign);
        scoringFactors.push({
          name: 'campaignPerformance',
          value: campaignScore,
          weight: factors.campaignPerformance.weight,
          description: factors.campaignPerformance.description
        });
      }

      // Source quality factor
      if (factors.sourceQuality?.weight > 0) {
        const sourceScore = this.calculateSourceQualityScore(lead.source);
        scoringFactors.push({
          name: 'sourceQuality',
          value: sourceScore,
          weight: factors.sourceQuality.weight,
          description: factors.sourceQuality.description
        });
      }

      // Calculate weighted score
      const totalWeight = scoringFactors.reduce((sum, factor) => sum + factor.weight, 0);
      const weightedScore = scoringFactors.reduce((sum, factor) => {
        return sum + (factor.value * factor.weight);
      }, 0);

      const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
      const confidence = this.calculateConfidence(scoringFactors);

      return {
        score: finalScore,
        factors: scoringFactors,
        confidence,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Error calculating lead score:', error);
      throw error;
    }
  }

  /**
   * Calculate form completeness percentage
   */
  calculateFormCompleteness(lead) {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle'];
    const providedFields = fields.filter(field => lead[field] && lead[field].trim() !== '');
    return Math.round((providedFields.length / fields.length) * 100);
  }

  /**
   * Calculate email quality score
   */
  calculateEmailQuality(email) {
    if (!email) return 0;

    let score = 50; // Base score

    // Check for business email domains
    const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && !businessDomains.includes(domain)) {
      score += 30; // Business email
    }

    // Check for disposable email domains
    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    if (disposableDomains.includes(domain)) {
      score -= 40; // Disposable email
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      score -= 20; // Invalid format
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate page view score
   */
  calculatePageViewScore(pageViews) {
    if (!pageViews || pageViews === 0) return 0;
    if (pageViews >= 10) return 100;
    if (pageViews >= 5) return 80;
    if (pageViews >= 3) return 60;
    if (pageViews >= 2) return 40;
    return 20;
  }

  /**
   * Calculate time on site score
   */
  calculateTimeOnSiteScore(timeOnSite) {
    if (!timeOnSite || timeOnSite === 0) return 0;
    const minutes = timeOnSite / 60;
    
    if (minutes >= 10) return 100;
    if (minutes >= 5) return 80;
    if (minutes >= 3) return 60;
    if (minutes >= 1) return 40;
    return 20;
  }

  /**
   * Calculate bounce rate score (lower bounce rate = higher score)
   */
  calculateBounceRateScore(bounceRate) {
    if (bounceRate === undefined || bounceRate === null) return 50;
    
    if (bounceRate <= 0.2) return 100; // 20% or lower
    if (bounceRate <= 0.4) return 80;  // 40% or lower
    if (bounceRate <= 0.6) return 60;  // 60% or lower
    if (bounceRate <= 0.8) return 40;  // 80% or lower
    return 20; // Above 80%
  }

  /**
   * Calculate email engagement score
   */
  calculateEmailEngagementScore(lead, interactionType) {
    const interactions = lead.engagement?.interactions || [];
    const emailInteractions = interactions.filter(i => i.type === interactionType);
    
    if (emailInteractions.length === 0) return 0;
    if (emailInteractions.length >= 5) return 100;
    if (emailInteractions.length >= 3) return 80;
    if (emailInteractions.length >= 2) return 60;
    return 40;
  }

  /**
   * Calculate campaign performance score
   */
  calculateCampaignPerformanceScore(campaign) {
    if (!campaign || !campaign.metrics) return 50;

    const metrics = campaign.metrics;
    let score = 50; // Base score

    // CTR scoring
    if (metrics.clickThroughRate > 0.05) score += 20; // 5%+ CTR
    else if (metrics.clickThroughRate > 0.02) score += 10; // 2%+ CTR

    // Conversion rate scoring
    if (metrics.conversionRate > 0.1) score += 20; // 10%+ conversion
    else if (metrics.conversionRate > 0.05) score += 10; // 5%+ conversion

    // Cost efficiency
    if (metrics.costPerConversion < 50) score += 10; // Low cost per conversion

    return Math.min(100, score);
  }

  /**
   * Calculate source quality score
   */
  calculateSourceQualityScore(source) {
    const sourceScores = {
      'facebook': 85,
      'instagram': 80,
      'google': 90,
      'manual': 70,
      'other': 50
    };

    return sourceScores[source] || 50;
  }

  /**
   * Calculate confidence score based on available data
   */
  calculateConfidence(factors) {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const dataPoints = factors.filter(factor => factor.value > 0).length;
    const confidence = (dataPoints / factors.length) * (totalWeight / 1.0);
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Get scoring explanation for a lead
   */
  getScoringExplanation(lead, scoringResult) {
    const explanation = {
      totalScore: scoringResult.score,
      confidence: scoringResult.confidence,
      factors: scoringResult.factors.map(factor => ({
        name: factor.name,
        score: factor.value,
        weight: factor.weight,
        description: factor.description,
        impact: Math.round(factor.value * factor.weight)
      })),
      recommendations: this.getRecommendations(scoringResult.factors)
    };

    return explanation;
  }

  /**
   * Get recommendations based on scoring factors
   */
  getRecommendations(factors) {
    const recommendations = [];

    factors.forEach(factor => {
      if (factor.value < 50) {
        switch (factor.name) {
          case 'formCompleteness':
            recommendations.push('Encourage users to complete more form fields');
            break;
          case 'emailQuality':
            recommendations.push('Verify email address quality and validity');
            break;
          case 'phoneProvided':
            recommendations.push('Request phone number to improve lead quality');
            break;
          case 'companyProvided':
            recommendations.push('Ask for company information');
            break;
          case 'pageViews':
            recommendations.push('Improve content to increase page engagement');
            break;
          case 'timeOnSite':
            recommendations.push('Create more engaging content to increase time on site');
            break;
          case 'bounceRate':
            recommendations.push('Improve landing page relevance and user experience');
            break;
        }
      }
    });

    return recommendations;
  }
}

module.exports = new ScoringService();