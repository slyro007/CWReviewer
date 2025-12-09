import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, TrendingUp, FileText } from 'lucide-react';
import EmployeeSelector from './EmployeeSelector';
import MetricsOverview from './MetricsOverview';
import TimeTrackingView from './TimeTrackingView';
import ProjectContributions from './ProjectContributions';
import NotesReview from './NotesReview';
import ComparisonView from './ComparisonView';
import TrendsView from './TrendsView';
import HighlightsPanel from './HighlightsPanel';
import PerformanceReview from './PerformanceReview';
import WorkExport from './WorkExport';
import { connectwiseService } from '../services/connectwiseService';
import type { ConnectWiseMember, EmployeeMetrics } from '../types';

type ViewType =
  | 'overview'
  | 'time'
  | 'projects'
  | 'notes'
  | 'comparison'
  | 'trends'
  | 'highlights'
  | 'review'
  | 'export';

const Dashboard: React.FC = () => {
  const [selectedMembers, setSelectedMembers] = useState<ConnectWiseMember[]>([]);
  const [members, setMembers] = useState<ConnectWiseMember[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [employeeMetrics, setEmployeeMetrics] = useState<EmployeeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test API connection on mount
    if (import.meta.env.DEV) {
      import('../utils/testConnectWiseAPI').then(({ testConnectWiseAPI }) => {
        testConnectWiseAPI();
      });
    }
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to discover company info first
      try {
        const companyInfo = await connectwiseService.discoverCompanyInfo();
        if (companyInfo) {
          console.log('Company Info:', companyInfo);
        }
      } catch (e) {
        console.log('Could not get company info:', e);
      }
      
      const data = await connectwiseService.getMembers();
      setMembers(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data || err?.message || 'Unknown error';
      console.error('Error loading members:', err);
      console.error('Full error details:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: err?.message,
      });
      
      if (errorMessage.includes('Cannot route') || errorMessage.includes('company is invalid')) {
        setError('Company ID format may be incorrect. Please verify the company identifier in ConnectWise Manage matches exactly (case-sensitive).');
      } else if (err?.response?.status === 401) {
        setError('Authentication failed. Please verify your API keys (Public Key and Private Key) are correct.');
      } else {
        setError(`Failed to load employees: ${errorMessage}. Please check your API credentials and company ID.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = useCallback((member: ConnectWiseMember) => {
    setSelectedMembers([member]);
    setCurrentView('overview');
    loadEmployeeData(member.id, member.identifier);
  }, []);

  const handleMultiSelect = useCallback((members: ConnectWiseMember[]) => {
    setSelectedMembers(members);
    if (members.length > 1) {
      setCurrentView('comparison');
    } else if (members.length === 1) {
      setCurrentView('overview');
      loadEmployeeData(members[0].id, members[0].identifier);
    }
  }, []);

  const loadEmployeeData = async (memberId: number, memberName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch time entries
      const timeEntries = await connectwiseService.getTimeEntries(memberId);

      // Group by projects
      const projectIds = [
        ...new Set(
          timeEntries.filter((e) => e.projectId).map((e) => e.projectId!)
        ),
      ];
      const projects = await connectwiseService.getProjects(projectIds);

      // Calculate metrics (simplified for now)
      const totalHours = timeEntries.reduce(
        (sum, e) => sum + (e.actualHours || 0),
        0
      );
      const uniqueProjects = new Set(
        timeEntries.filter((e) => e.projectId).map((e) => e.projectId!)
      );

      const metrics: EmployeeMetrics = {
        memberId,
        memberName,
        totalHours,
        totalProjects: uniqueProjects.size,
        totalTickets: new Set(
          timeEntries.filter((e) => e.ticketId).map((e) => e.ticketId!)
        ).size,
        averageNoteQuality: 0, // Will be calculated when notes are loaded
        timeEntries,
        projects: projects.map((p) => ({
          projectId: p.id,
          projectName: p.name,
          totalHours: timeEntries
            .filter((e) => e.projectId === p.id)
            .reduce((sum, e) => sum + (e.actualHours || 0), 0),
          entries: timeEntries.filter((e) => e.projectId === p.id),
          project: p,
        })),
        notes: [],
      };

      setEmployeeMetrics(metrics);
    } catch (err) {
      setError('Failed to load employee data.');
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'time', label: 'Time Tracking', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FileText className="w-5 h-5" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { id: 'comparison', label: 'Compare', icon: <Users className="w-5 h-5" /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'highlights', label: 'Highlights', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'review', label: 'Performance Review', icon: <FileText className="w-5 h-5" /> },
    { id: 'export', label: 'Export', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">
          ConnectWise Analytics Dashboard
        </h1>
        <p className="text-purple-300">
          Comprehensive employee performance analytics and insights
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-bright p-6 rounded-2xl mb-6">
            <EmployeeSelector
              members={members}
              selectedMembers={selectedMembers}
              onSelect={handleMemberSelect}
              onMultiSelect={handleMultiSelect}
              loading={loading}
            />
          </div>

          {/* Navigation */}
          <div className="glass-bright p-4 rounded-2xl">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Navigation</h3>
            <div className="space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-dark border border-red-400/30 p-4 rounded-lg mb-6 text-red-300"
            >
              {error}
            </motion.div>
          )}

          {loading && (
            <div className="glass-bright p-12 rounded-2xl text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-cyan-300">Loading data...</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {currentView === 'overview' && employeeMetrics && (
                <MetricsOverview metrics={employeeMetrics} />
              )}
              {currentView === 'time' && employeeMetrics && (
                <TimeTrackingView metrics={employeeMetrics} />
              )}
              {currentView === 'projects' && employeeMetrics && (
                <ProjectContributions metrics={employeeMetrics} />
              )}
              {currentView === 'notes' && employeeMetrics && (
                <NotesReview metrics={employeeMetrics} />
              )}
              {currentView === 'comparison' && selectedMembers.length > 0 && (
                <ComparisonView memberIds={selectedMembers.map((m) => m.id)} />
              )}
              {currentView === 'trends' && employeeMetrics && (
                <TrendsView metrics={employeeMetrics} />
              )}
              {currentView === 'highlights' && employeeMetrics && (
                <HighlightsPanel metrics={employeeMetrics} />
              )}
              {currentView === 'review' && employeeMetrics && (
                <PerformanceReview metrics={employeeMetrics} />
              )}
              {currentView === 'export' && employeeMetrics && (
                <WorkExport metrics={employeeMetrics} />
              )}
              {!employeeMetrics && selectedMembers.length === 0 && (
                <div className="glass-bright p-12 rounded-2xl text-center">
                  <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-300">
                    Select an employee to view their analytics
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

