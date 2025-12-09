import type { ConnectWiseNote, NoteQualityScore } from '../types';

// Technical keywords that indicate good note quality
const TECHNICAL_KEYWORDS = [
  'resolved', 'fixed', 'configured', 'installed', 'updated', 'deployed',
  'troubleshoot', 'diagnosed', 'escalated', 'documented', 'tested',
  'verified', 'implemented', 'migrated', 'backed up', 'restored',
];

// Action items indicators
const ACTION_INDICATORS = [
  'completed', 'finished', 'done', 'resolved', 'closed', 'implemented',
  'next steps', 'follow up', 'pending', 'waiting for',
];

// Structure indicators (good formatting)
const STRUCTURE_INDICATORS = [
  '\n', '\r', '•', '-', '*', '1.', '2.', '3.', 'step', 'summary',
];

export function calculateNoteQuality(note: ConnectWiseNote): NoteQualityScore {
  const text = note.text || '';
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const charCount = text.length;

  // Length Score (0-25 points)
  // Optimal length: 50-200 words
  let lengthScore = 0;
  if (wordCount >= 10 && wordCount <= 500) {
    if (wordCount >= 50 && wordCount <= 200) {
      lengthScore = 25; // Optimal range
    } else if (wordCount >= 20 && wordCount < 50) {
      lengthScore = 15; // Good but short
    } else if (wordCount > 200 && wordCount <= 500) {
      lengthScore = 20; // Good but long
    } else {
      lengthScore = 10; // Acceptable
    }
  } else if (wordCount < 10) {
    lengthScore = 5; // Too short
  } else {
    lengthScore = 15; // Too long but still detailed
  }

  // Detail Score (0-30 points)
  // Based on technical terms, action items, and specificity
  let detailScore = 0;
  const lowerText = text.toLowerCase();

  // Technical keywords (0-15 points)
  const technicalMatches = TECHNICAL_KEYWORDS.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  ).length;
  detailScore += Math.min(15, (technicalMatches / TECHNICAL_KEYWORDS.length) * 15);

  // Action items (0-10 points)
  const actionMatches = ACTION_INDICATORS.filter((indicator) =>
    lowerText.includes(indicator.toLowerCase())
  ).length;
  detailScore += Math.min(10, (actionMatches / ACTION_INDICATORS.length) * 10);

  // Specificity (0-5 points) - numbers, dates, specific references
  const hasNumbers = /\d+/.test(text);
  const hasDates = /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text) || /\d{4}-\d{2}-\d{2}/.test(text);
  if (hasNumbers && hasDates) {
    detailScore += 5;
  } else if (hasNumbers || hasDates) {
    detailScore += 2.5;
  }

  // Structure Score (0-25 points)
  // Based on formatting, organization, and readability
  let structureScore = 0;
  const hasLineBreaks = text.includes('\n') || text.includes('\r');
  const hasBullets = /[•\-\*]/.test(text) || /^\d+\./m.test(text);
  const hasMultipleSentences = text.split(/[.!?]+/).length > 2;

  if (hasLineBreaks && hasBullets && hasMultipleSentences) {
    structureScore = 25; // Excellent structure
  } else if ((hasLineBreaks && hasBullets) || (hasLineBreaks && hasMultipleSentences)) {
    structureScore = 18; // Good structure
  } else if (hasLineBreaks || hasBullets || hasMultipleSentences) {
    structureScore = 12; // Basic structure
  } else {
    structureScore = 5; // Poor structure
  }

  // Keyword Score (0-20 points)
  // Based on relevant keywords and context
  let keywordScore = 0;
  const structureMatches = STRUCTURE_INDICATORS.filter((indicator) =>
    lowerText.includes(indicator.toLowerCase())
  ).length;
  keywordScore = Math.min(20, (structureMatches / STRUCTURE_INDICATORS.length) * 20);

  // Bonus for comprehensive notes (longer, well-structured)
  if (wordCount > 100 && structureScore > 15 && detailScore > 20) {
    keywordScore = Math.min(20, keywordScore + 5);
  }

  // Calculate overall score
  const overallScore = Math.round(
    lengthScore + detailScore + structureScore + keywordScore
  );

  return {
    noteId: note.id,
    lengthScore: Math.round(lengthScore),
    detailScore: Math.round(detailScore),
    structureScore: Math.round(structureScore),
    keywordScore: Math.round(keywordScore),
    overallScore: Math.min(100, overallScore),
  };
}

export function getQualityLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Poor';
}

export function getQualityColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 65) return 'text-cyan-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 35) return 'text-orange-400';
  return 'text-red-400';
}

