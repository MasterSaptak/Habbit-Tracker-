import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Log } from '../types';

interface ActivityChartProps {
  logs: Log[];
}

export const ActivityLineChart: React.FC<ActivityChartProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
        No data logged yet
      </div>
    );
  }

  // Aggregate by date (simple version)
  const data = logs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      minutes: log.durationMinutes,
      rating: log.rating
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="minutes" 
            stroke="#8b5cf6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RatingBarChart: React.FC<ActivityChartProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  const data = logs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      rating: log.rating
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 5]} ticks={[1,2,3,4,5]} />
          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
          <Bar dataKey="rating" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
