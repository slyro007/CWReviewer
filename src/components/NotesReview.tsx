import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Filter, Search } from 'lucide-react';
import { connectwiseService } from '../services/connectwiseService';
import { calculateNoteQuality, getQualityLabel, getQualityColor } from '../services/noteQualityService';
import type { EmployeeMetrics, ConnectWiseNote, NoteQualityScore } from '../types';
import { formatDateTime } from '../utils/dateHelpers';
import NoteQualityModal from './NoteQualityModal';

interface NotesReviewProps {
  metrics: EmployeeMetrics;
}

const NotesReview: React.FC<NotesReviewProps> = ({ metrics }) => {
  const [notes, setNotes] = useState<(ConnectWiseNote & { qualityScore?: NoteQualityScore })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'excellent' | 'good' | 'average' | 'below'>('all');
  const [selectedNote, setSelectedNote] = useState<ConnectWiseNote | null>(null);
  const [manualRatings, setManualRatings] = useState<Record<number, { rating: number; comments?: string }>>({});

  useEffect(() => {
    loadNotes();
  }, [metrics]);

  useEffect(() => {
    // Load manual ratings from localStorage
    const saved = localStorage.getItem(`noteRatings_${metrics.memberId}`);
    if (saved) {
      setManualRatings(JSON.parse(saved));
    }
  }, [metrics.memberId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes: ConnectWiseNote[] = [];

      // Get notes from tickets
      const ticketIds = [...new Set(metrics.timeEntries.filter(e => e.ticketId).map(e => e.ticketId!))];
      for (const ticketId of ticketIds.slice(0, 50)) { // Limit to avoid too many requests
        try {
          const ticketNotes = await connectwiseService.getTicketNotes(ticketId);
          allNotes.push(...ticketNotes.filter(n => n.member.id === metrics.memberId));
        } catch (err) {
          console.error(`Error loading notes for ticket ${ticketId}:`, err);
        }
      }

      // Get notes from projects
      const projectIds = metrics.projects.map(p => p.projectId);
      for (const projectId of projectIds.slice(0, 50)) {
        try {
          const projectNotes = await connectwiseService.getProjectNotes(projectId);
          allNotes.push(...projectNotes.filter(n => n.member.id === metrics.memberId));
        } catch (err) {
          console.error(`Error loading notes for project ${projectId}:`, err);
        }
      }

      // Calculate quality scores
      const notesWithScores = allNotes.map(note => {
        const qualityScore = calculateNoteQuality(note);
        const manual = manualRatings[note.id];
        if (manual) {
          qualityScore.manualRating = manual.rating;
          qualityScore.manualComments = manual.comments;
        }
        return { ...note, qualityScore };
      });

      setNotes(notesWithScores);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.text.toLowerCase().includes(query) ||
        note.member.name.toLowerCase().includes(query)
      );
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      filtered = filtered.filter(note => {
        const score = note.qualityScore?.overallScore || 0;
        switch (qualityFilter) {
          case 'excellent':
            return score >= 80;
          case 'good':
            return score >= 65 && score < 80;
          case 'average':
            return score >= 50 && score < 65;
          case 'below':
            return score < 50;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      const scoreA = a.qualityScore?.overallScore || 0;
      const scoreB = b.qualityScore?.overallScore || 0;
      return scoreB - scoreA;
    });
  }, [notes, searchQuery, qualityFilter]);

  const averageQuality = useMemo(() => {
    if (notes.length === 0) return 0;
    const sum = notes.reduce((acc, note) => acc + (note.qualityScore?.overallScore || 0), 0);
    return sum / notes.length;
  }, [notes]);

  const handleManualRating = (noteId: number, rating: number, comments?: string) => {
    const updated = { ...manualRatings, [noteId]: { rating, comments } };
    setManualRatings(updated);
    localStorage.setItem(`noteRatings_${metrics.memberId}`, JSON.stringify(updated));
    
    // Update the note in the list
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, qualityScore: { ...note.qualityScore!, manualRating: rating, manualComments: comments } }
        : note
    ));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Notes Review</h2>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright p-6 rounded-2xl bg-cyan-500/20 border border-cyan-400/30"
        >
          <FileText className="w-8 h-8 text-cyan-400 mb-4" />
          <div className="text-3xl font-bold text-cyan-400 mb-1">{notes.length}</div>
          <div className="text-gray-300 text-sm">Total Notes</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-bright p-6 rounded-2xl bg-purple-500/20 border border-purple-400/30"
        >
          <Star className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {averageQuality.toFixed(0)}
          </div>
          <div className="text-gray-300 text-sm">Avg Quality Score</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-bright p-6 rounded-2xl bg-green-500/20 border border-green-400/30"
        >
          <Star className="w-8 h-8 text-green-400 mb-4" />
          <div className="text-3xl font-bold text-green-400 mb-1">
            {notes.filter(n => (n.qualityScore?.overallScore || 0) >= 80).length}
          </div>
          <div className="text-gray-300 text-sm">Excellent Notes</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-bright p-6 rounded-2xl bg-yellow-500/20 border border-yellow-400/30"
        >
          <Star className="w-8 h-8 text-yellow-400 mb-4" />
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {notes.filter(n => (n.qualityScore?.overallScore || 0) < 50).length}
          </div>
          <div className="text-gray-300 text-sm">Needs Improvement</div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-bright p-4 rounded-2xl flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'excellent', 'good', 'average', 'below'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setQualityFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                qualityFilter === filter
                  ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notes List */}
      {loading ? (
        <div className="glass-bright p-12 rounded-2xl text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-cyan-300">Loading notes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotes.map((note) => {
              const score = note.qualityScore?.overallScore || 0;
              const label = getQualityLabel(score);
              const color = getQualityColor(score);

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-bright p-6 rounded-2xl border border-white/10 hover:border-cyan-400/30 transition-all cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color} bg-opacity-20`}>
                          {label} ({score}/100)
                        </span>
                        {note.qualityScore?.manualRating && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold text-yellow-400 bg-yellow-400/20">
                            Manual: {note.qualityScore.manualRating}/10
                          </span>
                        )}
                        <span className="text-gray-400 text-sm">
                          {formatDateTime(note.dateCreated)}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap">{note.text}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                    <div>
                      {note.ticketId && <span>Ticket #{note.ticketId}</span>}
                      {note.projectId && <span>Project #{note.projectId}</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNote(note);
                      }}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="glass-bright p-12 rounded-2xl text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No notes found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Note Quality Modal */}
      {selectedNote && (
        <NoteQualityModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onRate={handleManualRating}
        />
      )}
    </div>
  );
};

export default NotesReview;

