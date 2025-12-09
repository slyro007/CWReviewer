import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { connectwiseService } from '../services/connectwiseService';
import { calculateEmployeeMetrics, calculateComparisonMetrics } from '../utils/analyticsHelpers';
import type { EmployeeMetrics, ComparisonData } from '../types';

interface ComparisonViewProps {
  memberIds: number[];
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ memberIds }) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberIds.length > 0) {
      loadComparisonData();
    }
  }, [memberIds]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const employees: EmployeeMetrics[] = [];

      for (const memberId of memberIds) {
        const member = await connectwiseService.getMembers().then(members => 
          members.find(m => m.id === memberId)
        );
        
        if (!member) continue;

        const timeEntries = await connectwiseService.getTimeEntries(memberId);
        const projectIds = [...new Set(timeEntries.filter(e => e.projectId).map(e => e.projectId!))];
        const projects = await connectwiseService.getProjects(projectIds);

        const metrics = calculateEmployeeMetrics(
          memberId,
          `${member.firstName} ${member.lastName}`,
          timeEntries,
          projects.map(p => ({
            projectId: p.id,
            projectName: p.name,
            totalHours: timeEntries
              .filter(e => e.projectId === p.id)
              .reduce((sum, e) => sum + (e.actualHours || 0), 0),
            entries: timeEntries.filter(e => e.projectId === p.id),
            project: p,
          })),
          0 // Note quality will be calculated separately
        );

        employees.push(metrics);
      }

      const comparisonMetrics = calculateComparisonMetrics(employees);

      setComparisonData({
        employees,
        comparisonMetrics,
      });
    } catch (err) {
      setError('Failed to load comparison data.');
      console.error('Error loading comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-bright p-12 rounded-2xl text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-cyan-300">Loading comparison data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-dark border border-red-400/30 p-6 rounded-2xl text-red-300">
        {error}
      </div>
    );
  }

  if (!comparisonData || comparisonData.employees.length === 0) {
    return (
      <div className="glass-bright p-12 rounded-2xl text-center">
        <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <p className="text-xl text-gray-300">No employees selected for comparison</p>
      </div>
    );
  }

  const chartData = comparisonData.employees.map(emp => ({
    name: emp.memberName.split(' ')[0], // First name only for chart
    hours: emp.totalHours,
    projects: emp.totalProjects,
    tickets: emp.totalTickets,
    noteQuality: emp.averageNoteQuality,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Employee Comparison</h2>
      </motion.div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright p-6 rounded-2xl bg-cyan-500/20 border border-cyan-400/30"
        >
          <div className="text-sm text-gray-300 mb-2">Average Hours</div>
          <div className="text-3xl font-bold text-cyan-400">
            {comparisonData.comparisonMetrics.averageHours.toFixed(1)}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-bright p-6 rounded-2xl bg-purple-500/20 border border-purple-400/30"
        >
          <div className="text-sm text-gray-300 mb-2">Average Projects</div>
          <div className="text-3xl font-bold text-purple-400">
            {comparisonData.comparisonMetrics.averageProjects.toFixed(1)}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-bright p-6 rounded-2xl bg-pink-500/20 border border-pink-400/30"
        >
          <div className="text-sm text-gray-300 mb-2">Average Note Quality</div>
          <div className="text-3xl font-bold text-pink-400">
            {comparisonData.comparisonMetrics.averageNoteQuality.toFixed(0)}
          </div>
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
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Hours Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
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
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Projects Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ff00ff' }}
              />
              <Bar dataKey="projects" fill="#ff00ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-bright p-6 rounded-2xl"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-300">Employee</th>
                <th className="text-left py-3 px-4 text-gray-300">Total Hours</th>
                <th className="text-left py-3 px-4 text-gray-300">Projects</th>
                <th className="text-left py-3 px-4 text-gray-300">Tickets</th>
                <th className="text-left py-3 px-4 text-gray-300">Note Quality</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.employees.map((emp, index) => {
                const hoursDiff = emp.totalHours - comparisonData.comparisonMetrics.averageHours;
                const projectsDiff = emp.totalProjects - comparisonData.comparisonMetrics.averageProjects;
                const qualityDiff = emp.averageNoteQuality - comparisonData.comparisonMetrics.averageNoteQuality;

                return (
                  <tr
                    key={emp.memberId}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{emp.memberName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-semibold">
                          {emp.totalHours.toFixed(1)}
                        </span>
                        {hoursDiff !== 0 && (
                          <span className={`text-xs ${hoursDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({hoursDiff > 0 ? '+' : ''}{hoursDiff.toFixed(1)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-semibold">{emp.totalProjects}</span>
                        {projectsDiff !== 0 && (
                          <span className={`text-xs ${projectsDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({projectsDiff > 0 ? '+' : ''}{projectsDiff.toFixed(0)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{emp.totalTickets}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400 font-semibold">
                          {emp.averageNoteQuality.toFixed(0)}
                        </span>
                        {qualityDiff !== 0 && (
                          <span className={`text-xs ${qualityDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({qualityDiff > 0 ? '+' : ''}{qualityDiff.toFixed(0)})
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ComparisonView;

