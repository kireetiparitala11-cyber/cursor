import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LeadQualityChartProps {
  data: Array<{
    _id: string;
    count: number;
  }>;
}

const LeadQualityChart: React.FC<LeadQualityChartProps> = ({ data }) => {
  const COLORS = {
    new: '#3b82f6',
    contacted: '#f59e0b',
    qualified: '#10b981',
    proposal: '#8b5cf6',
    negotiation: '#f97316',
    'closed_won': '#059669',
    'closed_lost': '#dc2626',
    unqualified: '#6b7280'
  };

  const formatData = (data: LeadQualityChartProps['data']) => {
    return data.map(item => ({
      name: item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item.count,
      color: COLORS[item._id as keyof typeof COLORS] || '#6b7280'
    }));
  };

  const chartData = formatData(data);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Leads: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Leads by Status</h3>
        <p className="mt-1 text-sm text-gray-500">
          Distribution of leads across different statuses
        </p>
      </div>
      <div className="card-body">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="h-3 w-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadQualityChart;