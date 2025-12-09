import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Star } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import PerformanceRatings from './PerformanceRatings';
import AccomplishmentsGenerator from './AccomplishmentsGenerator';
import GoalsGenerator from './GoalsGenerator';
import FeedbackHelper from './FeedbackHelper';

interface PerformanceReviewProps {
  metrics: EmployeeMetrics;
}

const PerformanceReview: React.FC<PerformanceReviewProps> = ({ metrics }) => {
  const [currentSection, setCurrentSection] = useState<
    'ratings' | 'accomplishments' | 'goals' | 'feedback'
  >('ratings');

  const sections = [
    { id: 'ratings' as const, label: 'Performance Ratings', icon: <Star className="w-5 h-5" /> },
    {
      id: 'accomplishments' as const,
      label: 'Accomplishments',
      icon: <FileText className="w-5 h-5" />,
    },
    { id: 'goals' as const, label: 'Goals', icon: <FileText className="w-5 h-5" /> },
    { id: 'feedback' as const, label: 'Feedback', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Performance Review Assistant</h2>
        <p className="text-gray-400 mt-2">
          AI-powered assistance for completing performance reviews
        </p>
      </motion.div>

      {/* Navigation */}
      <div className="glass-bright p-4 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentSection === section.id
                  ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="glass-bright p-6 rounded-2xl min-h-[500px]">
        {currentSection === 'ratings' && <PerformanceRatings metrics={metrics} />}
        {currentSection === 'accomplishments' && (
          <AccomplishmentsGenerator metrics={metrics} />
        )}
        {currentSection === 'goals' && <GoalsGenerator metrics={metrics} />}
        {currentSection === 'feedback' && <FeedbackHelper metrics={metrics} />}
      </div>
    </div>
  );
};

export default PerformanceReview;

