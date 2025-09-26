import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Advanced analytics and reporting for your lead scoring performance
        </p>
      </div>

      {/* Coming soon message */}
      <div className="card">
        <div className="card-body text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Advanced Analytics</h3>
          <p className="mt-1 text-sm text-gray-500">
            The analytics dashboard is coming soon. This will include:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
            <li>• Campaign performance analytics</li>
            <li>• Lead quality trends and insights</li>
            <li>• Conversion funnel analysis</li>
            <li>• ROI and cost-per-lead metrics</li>
            <li>• Custom reporting and exports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;