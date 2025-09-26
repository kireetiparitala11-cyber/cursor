import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Lead } from '../types';

interface RecentLeadsProps {
  leads: Lead[];
}

const RecentLeads: React.FC<RecentLeadsProps> = ({ leads }) => {
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace('_', '-')}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
          <Link
            to="/leads"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="card-body p-0">
        {leads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No recent leads</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <div key={lead._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                        <p className="text-sm text-gray-500 truncate">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getScoreClass(lead.score.current)}>
                      {lead.score.current}%
                    </span>
                    <span className={getStatusClass(lead.status)}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{lead.campaign.name}</span>
                  <span>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentLeads;