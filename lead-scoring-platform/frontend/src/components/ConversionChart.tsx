import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConversionChartProps {
  data: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
    avgScore: number;
  }>;
}

const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  const formatData = (data: ConversionChartProps['data']) => {
    return data.map(item => ({
      date: `${item._id.month}/${item._id.day}`,
      leads: item.count,
      avgScore: Math.round(item.avgScore)
    }));
  };

  const chartData = formatData(data);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Leads Over Time</h3>
        <p className="mt-1 text-sm text-gray-500">
          Daily lead count and average score trends
        </p>
      </div>
      <div className="card-body">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="leads"
                orientation="left"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="score"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '500' }}
              />
              <Line
                yAxisId="leads"
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="avgScore"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Leads</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Avg Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionChart;