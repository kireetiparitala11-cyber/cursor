import React from 'react';
import { useParams } from 'react-router-dom';

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Lead Detail</h3>
          <p className="mt-1 text-sm text-gray-500">
            Lead ID: {id}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Detailed lead view coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;