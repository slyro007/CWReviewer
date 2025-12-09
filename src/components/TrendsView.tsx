import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { EmployeeMetrics } from '../types';

interface TrendsViewProps {
  metrics: EmployeeMetrics;
}

const TrendsView: React.FC<TrendsViewProps> = ({ metrics }) => {
  // Group time entries by month
  const monthlyData = useMemo(() => {
    const monthlyHours = new Map<string, number>();
    const monthlyEntries = new Map<string, number>();

    metrics.timeEntries.forEach((entry) => {
      const monthKey = new Date(entry.timeStart).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlyHours.set(
        monthKey,
        (monthlyHours.get(monthKey) || 0) + (entry.actualHours || 0)
      );
      monthlyEntries.set(monthKey, (monthlyEntries.get(monthKey) || 0) + 1);
    });

    const sortedMonths = Array.from(monthlyHours.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return sortedMonths.map((month) => ({
      month,
      hours: monthlyHours.get(month) || 0,
      entries: monthlyEntries.get(month) || 0,
      avgHoursPerEntry:
        (monthlyHours.get(month) || 0) / (monthlyEntries.get(month) || 1),
    }));
  }, [metrics.timeEntries]);

  // Calculate trends
  const trends = useMemo(() => {
    if (monthlyData.length < 2) {
      return { hoursTrend: 0, entriesTrend: 0 };
    }

    const recent = monthlyData.slice(-3);
    const older = monthlyData.slice(-6, -3);

    const recentAvgHours = recent.reduce((sum, d) => sum + d.hours, 0) / recent.length;
    const olderAvgHours = older.length > 0 
      ? older.reduce((sum, d) => sum + d.hours, 0) / older.length 
      : recentAvgHours;

    const recentAvgEntries = recent.reduce((sum, d) => sum + d.entries, 0) / recent.length;
    const olderAvgEntries = older.length > 0
      ? older.reduce((sum, d) => sum + d.entries, 0) / older.length
      : recentAvgEntries;

    return {
      hoursTrend: ((recentAvgHours - olderAvgHours) / (olderAvgHours || 1)) * 100,
      entriesTrend: ((recentAvgEntries - olderAvgEntries) / (olderAvgEntries || 1)) * 100,
    };
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Trends Over Time</h2>
      </motion.div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-bright p-6 rounded-2xl border ${
            trends.hoursTrend >= 0
              ? 'border-green-400/30 bg-green-500/10'
              : 'border-red-400/30 bg-red-500/10'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300">Hours Trend</div>
            {trends.hoursTrend >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div
            className={`text-3xl font-bold ${
              trends.hoursTrend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trends.hoursTrend >= 0 ? '+' : ''}
            {trends.hoursTrend.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {trends.hoursTrend >= 0 ? 'Increasing' : 'Decreasing'} compared to previous period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-bright p-6 rounded-2xl border ${
            trends.entriesTrend >= 0
              ? 'border-green-400/30 bg-green-500/10'
              : 'border-red-400/30 bg-red-500/10'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300">Entries Trend</div>
            {trends.entriesTrend >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div
            className={`text-3xl font-bold ${
              trends.entriesTrend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trends.entriesTrend >= 0 ? '+' : ''}
            {trends.entriesTrend.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {trends.entriesTrend >= 0 ? 'Increasing' : 'Decreasing'} compared to previous period
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      {monthlyData.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-bright p-6 rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Hours Worked Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#00f0ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  dot={{ fill: '#00f0ff', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-bright p-6 rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Time Entries Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#ff00ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#ff00ff"
                  strokeWidth={2}
                  dot={{ fill: '#ff00ff', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHoursPerEntry"
                  stroke="#00ffaa"
                  strokeWidth={2}
                  dot={{ fill: '#00ffaa', r: 4 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      ) : (
        <div className="glass-bright p-12 rounded-2xl text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No trend data available</p>
        </div>
      )}
    </div>
  );
};

export default TrendsView;

