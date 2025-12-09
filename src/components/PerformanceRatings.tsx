import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import type { EmployeeMetrics, PerformanceRating } from '../types';
import { aiService } from '../services/aiService';
import { AI_CONFIG } from '../config/api';

interface PerformanceRatingsProps {
  metrics: EmployeeMetrics;
}

const PerformanceRatings: React.FC<PerformanceRatingsProps> = ({ metrics }) => {
  const [aiRatings, setAiRatings] = useState<PerformanceRating[] | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [useAI, setUseAI] = useState(AI_CONFIG.enabled);

  useEffect(() => {
    if (useAI && AI_CONFIG.enabled && !aiRatings) {
      loadAIRatings();
    }
  }, [useAI, metrics]);

  const loadAIRatings = async () => {
    setLoadingAI(true);
    try {
      const ratings = await aiService.generatePerformanceRatings(metrics);
      if (ratings && ratings.length > 0) {
        setAiRatings(ratings);
      }
    } catch (error) {
      console.error('Failed to load AI ratings:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const defaultRatings = useMemo((): PerformanceRating[] => {
    // Job Knowledge - based on project diversity and technical complexity
    const projectDiversity = metrics.totalProjects;
    const jobKnowledgeScore = Math.min(4, Math.max(1, Math.floor(projectDiversity / 5) + 2));
    const jobKnowledgeRating: PerformanceRating = {
      criterion: 'Job Knowledge',
      rating:
        jobKnowledgeScore === 4
          ? 'Exceeds Expectations'
          : jobKnowledgeScore === 3
          ? 'Good'
          : jobKnowledgeScore === 2
          ? 'Meets Expectations'
          : 'Needs Work',
      evidence: [
        `Contributed to ${metrics.totalProjects} different projects`,
        `Handled ${metrics.totalTickets} tickets across various areas`,
        projectDiversity > 10
          ? 'Demonstrates broad technical knowledge across multiple domains'
          : 'Shows solid understanding of core responsibilities',
      ],
      score: jobKnowledgeScore,
    };

    // Productivity - based on total hours and consistency
    const productivityScore = Math.min(
      4,
      Math.max(1, Math.floor(metrics.totalHours / 250) + 1)
    );
    const productivityRating: PerformanceRating = {
      criterion: 'Productivity',
      rating:
        productivityScore === 4
          ? 'Exceeds Expectations'
          : productivityScore === 3
          ? 'Good'
          : productivityScore === 2
          ? 'Meets Expectations'
          : 'Needs Work',
      evidence: [
        `Logged ${metrics.totalHours.toFixed(1)} total hours`,
        `Completed ${metrics.timeEntries.length} time entries`,
        metrics.timeEntries.length > 100
          ? 'Consistent and reliable work output'
          : 'Steady contribution to team goals',
      ],
      score: productivityScore,
    };

    // Quality of Work - based on note quality
    const qualityScore = Math.min(
      4,
      Math.max(1, Math.floor(metrics.averageNoteQuality / 25))
    );
    const qualityRating: PerformanceRating = {
      criterion: 'Quality of Work',
      rating:
        qualityScore === 4
          ? 'Exceeds Expectations'
          : qualityScore === 3
          ? 'Good'
          : qualityScore === 2
          ? 'Meets Expectations'
          : 'Needs Work',
      evidence: [
        `Average note quality score: ${metrics.averageNoteQuality.toFixed(0)}/100`,
        metrics.averageNoteQuality > 80
          ? 'Excellent attention to detail in documentation'
          : metrics.averageNoteQuality > 60
          ? 'Good documentation practices'
          : 'Documentation could be improved',
      ],
      score: qualityScore,
    };

    // Team Skills - based on collaborative projects
    const teamScore = Math.min(4, Math.max(1, Math.floor(metrics.totalProjects / 3) + 1));
    const teamRating: PerformanceRating = {
      criterion: 'Team Skills',
      rating:
        teamScore === 4
          ? 'Exceeds Expectations'
          : teamScore === 3
          ? 'Good'
          : teamScore === 2
          ? 'Meets Expectations'
          : 'Needs Work',
      evidence: [
        `Participated in ${metrics.totalProjects} team projects`,
        'Collaborative approach to problem-solving',
        metrics.totalProjects > 15
          ? 'Strong team player with excellent collaboration'
          : 'Works well within team structure',
      ],
      score: teamScore,
    };

    // Career Development - based on growth trends (simplified)
    const careerScore = metrics.totalProjects > 10 ? 3 : 2;
    const careerRating: PerformanceRating = {
      criterion: 'Career Development',
      rating:
        careerScore === 3
          ? 'Good'
          : 'Meets Expectations',
      evidence: [
        'Shows interest in expanding skills and knowledge',
        `Diverse project experience (${metrics.totalProjects} projects)`,
        'Takes on varied responsibilities',
      ],
      score: careerScore,
    };

    // Continuous Improvement - based on note quality trends
    const improvementScore = metrics.averageNoteQuality > 70 ? 3 : 2;
    const improvementRating: PerformanceRating = {
      criterion: 'Continuous Improvement',
      rating:
        improvementScore === 3
          ? 'Good'
          : 'Meets Expectations',
      evidence: [
        'Seeks to improve processes and documentation',
        metrics.averageNoteQuality > 70
          ? 'Demonstrates commitment to quality improvement'
          : 'Shows awareness of areas for improvement',
      ],
      score: improvementScore,
    };

    // Attendance - based on time entry consistency
    const attendanceScore = metrics.timeEntries.length > 50 ? 3 : 2;
    const attendanceRating: PerformanceRating = {
      criterion: 'Attendance',
      rating:
        attendanceScore === 3
          ? 'Good'
          : 'Meets Expectations',
      evidence: [
        `Consistent time tracking with ${metrics.timeEntries.length} entries`,
        'Reliable work schedule',
        'Good attendance record',
      ],
      score: attendanceScore,
    };

    return [
      jobKnowledgeRating,
      productivityRating,
      qualityRating,
      teamRating,
      careerRating,
      improvementRating,
      attendanceRating,
    ];
  }, [metrics]);

  const ratings = useAI && aiRatings && aiRatings.length > 0 ? aiRatings : defaultRatings;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Exceeds Expectations':
        return 'text-green-400 bg-green-500/20 border-green-400/50';
      case 'Good':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-400/50';
      case 'Meets Expectations':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
      case 'Needs Work':
        return 'text-red-400 bg-red-500/20 border-red-400/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-cyan-400">
            3. Rate your job performance below
          </h3>
          {AI_CONFIG.enabled && (
            <button
              onClick={() => {
                setUseAI(!useAI);
                if (!useAI && !aiRatings) {
                  loadAIRatings();
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
          {useAI && aiRatings
            ? 'AI-powered ratings based on comprehensive analysis'
            : 'Auto-generated ratings based on your work metrics'}
        </p>
      </div>

      <div className="space-y-4">
        {ratings.map((rating: PerformanceRating, index: number) => (
          <motion.div
            key={rating.criterion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-dark p-6 rounded-xl border border-white/10"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">{rating.criterion}</h4>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRatingColor(
                    rating.rating
                  )}`}
                >
                  {rating.rating}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {rating.criterion === 'Job Knowledge' &&
                  '(Possesses the knowledge to perform the job proficiently)'}
                {rating.criterion === 'Productivity' &&
                  '(Amount of work consistently produced)'}
                {rating.criterion === 'Quality of Work' &&
                  '(Accuracy, Thoroughness, attention to detail and completeness)'}
                {rating.criterion === 'Team Skills' &&
                  '(Contributes to the team with a positive attitude, accepts responsibility, participates in team projects)'}
                {rating.criterion === 'Career Development' &&
                  '(Effort to improve knowledge and skills in IT that add value to organization/individual)'}
                {rating.criterion === 'Continuous Improvement' &&
                  '(Finds new and better ways of doing things and advocates for them)'}
                {rating.criterion === 'Attendance' &&
                  '(Works scheduled days and hours)'}
              </p>
            </div>

            {/* Rating Options */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {['Needs Work', 'Meets Expectations', 'Good', 'Exceeds Expectations'].map(
                (option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      rating.rating === option
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`rating-${rating.criterion}`}
                      value={option}
                      checked={rating.rating === option}
                      readOnly
                      className="sr-only"
                    />
                    <span className="text-sm text-center text-gray-300">{option}</span>
                  </label>
                )
              )}
            </div>

            {/* Evidence */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm font-semibold text-cyan-400 mb-2">Supporting Evidence:</div>
              <ul className="space-y-1">
                {rating.evidence.map((evidence: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceRatings;

