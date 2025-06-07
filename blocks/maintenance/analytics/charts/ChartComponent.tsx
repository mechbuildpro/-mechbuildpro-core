import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, color = '#3B82F6' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="h-48 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: color,
                opacity: 0.8,
              }}
            />
            <span className="text-xs text-gray-500 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, color = '#3B82F6' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / maxValue) * 100,
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="h-48 relative">
        <svg className="w-full h-full">
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="3"
              fill={color}
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}; 