import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FolderKanban, FileText, Star } from 'lucide-react';
import type { EmployeeMetrics } from '../types';

interface MetricsOverviewProps {
  metrics: EmployeeMetrics;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Hours',
      value: metrics.totalHours.toFixed(1),
      icon: <Clock className="w-8 h-8" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      title: 'Projects',
      value: metrics.totalProjects.toString(),
      icon: <FolderKanban className="w-8 h-8" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Tickets',
      value: metrics.totalTickets.toString(),
      icon: <FileText className="w-8 h-8" />,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      title: 'Note Quality',
      value: metrics.averageNoteQuality.toFixed(0),
      icon: <Star className="w-8 h-8" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      suffix: '/100',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient mb-6">Metrics Overview</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-bright p-6 rounded-2xl ${card.bgColor} border border-white/20`}
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color}`}>{card.icon}</div>
            </div>
            <div className={`text-3xl font-bold ${card.color} mb-1`}>
              {card.value}
              {card.suffix && (
                <span className="text-lg text-gray-400">{card.suffix}</span>
              )}
            </div>
            <div className="text-gray-300 text-sm">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Additional summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-bright p-6 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <span className="text-purple-300">Employee:</span>{' '}
            <span className="text-white">{metrics.memberName}</span>
          </div>
          <div>
            <span className="text-purple-300">Average Hours per Project:</span>{' '}
            <span className="text-white">
              {metrics.totalProjects > 0
                ? (metrics.totalHours / metrics.totalProjects).toFixed(1)
                : '0'}{' '}
              hours
            </span>
          </div>
          <div>
            <span className="text-purple-300">Total Time Entries:</span>{' '}
            <span className="text-white">{metrics.timeEntries.length}</span>
          </div>
          <div>
            <span className="text-purple-300">Average Hours per Ticket:</span>{' '}
            <span className="text-white">
              {metrics.totalTickets > 0
                ? (metrics.totalHours / metrics.totalTickets).toFixed(1)
                : '0'}{' '}
              hours
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsOverview;

