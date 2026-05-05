import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

const HelpTooltip = ({ content, position = 'top' }) => {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-orange-500 transition-colors"
        aria-label="Help"
      >
        <FiHelpCircle size={16} />
      </button>

      {show && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl animate-fadeIn`}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
                position === 'top'
                  ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'bottom'
                  ? 'top-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'left'
                  ? 'right-[-4px] top-1/2 -translate-y-1/2'
                  : 'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
