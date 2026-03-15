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
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-cyan-700/50 p-3 rounded-lg shadow-lg font-mono text-xs">
        <p className="text-slate-300 mb-1">{`T-${label}`}</p>
        <p className="text-cyan-400 font-bold">{`Flux: ${payload[0].value.toFixed(2)} T`}</p>
        <p className="text-emerald-400 font-bold">{`Alt: ${payload[1].value.toFixed(1)} mm`}</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
            tickMargin={10}
            stroke="#334155" 
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }} 
            stroke="#06b6d4" 
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: '#34d399', fontSize: 10, fontFamily: 'monospace' }} 
            stroke="#34d399" 
            domain={[0, 600]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="magnetic_flux" 
            stroke={isCritical ? "#ef4444" : "#06b6d4"} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="altitude" 
            stroke={isCritical ? "#f87171" : "#34d399"} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
