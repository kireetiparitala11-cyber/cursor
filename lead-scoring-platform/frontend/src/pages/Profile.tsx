import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Coming soon message */}
      <div className="card">
        <div className="card-body text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            The profile management interface is coming soon. This will include:
          </p>
          <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
            <li>• Personal information management</li>
            <li>• Password and security settings</li>
            <li>• Notification preferences</li>
            <li>• Dashboard customization</li>
            <li>• API key management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;