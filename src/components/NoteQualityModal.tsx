import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import type { ConnectWiseNote } from '../types';
import { formatDateTime } from '../utils/dateHelpers';
import { calculateNoteQuality, getQualityLabel, getQualityColor } from '../services/noteQualityService';

interface NoteQualityModalProps {
  note: ConnectWiseNote;
  onClose: () => void;
  onRate: (noteId: number, rating: number, comments?: string) => void;
}

const NoteQualityModal: React.FC<NoteQualityModalProps> = ({ note, onClose, onRate }) => {
  const [manualRating, setManualRating] = useState<number>(note.id ? 0 : 0);
  const [comments, setComments] = useState<string>('');

  const qualityScore = calculateNoteQuality(note);
  const label = getQualityLabel(qualityScore.overallScore);
  const color = getQualityColor(qualityScore.overallScore);

  const handleSubmit = () => {
    if (manualRating > 0) {
      onRate(note.id, manualRating, comments);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="glass-bright p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gradient">Note Quality Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Note Content */}
          <div className="glass-dark p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  {formatDateTime(note.dateCreated)}
                </div>
                {note.ticketId && (
                  <div className="text-sm text-gray-400">Ticket #{note.ticketId}</div>
                )}
                {note.projectId && (
                  <div className="text-sm text-gray-400">Project #{note.projectId}</div>
                )}
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${color} bg-opacity-20`}>
                {label} ({qualityScore.overallScore}/100)
              </div>
            </div>
            <p className="text-white whitespace-pre-wrap">{note.text}</p>
          </div>

          {/* Automated Scores */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Automated Quality Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-dark p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Length</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {qualityScore.lengthScore}
                </div>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Detail</div>
                <div className="text-2xl font-bold text-purple-400">
                  {qualityScore.detailScore}
                </div>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Structure</div>
                <div className="text-2xl font-bold text-pink-400">
                  {qualityScore.structureScore}
                </div>
              </div>
              <div className="glass-dark p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Keywords</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {qualityScore.keywordScore}
                </div>
              </div>
            </div>
          </div>

          {/* Manual Rating */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Manual Rating (Optional)
            </h4>
            <div className="glass-dark p-6 rounded-xl">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Rating (1-10)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setManualRating(rating)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        manualRating >= rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${manualRating >= rating ? 'fill-current' : ''}`}
                      />
                    </button>
                  ))}
                </div>
                {manualRating > 0 && (
                  <div className="mt-2 text-cyan-400">Selected: {manualRating}/10</div>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your feedback or observations..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={manualRating === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Rating
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoteQualityModal;

