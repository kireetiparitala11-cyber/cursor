import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const Integrations: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your advertising platforms and third-party services
        </p>
      </div>

      {/* Coming soon message */}
      <div className="card">
        <div className="card-body text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Platform Integrations</h3>
          <p className="mt-1 text-sm text-gray-500">
            The integrations management interface is coming soon. This will include:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
            <li>• Meta Ads (Facebook & Instagram) integration</li>
            <li>• Google Ads integration</li>
            <li>• Webhook configuration</li>
            <li>• API key management</li>
            <li>• Real-time data synchronization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Integrations;