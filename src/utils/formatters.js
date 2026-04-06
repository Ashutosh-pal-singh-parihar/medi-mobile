import { RISK_CONFIG } from '../config/constants';

/**
 * Formats an ISO date string into a user-friendly format:
 * "Today", "Yesterday", or "Jan 15" format
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === date.getDate()) return 'Today';
  if (diffDays === 1 || (diffDays === 0 && now.getDate() !== date.getDate())) return 'Yesterday';

  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats duration in seconds to "M:SS" or "MM:SS" format
 */
export const formatDuration = (seconds) => {
  if (typeof seconds !== 'number') return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats risk level identifier into display label
 */
export const formatRiskLabel = (riskLevel) => {
  return RISK_CONFIG[riskLevel]?.label || 'UNKNOWN RISK';
};

/**
 * Returns a relative time string like "2 hours ago" or "3 days ago"
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return formatDate(isoString);
};

/**
 * Formats patient age to "X years old"
 */
export const formatPatientAge = (input) => {
  if (!input) return '';
  
  // If input is a full DOB string
  if (typeof input === 'string' && input.includes('-')) {
    const birthDate = new Date(input);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return `${age} years old`;
  }
  
  // If input is already just a number (age)
  return `${input} years old`;
};
