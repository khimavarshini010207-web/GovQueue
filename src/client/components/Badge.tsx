import React from 'react';
import type { AppointmentStatus, TokenStatus } from '../../shared/types.js';

interface BadgeProps {
  status: AppointmentStatus | TokenStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm === 'CONFIRMED' || norm === 'ACTIVE') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (norm === 'CHECKED_IN' || norm === 'WAITING' || norm === 'IN_QUEUE') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (norm === 'SERVING' || norm === 'CALLED') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    dotColor = 'bg-indigo-600 animate-ping';
  } else if (norm === 'COMPLETED') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'CANCELLED' || norm === 'NO_SHOW') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (norm === 'ADMIN') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  } else if (norm === 'STAFF') {
    styles = 'bg-teal-50 text-teal-700 border-teal-200';
    dotColor = 'bg-teal-500';
  } else if (norm === 'CITIZEN') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200';
    dotColor = 'bg-sky-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
