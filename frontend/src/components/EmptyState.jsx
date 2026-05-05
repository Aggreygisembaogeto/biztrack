import React from 'react';
import { FiPlus } from 'react-icons/fi';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      {Icon && (
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-orange-500" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/30"
          >
            <FiPlus size={20} />
            {actionLabel}
          </button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
