import React from 'react';
import { Link } from 'react-router-dom';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

interface TopCampaign {
  campaignName: string;
  platform: string;
  leadCount: number;
  avgScore: number;
  convertedCount: number;
  conversionRate: number;
}

interface TopCampaignsProps {
  campaigns: TopCampaign[];
}

const TopCampaigns: React.FC<TopCampaignsProps> = ({ campaigns }) => {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'meta':
        return 'bg-blue-100 text-blue-800';
      case 'google':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Campaigns</h3>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="card-body p-0">
        {campaigns.length === 0 ? (
          <div className="p-6 text-center">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first campaign.
            </p>
            <div className="mt-6">
              <Link
                to="/campaigns"
                className="btn-primary"
              >
                Create Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {campaign.campaignName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`badge ${getPlatformColor(campaign.platform)}`}>
                            {campaign.platform}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{campaign.leadCount}</p>
                      <p className="text-gray-500">leads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{campaign.avgScore}%</p>
                      <p className="text-gray-500">avg score</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{campaign.conversionRate}%</p>
                      <p className="text-gray-500">conversion</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCampaigns;