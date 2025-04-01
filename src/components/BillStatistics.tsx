import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BillStats {
  status: string;
  count: number;
}

interface BillStatisticsProps {
  bills: any[];
  onStatusClick?: (status: string | null) => void;
  selectedStatus: string | null;
}

const BillStatistics: React.FC<BillStatisticsProps> = ({ bills, onStatusClick, selectedStatus }) => {
  const getStatusStats = (): BillStats[] => {
    const statusCount = bills.reduce((acc: Record<string, number>, bill) => {
      const rawStatus = bill.status || '';
      const latestAction = bill.latestAction?.text || '';
      const statusText = (rawStatus + ' ' + latestAction).toLowerCase();

      let mappedStatus = 'In Progress';

      if (statusText.match(/enacted|became.*law|signed.*president/)) {
        mappedStatus = 'Enacted';
      } else if (statusText.match(/failed|rejected|defeated/)) {
        mappedStatus = 'Failed';
      } else if (statusText.match(/passed|agreed to|cleared for|resolution agreed/)) {
        mappedStatus = 'Passed';
      } else if (statusText.match(/reported|ordered to be reported|committee report|discharged from committee/)) {
        mappedStatus = 'Reported';
      } else if (statusText.match(/referred|committee/)) {
        mappedStatus = 'Referred';
      } else if (statusText.match(/introduced|read twice|read first time|read the first time/)) {
        mappedStatus = 'Introduced';
      }

      acc[mappedStatus] = (acc[mappedStatus] || 0) + 1;
      return acc;
    }, {});

    const statusOrder = [
      'Introduced',
      'Referred',
      'Reported',
      'In Progress',
      'Passed',
      'Failed',
      'Enacted'
    ];

    return Object.entries(statusCount)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => {
        const indexA = statusOrder.indexOf(a.status);
        const indexB = statusOrder.indexOf(b.status);
        return indexA - indexB;
      });
  };

  const stats = getStatusStats();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Enacted':
        return '#22c55e';
      case 'Failed':
        return '#ef4444';
      case 'Passed':
        return '#3b82f6';
      case 'In Progress':
        return '#f59e0b';
      case 'Reported':
        return '#8b5cf6';
      case 'Referred':
        return '#6366f1';
      case 'Introduced':
        return '#0ea5e9';
      default:
        return '#94a3b8';
    }
  };

  const handleBarClick = (data: any) => {
    if (onStatusClick) {
      onStatusClick(data.status === selectedStatus ? null : data.status);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.status}</p>
          <p className="text-gray-600">
            {data.count} bill{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bill Statistics</h3>
        <p className="text-gray-600 text-center py-8">No bills available to analyze.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Bill Status Distribution</h3>
        {selectedStatus && (
          <button
            onClick={() => onStatusClick?.(null)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <span>Clear Filter</span>
            <span className="text-xs">×</span>
          </button>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="status"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12, fill: '#4b5563' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#4b5563' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
              className="transition-all duration-200"
            >
              {stats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getStatusColor(entry.status)}
                  opacity={selectedStatus === null || selectedStatus === entry.status ? 1 : 0.5}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.status}
            onClick={() => handleBarClick(stat)}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200
              ${selectedStatus === stat.status 
                ? 'bg-gray-100 shadow-inner' 
                : 'hover:bg-gray-50 hover:shadow-sm'}`}
          >
            <div
              className="w-4 h-4 rounded transition-opacity duration-200"
              style={{
                backgroundColor: getStatusColor(stat.status),
                opacity: selectedStatus === null || selectedStatus === stat.status ? 1 : 0.5
              }}
            />
            <span className={`text-sm ${
              selectedStatus === stat.status ? 'text-gray-900 font-medium' : 'text-gray-600'
            }`}>
              {stat.status}: {stat.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BillStatistics;