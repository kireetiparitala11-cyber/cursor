import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

const Leads: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your lead pipeline
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/leads/new"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Coming soon message */}
      <div className="card">
        <div className="card-body text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Leads Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            The leads management interface is coming soon. This will include:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
            <li>• Real-time lead stream with filtering</li>
            <li>• Advanced lead scoring and prioritization</li>
            <li>• Lead assignment and tracking</li>
            <li>• Interaction history and notes</li>
            <li>• Conversion tracking and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leads;