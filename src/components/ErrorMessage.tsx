import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors"
          aria-label="Close error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
