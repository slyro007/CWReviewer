import React, { useMemo, useState, useEffect } from 'react';
import { MessageSquare, Copy, Sparkles } from 'lucide-react';
import type { EmployeeMetrics } from '../types';
import { aiService } from '../services/aiService';
import { AI_CONFIG } from '../config/api';

interface FeedbackHelperProps {
  metrics: EmployeeMetrics;
}

const FeedbackHelper: React.FC<FeedbackHelperProps> = ({ metrics }) => {
  const [aiCompanyFeedback, setAiCompanyFeedback] = useState<string | null>(null);
  const [aiLeadershipFeedback, setAiLeadershipFeedback] = useState<string | null>(null);
  const [aiTeamFeedback, setAiTeamFeedback] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(AI_CONFIG.enabled);

  const loadAIFeedback = async (type: 'company' | 'leadership' | 'team') => {
    try {
      const feedback = await aiService.generateFeedback(type, metrics);
      if (feedback) {
        if (type === 'company') setAiCompanyFeedback(feedback);
        else if (type === 'leadership') setAiLeadershipFeedback(feedback);
        else setAiTeamFeedback(feedback);
      }
    } catch (error) {
      console.error(`Failed to load AI ${type} feedback:`, error);
    }
  };

  useEffect(() => {
    if (useAI && AI_CONFIG.enabled) {
      if (!aiCompanyFeedback) loadAIFeedback('company');
      if (!aiLeadershipFeedback) loadAIFeedback('leadership');
      if (!aiTeamFeedback) loadAIFeedback('team');
    }
  }, [useAI, metrics]);

  const defaultCompanyFeedback = useMemo(() => {
    return `Based on my work experience, the company is performing well with strong project management and clear communication channels. The support structure allows for effective collaboration and knowledge sharing. I've been able to contribute to ${metrics.totalProjects} projects and resolve ${metrics.totalTickets} tickets, which demonstrates the company's ability to provide meaningful work opportunities and maintain a productive environment.`;
  }, [metrics]);

  const defaultLeadershipFeedback = useMemo(() => {
    return `I appreciate the leadership's support in providing diverse project opportunities and maintaining clear communication. The ability to work across ${metrics.totalProjects} different projects has been valuable for my professional growth. Suggestions for improvement: continue providing opportunities for skill development and consider implementing more structured feedback mechanisms to help team members track their progress and identify areas for improvement.`;
  }, [metrics]);

  const defaultTeamFeedback = useMemo(() => {
    return `The team demonstrates strong collaboration and technical expertise. Working together on multiple projects has been a positive experience. The team's commitment to quality work and knowledge sharing creates a supportive environment. Areas for continued focus: maintaining consistent documentation standards and ensuring all team members have access to necessary resources and training opportunities.`;
  }, [metrics]);

  const companyFeedback = useAI && aiCompanyFeedback ? aiCompanyFeedback : defaultCompanyFeedback;
  const leadershipFeedback = useAI && aiLeadershipFeedback ? aiLeadershipFeedback : defaultLeadershipFeedback;
  const teamFeedback = useAI && aiTeamFeedback ? aiTeamFeedback : defaultTeamFeedback;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* AI Toggle */}
      {AI_CONFIG.enabled && (
        <div className="glass-bright p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">AI-Enhanced Feedback</span>
            <button
              onClick={() => {
                setUseAI(!useAI);
                if (!useAI) {
                  loadAIFeedback('company');
                  loadAIFeedback('leadership');
                  loadAIFeedback('team');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                useAI
                  ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {useAI ? 'AI Enhanced' : 'Use AI Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* Company Performance */}
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">
          6. How do you feel the company is performing?
        </h3>
        <div className="glass-dark p-6 rounded-xl border border-white/10 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Suggested Response
            </h4>
            <button
              onClick={() => handleCopy(companyFeedback)}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{companyFeedback}</p>
        </div>
        <textarea
          defaultValue={companyFeedback}
          className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none min-h-[150px]"
          placeholder="Edit your response..."
        />
      </div>

      {/* Leadership Feedback */}
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">
          7. List any feedback you have for leadership
        </h3>
        <div className="glass-dark p-6 rounded-xl border border-white/10 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Suggested Response
            </h4>
            <button
              onClick={() => handleCopy(leadershipFeedback)}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{leadershipFeedback}</p>
        </div>
        <textarea
          defaultValue={leadershipFeedback}
          className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none min-h-[150px]"
          placeholder="Edit your response..."
        />
      </div>

      {/* Team Feedback */}
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">
          8. List any feedback you have for your team and their performance
        </h3>
        <div className="glass-dark p-6 rounded-xl border border-white/10 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Suggested Response
            </h4>
            <button
              onClick={() => handleCopy(teamFeedback)}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{teamFeedback}</p>
        </div>
        <textarea
          defaultValue={teamFeedback}
          className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none min-h-[150px]"
          placeholder="Edit your response..."
        />
      </div>
    </div>
  );
};

export default FeedbackHelper;

