import React from 'react';
import { useQuery } from 'react-query';
import { 
  UsersIcon, 
  MegaphoneIcon, 
  ChartBarIcon, 
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { analyticsApi } from '../services/api';
import { DashboardAnalytics } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatsCard from '../components/StatsCard';
import RecentLeads from '../components/RecentLeads';
import TopCampaigns from '../components/TopCampaigns';
import ConversionChart from '../components/ConversionChart';
import LeadQualityChart from '../components/LeadQualityChart';

const Dashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery<DashboardAnalytics>(
    'dashboard-analytics',
    () => analyticsApi.getDashboard().then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load dashboard data" />;
  }

  if (!analytics) {
    return <ErrorMessage message="No data available" />;
  }

  const { overview, distribution, conversions, recentLeads, topCampaigns, trends } = analytics;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your lead scoring performance and key metrics
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={overview.totalLeads.toLocaleString()}
          icon={UsersIcon}
          change={null}
          color="blue"
        />
        <StatsCard
          title="Active Campaigns"
          value={overview.activeCampaigns.toLocaleString()}
          icon={MegaphoneIcon}
          change={null}
          color="green"
        />
        <StatsCard
          title="Average Score"
          value={`${overview.avgScore}%`}
          icon={ChartBarIcon}
          change={null}
          color="purple"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversions.conversionRate}%`}
          icon={TrendingUpIcon}
          change={null}
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConversionChart data={trends.leadsOverTime} />
        <LeadQualityChart data={distribution.byStatus} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentLeads leads={recentLeads} />
        <TopCampaigns campaigns={topCampaigns} />
      </div>

      {/* Distribution cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Leads by Status</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {distribution.byStatus.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item._id.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Leads by Source</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {distribution.bySource.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item._id}
                  </span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Leads by Priority</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {distribution.byPriority.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item._id}
                  </span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;