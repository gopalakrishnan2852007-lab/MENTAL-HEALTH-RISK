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
      <div className="bg-white/95 border border-slate-200 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md">
        <p className="text-slate-500 mb-2 font-semibold border-b border-slate-100 pb-1">{label}</p>
        <p className="text-blue-600 font-bold flex justify-between gap-4"><span>Stress Index:</span> <span>{Math.round(payload[0]?.value ?? 0)}</span></p>
        <p className="text-emerald-600 font-bold flex justify-between gap-4"><span>Sentiment:</span> <span>{(payload[1]?.value ?? 0).toFixed(2)}</span></p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            tickMargin={10}
            stroke="#e2e8f0" 
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 10 }} 
            stroke="transparent" 
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            stroke="transparent" 
            domain={[-1, 1]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="stress" 
            stroke={isCritical ? "#ef4444" : "#3b82f6"} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: isCritical ? '#ef4444' : '#3b82f6' }}
            isAnimationActive={true}
            animationDuration={300}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="sentiment" 
            stroke={isCritical ? "#f87171" : "#10b981"} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: isCritical ? '#f87171' : '#10b981' }}
            isAnimationActive={true}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
