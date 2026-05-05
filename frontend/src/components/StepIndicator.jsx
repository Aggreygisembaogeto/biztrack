import React from 'react';
import { FiCheck } from 'react-icons/fi';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-orange-500 text-white ring-4 ring-orange-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCompleted ? <FiCheck size={20} /> : index + 1}
                </div>
                <p
                  className={`mt-2 text-xs font-medium text-center ${
                    isCurrent
                      ? 'text-orange-500'
                      : isCompleted
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ marginTop: '-20px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
