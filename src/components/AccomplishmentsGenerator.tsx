import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Copy, CheckCircle, Sparkles } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import { aiService } from '../services/aiService';
import { AI_CONFIG } from '../config/api';

interface AccomplishmentsGeneratorProps {
  metrics: EmployeeMetrics;
}

const AccomplishmentsGenerator: React.FC<AccomplishmentsGeneratorProps> = ({ metrics }) => {
  const [aiAccomplishments, setAiAccomplishments] = useState<string[] | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [useAI, setUseAI] = useState(AI_CONFIG.enabled);

  useEffect(() => {
    if (useAI && AI_CONFIG.enabled && !aiAccomplishments) {
      loadAIAccomplishments();
    }
  }, [useAI, metrics]);

  const loadAIAccomplishments = async () => {
    setLoadingAI(true);
    try {
      const accomplishments = await aiService.generateAccomplishments(metrics);
      if (accomplishments && accomplishments.length > 0) {
        setAiAccomplishments(accomplishments);
      }
    } catch (error) {
      console.error('Failed to load AI accomplishments:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const defaultAccomplishments = useMemo(() => {
    const items: string[] = [];

    // Major projects
    const topProjects = metrics.projects
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
    
    if (topProjects.length > 0) {
      items.push(
        `Successfully contributed to ${topProjects.length} major projects, including "${topProjects[0].projectName}" with ${topProjects[0].totalHours.toFixed(1)} hours of dedicated work.`
      );
    }

    // Total hours milestone
    if (metrics.totalHours > 500) {
      items.push(
        `Logged over ${metrics.totalHours.toFixed(0)} total hours, demonstrating consistent commitment and productivity.`
      );
    }

    // Project diversity
    if (metrics.totalProjects > 10) {
      items.push(
        `Demonstrated versatility by contributing to ${metrics.totalProjects} different projects, showcasing adaptability and broad technical knowledge.`
      );
    }

    // Ticket resolution
    if (metrics.totalTickets > 50) {
      items.push(
        `Resolved ${metrics.totalTickets} tickets, providing timely and effective solutions to client issues.`
      );
    }

    // Note quality
    if (metrics.averageNoteQuality > 75) {
      items.push(
        `Maintained excellent documentation standards with an average note quality score of ${metrics.averageNoteQuality.toFixed(0)}/100, ensuring clear communication and knowledge transfer.`
      );
    }

    // High-impact projects
    const highImpactProjects = metrics.projects.filter(p => p.totalHours > 50);
    if (highImpactProjects.length > 0) {
      items.push(
        `Led or significantly contributed to ${highImpactProjects.length} high-impact projects, each requiring ${highImpactProjects[0].totalHours.toFixed(0)}+ hours of focused effort.`
      );
    }

    // Consistency
    if (metrics.timeEntries.length > 100) {
      items.push(
        `Maintained consistent work output with ${metrics.timeEntries.length} time entries, demonstrating reliability and dedication.`
      );
    }

    return items.length > 0 ? items : [
      'Contributed effectively to team projects and client deliverables.',
      'Maintained consistent work output and professional standards.',
      'Demonstrated commitment to quality and continuous improvement.',
    ];
  }, [metrics]);

  const accomplishments = useAI && aiAccomplishments && aiAccomplishments.length > 0 
    ? aiAccomplishments 
    : defaultAccomplishments;

  const handleCopy = () => {
    const text = accomplishments.join('\n\n');
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-cyan-400">
            4. List anything you feel was an accomplishment for yourself or your team this period.
          </h3>
          {AI_CONFIG.enabled && (
            <button
              onClick={() => {
                setUseAI(!useAI);
                if (!useAI && !aiAccomplishments) {
                  loadAIAccomplishments();
                }
              }}
              disabled={loadingAI}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                useAI
                  ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {loadingAI ? 'Loading AI...' : useAI ? 'AI Enhanced' : 'Use AI Analysis'}
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {useAI && aiAccomplishments
            ? 'AI-powered accomplishments based on comprehensive analysis'
            : 'Generated accomplishments based on your work data'}
        </p>
      </div>

      <div className="glass-dark p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Generated Accomplishments
          </h4>
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </button>
        </div>

        <div className="space-y-4">
          {accomplishments.map((accomplishment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 flex-1">{accomplishment}</p>
              <button
                onClick={() => navigator.clipboard.writeText(accomplishment)}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Copy
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-bright p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Edit Your Response</h4>
        <textarea
          defaultValue={accomplishments.join('\n\n')}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none min-h-[200px]"
          placeholder="Edit the generated accomplishments or add your own..."
        />
      </div>
    </div>
  );
};

export default AccomplishmentsGenerator;

