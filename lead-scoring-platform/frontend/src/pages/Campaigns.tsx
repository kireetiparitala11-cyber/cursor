import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const Campaigns: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your advertising campaigns and integrations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/campaigns/new"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Coming soon message */}
      <div className="card">
        <div className="card-body text-center py-12">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Campaign Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            The campaign management interface is coming soon. This will include:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
            <li>• Meta Ads and Google Ads integration</li>
            <li>• Campaign performance tracking</li>
            <li>• Lead source attribution</li>
            <li>• Budget and spend monitoring</li>
            <li>• Automated lead ingestion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;