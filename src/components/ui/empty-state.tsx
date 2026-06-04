import React from 'react';

interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
  return (
    <div className="text-center py-16">
      <p className="text-gray-400 font-space-grotesk">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-space-grotesk"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
