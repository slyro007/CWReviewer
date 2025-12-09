import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import { findHighlights } from '../utils/analyticsHelpers';

interface HighlightsPanelProps {
  metrics: EmployeeMetrics;
}

const HighlightsPanel: React.FC<HighlightsPanelProps> = ({ metrics }) => {
  const highlights = useMemo(() => {
    const h = findHighlights(metrics);
    
    const topProject = metrics.projects.sort((a, b) => b.totalHours - a.totalHours)[0];
    const topTicket = metrics.timeEntries
      .filter(e => e.ticketId)
      .reduce((acc, entry) => {
        const ticketId = entry.ticketId!;
        if (!acc[ticketId]) {
          acc[ticketId] = { ticketId, hours: 0, entries: [] };
        }
        acc[ticketId].hours += entry.actualHours || 0;
        acc[ticketId].entries.push(entry);
        return acc;
      }, {} as Record<number, { ticketId: number; hours: number; entries: any[] }>);
    
    const topTicketEntry = Object.values(topTicket).sort((a, b) => b.hours - a.hours)[0];

    return {
      ...h,
      topProject,
      topTicket: topTicketEntry,
      totalEntries: metrics.timeEntries.length,
      averageHoursPerEntry: metrics.timeEntries.length > 0
        ? metrics.totalHours / metrics.timeEntries.length
        : 0,
    };
  }, [metrics]);

  const highlightItems = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Total Hours',
      value: `${metrics.totalHours.toFixed(1)} hours`,
      description: 'All-time total hours worked',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Projects Contributed',
      value: `${metrics.totalProjects} projects`,
      description: 'Total number of projects',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Top Project',
      value: highlights.topProject?.projectName || 'N/A',
      description: highlights.topProject
        ? `${highlights.topProject.totalHours.toFixed(1)} hours`
        : 'No project data',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Note Quality',
      value: `${metrics.averageNoteQuality.toFixed(0)}/100`,
      description: highlights.trends.improving
        ? 'Quality is improving'
        : highlights.trends.declining
        ? 'Quality needs attention'
        : 'Quality is stable',
      color: highlights.trends.improving
        ? 'text-green-400'
        : highlights.trends.declining
        ? 'text-red-400'
        : 'text-yellow-400',
      bgColor: highlights.trends.improving
        ? 'bg-green-500/20'
        : highlights.trends.declining
        ? 'bg-red-500/20'
        : 'bg-yellow-500/20',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Average Hours per Entry',
      value: `${highlights.averageHoursPerEntry.toFixed(2)} hours`,
      description: 'Efficiency indicator',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Total Time Entries',
      value: `${highlights.totalEntries} entries`,
      description: 'All-time entries logged',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
  ];

  const achievements = useMemo(() => {
    const items: Array<{ title: string; description: string; type: 'positive' | 'warning' }> = [];

    if (metrics.totalHours > 1000) {
      items.push({
        title: '1000+ Hours Milestone',
        description: 'Outstanding commitment with over 1000 hours logged',
        type: 'positive',
      });
    }

    if (metrics.totalProjects > 20) {
      items.push({
        title: 'Multi-Project Contributor',
        description: `Contributed to ${metrics.totalProjects} different projects`,
        type: 'positive',
      });
    }

    if (metrics.averageNoteQuality > 80) {
      items.push({
        title: 'Excellent Documentation',
        description: 'Maintains high-quality notes consistently',
        type: 'positive',
      });
    }

    if (highlights.averageHoursPerEntry > 2) {
      items.push({
        title: 'Deep Work Focus',
        description: 'Spends significant time per entry, indicating thorough work',
        type: 'positive',
      });
    }

    if (metrics.averageNoteQuality < 40) {
      items.push({
        title: 'Note Quality Needs Improvement',
        description: 'Consider adding more detail and structure to notes',
        type: 'warning',
      });
    }

    if (highlights.averageHoursPerEntry < 0.5) {
      items.push({
        title: 'Low Time per Entry',
        description: 'Entries may be too brief - consider consolidating or adding detail',
        type: 'warning',
      });
    }

    return items;
  }, [metrics, highlights]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">What Stood Out</h2>
      </motion.div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlightItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-bright p-6 rounded-2xl ${item.bgColor} border border-white/20`}
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <div className={`${item.color} mb-4`}>{item.icon}</div>
            <div className={`text-2xl font-bold ${item.color} mb-2`}>
              {item.value}
            </div>
            <div className="text-white font-semibold mb-1">{item.title}</div>
            <div className="text-gray-400 text-sm">{item.description}</div>
          </motion.div>
        ))}
      </div>

      {/* Achievements & Areas for Improvement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-bright p-6 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">
          Achievements & Observations
        </h3>
        <div className="space-y-3">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`glass-dark p-4 rounded-lg border ${
                  achievement.type === 'positive'
                    ? 'border-green-400/30 bg-green-500/10'
                    : 'border-yellow-400/30 bg-yellow-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {achievement.type === 'positive' ? (
                    <Award className={`w-5 h-5 text-green-400 mt-0.5`} />
                  ) : (
                    <AlertCircle className={`w-5 h-5 text-yellow-400 mt-0.5`} />
                  )}
                  <div className="flex-1">
                    <div
                      className={`font-semibold mb-1 ${
                        achievement.type === 'positive' ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      {achievement.title}
                    </div>
                    <div className="text-gray-300 text-sm">{achievement.description}</div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-8">
              No specific achievements or observations at this time
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HighlightsPanel;

