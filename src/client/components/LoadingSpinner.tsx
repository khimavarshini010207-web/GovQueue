import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingProps> = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-slate-600 font-medium text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2.5 p-6 text-slate-500 text-sm font-medium">
      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      <span>{message}</span>
    </div>
  );
};
