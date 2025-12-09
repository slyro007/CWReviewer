import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Copy, CheckCircle, Sparkles } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import { aiService } from '../services/aiService';
import { AI_CONFIG } from '../config/api';

interface GoalsGeneratorProps {
  metrics: EmployeeMetrics;
}

const GoalsGenerator: React.FC<GoalsGeneratorProps> = ({ metrics }) => {
  const [aiGoals, setAiGoals] = useState<string[] | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [useAI, setUseAI] = useState(AI_CONFIG.enabled);

  useEffect(() => {
    if (useAI && AI_CONFIG.enabled && !aiGoals) {
      loadAIGoals();
    }
  }, [useAI, metrics]);

  const loadAIGoals = async () => {
    setLoadingAI(true);
    try {
      const goals = await aiService.generateGoals(metrics);
      if (goals && goals.length > 0) {
        setAiGoals(goals);
      }
    } catch (error) {
      console.error('Failed to load AI goals:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const defaultGoals = useMemo(() => {
    const items: string[] = [];

    // Note quality improvement
    if (metrics.averageNoteQuality < 70) {
      items.push(
        `Improve documentation quality by aiming for an average note quality score of 75+ by focusing on detail, structure, and technical accuracy.`
      );
    }

    // Project expansion
    if (metrics.totalProjects < 15) {
      items.push(
        `Expand project portfolio by contributing to at least 5 additional projects to broaden technical expertise and team collaboration.`
      );
    }

    // Efficiency goals
    const avgHoursPerEntry = metrics.timeEntries.length > 0
      ? metrics.totalHours / metrics.timeEntries.length
      : 0;
    if (avgHoursPerEntry < 1) {
      items.push(
        `Improve work efficiency by consolidating related tasks and reducing administrative overhead, aiming for more focused time entries.`
      );
    }

    // Skill development
    items.push(
      `Continue professional development by taking on projects that challenge current skill set and expand technical knowledge in emerging technologies.`
    );

    // Quality focus
    if (metrics.averageNoteQuality < 80) {
      items.push(
        `Enhance attention to detail in all work products, with a specific focus on improving documentation quality and completeness.`
      );
    }

    // Collaboration
    items.push(
      `Strengthen collaboration skills by actively participating in team projects and knowledge sharing sessions.`
    );

    // Consistency
    items.push(
      `Maintain consistent work output and continue building on the strong foundation of ${metrics.totalHours.toFixed(0)} hours of quality work.`
    );

    return items;
  }, [metrics]);

  const goals = useAI && aiGoals && aiGoals.length > 0 ? aiGoals : defaultGoals;

  const handleCopy = () => {
    const text = goals.join('\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-cyan-400">
            5. Goals/Accomplishments for next review
          </h3>
          {AI_CONFIG.enabled && (
            <button
              onClick={() => {
                setUseAI(!useAI);
                if (!useAI && !aiGoals) {
                  loadAIGoals();
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
          {useAI && aiGoals
            ? 'AI-powered goals based on comprehensive performance analysis'
            : 'Suggested goals based on your current performance and areas for growth'}
        </p>
      </div>

      <div className="glass-dark p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Suggested Goals
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
          {goals.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 flex-1">{goal}</p>
              <button
                onClick={() => navigator.clipboard.writeText(goal)}
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
          defaultValue={goals.join('\n\n')}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none min-h-[200px]"
          placeholder="Edit the suggested goals or add your own..."
        />
      </div>
    </div>
  );
};

export default GoalsGenerator;

