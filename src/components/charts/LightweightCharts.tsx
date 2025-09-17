
import React from 'react';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  className?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  width = 400,
  height = 300,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 40) / data.length - 10;
  
  return (
    <div className={`${className} relative`}>
      <svg width={width} height={height} className="overflow-visible">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60);
          const x = 20 + index * (barWidth + 10);
          const y = height - barHeight - 40;
          
          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || '#3B82F6'}
                className="hover:opacity-80 transition-opacity"
                rx={2}
              />
              <text
                x={x + barWidth / 2}
                y={height - 20}
                textAnchor="middle"
                className="text-xs fill-current text-gray-600"
              >
                {item.name}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-current text-gray-800 font-medium"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface SimplePieChartProps {
  data: ChartData[];
  radius?: number;
  className?: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  radius = 100,
  className = ''
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const centerX = radius + 10;
  const centerY = radius + 10;
  
  return (
    <div className={`${className} relative`}>
      <svg width={radius * 2 + 20} height={radius * 2 + 20}>
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={item.name}
              d={pathData}
              fill={item.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title={`${item.name}: ${item.value}`}
            />
          );
        })}
      </svg>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color || `hsl(${index * 137.5 % 360}, 70%, 50%)` }}
            />
            <span className="text-sm text-gray-700">
              {item.name}: {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
