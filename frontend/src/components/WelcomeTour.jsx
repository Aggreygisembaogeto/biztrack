import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight, FiCheck } from 'react-icons/fi';

const WelcomeTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenWelcomeTour');
    if (!hasSeenTour) {
      setShow(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to BizTrack! 🎉",
      description: "Let's take a quick tour to help you get started with managing your business efficiently.",
      icon: "👋",
      action: "Get Started"
    },
    {
      title: "Dashboard Overview",
      description: "Your dashboard shows real-time stats including today's revenue, transactions, profit margins, and recent activity.",
      icon: "📊",
      action: "Next"
    },
    {
      title: "Quick Actions",
      description: "Use Quick Actions to rapidly record sales, add stock, or log expenses without navigating through menus.",
      icon: "⚡",
      action: "Next"
    },
    {
      title: "Inventory Management",
      description: "Track your products, monitor stock levels, and get alerts when items are running low.",
      icon: "📦",
      action: "Next"
    },
    {
      title: "Financial Tracking",
      description: "Record all income and expenses, view transaction history, and analyze your cash flow.",
      icon: "💰",
      action: "Next"
    },
    {
      title: "Reports & Analytics",
      description: "Generate detailed reports, view trends, and make data-driven decisions for your business.",
      icon: "📈",
      action: "Next"
    },
    {
      title: "You're All Set! 🚀",
      description: "You're ready to start managing your business. Remember, you can always access help from the settings menu.",
      icon: "✅",
      action: "Start Using BizTrack"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenWelcomeTour', 'true');
    setShow(false);
    if (onComplete) onComplete();
  };

  if (!show) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-slideUp">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close tour"
        >
          <FiX size={24} />
        </button>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Icon */}
        <div className="text-6xl text-center mb-6">
          {step.icon}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Skip Tour
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
          >
            {step.action}
            {currentStep < steps.length - 1 ? (
              <FiArrowRight size={20} />
            ) : (
              <FiCheck size={20} />
            )}
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-orange-500 w-8'
                  : index < currentStep
                  ? 'bg-orange-300 dark:bg-orange-700'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeTour;
