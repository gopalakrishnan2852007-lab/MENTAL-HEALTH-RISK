import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineData {
  time: string;
  avgStress?: number;
}

export default function RiskTimelineChart({ data }: { data: TimelineData[] }) {

  const chartData = data && data.length > 0 ? data : [
    { time: 'T-00:00', avgStress: 0 },
    { time: 'T-05:00', avgStress: 0 },
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#1e293b', fontSize: '13px', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}
          />
          <Area 
            type="monotone" 
            dataKey="avgStress" 
            stroke="#2563eb" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorStress)" 
            name="Avg Risk Score" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
