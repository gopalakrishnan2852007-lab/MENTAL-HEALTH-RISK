import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface HoverProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: HoverProps) => {
  if (active && payload && payload.length >= 2) {
    return (
      <div className="bg-slate-900 border border-cyan-700/50 p-3 rounded-lg shadow-lg font-mono text-xs">
        <p className="text-slate-500 mb-1">{`T-${label}`}</p>
        <p className="text-blue-600 font-bold">{`Stress: ${(payload[0]?.value ?? 0).toFixed(1)} idx`}</p>
        <p className="text-emerald-600 font-bold">{`Sentiment: ${(payload[1]?.value ?? 0).toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function TelemetryChart({ data, isCritical }: { data: any[], isCritical: boolean }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
            tickMargin={10}
            stroke="#cbd5e1" 
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} 
            stroke="#3b82f6" 
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} 
            stroke="#10b981" 
            domain={[-1, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="stress" 
            stroke={isCritical ? "#f97316" : "#3b82f6"} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="sentiment" 
            stroke={isCritical ? "#f87171" : "#10b981"} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
