import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import { formatDate } from '../utils/dateHelpers';

interface TimeTrackingViewProps {
  metrics: EmployeeMetrics;
}

const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({ metrics }) => {
  const [groupBy, setGroupBy] = useState<'date' | 'ticket'>('date');

  // Group by date
  const timeByDate = useMemo(() => {
    const grouped = new Map<string, number>();
    metrics.timeEntries.forEach((entry) => {
      const date = entry.timeStart.split('T')[0];
      grouped.set(date, (grouped.get(date) || 0) + (entry.actualHours || 0));
    });
    return Array.from(grouped.entries())
      .map(([date, hours]) => ({ date, hours }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }, [metrics.timeEntries]);

  // Group by ticket
  const timeByTicket = useMemo(() => {
    const grouped = new Map<number, number>();
    metrics.timeEntries.forEach((entry) => {
      if (entry.ticketId) {
        grouped.set(
          entry.ticketId,
          (grouped.get(entry.ticketId) || 0) + (entry.actualHours || 0)
        );
      }
    });
    return Array.from(grouped.entries())
      .map(([ticketId, hours]) => ({
        ticketId: `Ticket ${ticketId}`,
        hours,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10); // Top 10 tickets
  }, [metrics.timeEntries]);

  const COLORS = ['#00f0ff', '#ff00ff', '#ff00aa', '#00ffaa', '#ffaa00'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gradient">Time Tracking</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('date')}
            className={`px-4 py-2 rounded-lg transition-all ${
              groupBy === 'date'
                ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            By Date
          </button>
          <button
            onClick={() => setGroupBy('ticket')}
            className={`px-4 py-2 rounded-lg transition-all ${
              groupBy === 'ticket'
                ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            By Ticket
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright p-6 rounded-2xl bg-cyan-500/20 border border-cyan-400/30"
        >
          <Clock className="w-8 h-8 text-cyan-400 mb-4" />
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {metrics.totalHours.toFixed(1)}
          </div>
          <div className="text-gray-300 text-sm">Total Hours</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-bright p-6 rounded-2xl bg-purple-500/20 border border-purple-400/30"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {metrics.timeEntries.length}
          </div>
          <div className="text-gray-300 text-sm">Time Entries</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-bright p-6 rounded-2xl bg-pink-500/20 border border-pink-400/30"
        >
          <Clock className="w-8 h-8 text-pink-400 mb-4" />
          <div className="text-3xl font-bold text-pink-400 mb-1">
            {metrics.timeEntries.length > 0
              ? (metrics.totalHours / metrics.timeEntries.length).toFixed(1)
              : '0'}
          </div>
          <div className="text-gray-300 text-sm">Avg Hours/Entry</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-bright p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            {groupBy === 'date' ? 'Hours Over Time' : 'Top Tickets by Hours'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupBy === 'date' ? timeByDate : timeByTicket}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis
                dataKey={groupBy === 'date' ? 'date' : 'ticketId'}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
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
              <Bar dataKey="hours" fill="#00f0ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-bright p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-purple-400 mb-4">
            Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeByTicket.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ ticketId, hours }) => `${ticketId}: ${hours.toFixed(1)}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="hours"
              >
                {timeByTicket.slice(0, 5).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Entries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-bright p-6 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Recent Time Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-gray-300">Hours</th>
                <th className="text-left py-3 px-4 text-gray-300">Ticket</th>
                <th className="text-left py-3 px-4 text-gray-300">Notes</th>
              </tr>
            </thead>
            <tbody>
              {metrics.timeEntries
                .sort((a, b) => new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime())
                .slice(0, 10)
                .map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(entry.timeStart)}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">
                      {entry.actualHours?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {entry.ticketId ? `#${entry.ticketId}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {entry.notes ? entry.notes.substring(0, 50) + '...' : '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeTrackingView;

