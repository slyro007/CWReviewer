import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Clock, TrendingUp, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmployeeMetrics } from '../types';
import { formatDate } from '../utils/dateHelpers';

interface ProjectContributionsProps {
  metrics: EmployeeMetrics;
}

type SortField = 'name' | 'hours' | 'entries';
type SortDirection = 'asc' | 'desc';

const ProjectContributions: React.FC<ProjectContributionsProps> = ({ metrics }) => {
  const [sortField, setSortField] = useState<SortField>('hours');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const sortedProjects = useMemo(() => {
    const sorted = [...metrics.projects].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'hours':
          comparison = a.totalHours - b.totalHours;
          break;
        case 'entries':
          comparison = a.entries.length - b.entries.length;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [metrics.projects, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const chartData = sortedProjects.slice(0, 10).map((p) => ({
    name: p.projectName.length > 20 ? p.projectName.substring(0, 20) + '...' : p.projectName,
    hours: p.totalHours,
    entries: p.entries.length,
  }));

  const selectedProjectData = selectedProject
    ? metrics.projects.find((p) => p.projectId === selectedProject)
    : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Project Contributions</h2>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright p-6 rounded-2xl bg-cyan-500/20 border border-cyan-400/30"
        >
          <FolderKanban className="w-8 h-8 text-cyan-400 mb-4" />
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {metrics.totalProjects}
          </div>
          <div className="text-gray-300 text-sm">Total Projects</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-bright p-6 rounded-2xl bg-purple-500/20 border border-purple-400/30"
        >
          <Clock className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {metrics.projects.reduce((sum, p) => sum + p.totalHours, 0).toFixed(1)}
          </div>
          <div className="text-gray-300 text-sm">Total Project Hours</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-bright p-6 rounded-2xl bg-pink-500/20 border border-pink-400/30"
        >
          <TrendingUp className="w-8 h-8 text-pink-400 mb-4" />
          <div className="text-3xl font-bold text-pink-400 mb-1">
            {metrics.projects.length > 0
              ? (
                  metrics.projects.reduce((sum, p) => sum + p.totalHours, 0) /
                  metrics.projects.length
                ).toFixed(1)
              : '0'}
          </div>
          <div className="text-gray-300 text-sm">Avg Hours/Project</div>
        </motion.div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-bright p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            Top Projects by Hours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis
                dataKey="name"
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
      )}

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-bright p-6 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">All Projects</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className="text-left py-3 px-4 text-gray-300 cursor-pointer hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Project Name
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-gray-300 cursor-pointer hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort('hours')}
                >
                  <div className="flex items-center gap-2">
                    Hours
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-gray-300 cursor-pointer hover:text-cyan-400 transition-colors"
                  onClick={() => handleSort('entries')}
                >
                  <div className="flex items-center gap-2">
                    Entries
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((project) => (
                <tr
                  key={project.projectId}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() =>
                    setSelectedProject(
                      selectedProject === project.projectId ? null : project.projectId
                    )
                  }
                >
                  <td className="py-3 px-4 text-white font-medium">
                    {project.projectName}
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-semibold">
                    {project.totalHours.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{project.entries.length}</td>
                  <td className="py-3 px-4">
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Project Details Modal */}
      {selectedProjectData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-bright p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gradient mb-4">
              {selectedProjectData.projectName}
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-purple-300">Total Hours:</span>{' '}
                <span className="text-cyan-400 font-semibold">
                  {selectedProjectData.totalHours.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-purple-300">Time Entries:</span>{' '}
                <span className="text-white">{selectedProjectData.entries.length}</span>
              </div>
              {selectedProjectData.project && (
                <div>
                  <span className="text-purple-300">Status:</span>{' '}
                  <span className="text-white">
                    {selectedProjectData.project.status.name}
                  </span>
                </div>
              )}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3">
                  Time Entries
                </h4>
                <div className="space-y-2">
                  {selectedProjectData.entries
                    .sort(
                      (a, b) =>
                        new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime()
                    )
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="glass-dark p-3 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">
                              {formatDate(entry.timeStart)}
                            </div>
                            {entry.notes && (
                              <div className="text-gray-400 text-sm mt-1">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                          <div className="text-cyan-400 font-semibold">
                            {entry.actualHours?.toFixed(2) || '0.00'}h
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="mt-6 btn-secondary w-full"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectContributions;

