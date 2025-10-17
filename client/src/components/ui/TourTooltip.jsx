import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

const TourTooltip = () => {
  const navigate = useNavigate();
  const {
    isOnboardingActive,
    getCurrentStep,
    nextStep,
    prevStep,
    skipTour,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep
  } = useOnboarding();

  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDirection, setTooltipDirection] = useState('bottom');

  const step = getCurrentStep();

  // Handle navigation actions
  const handleNext = () => {
    if (step?.action === 'navigate' && step?.actionTarget) {
      navigate(step.actionTarget);
      // Wait for navigation to complete, then proceed to next step
      setTimeout(() => {
        nextStep();
      }, 500);
    } else {
      nextStep();
    }
  };

  useEffect(() => {
    if (!isOnboardingActive || !step) return;

    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setTargetElement(element);
        calculateTooltipPosition(element, step.position);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      setTargetElement(null);
      // Center position for modal-style steps
      setTooltipPosition({ 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    }
  }, [isOnboardingActive, step]);

  const calculateTooltipPosition = (element, preferredPosition) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 16;

    let position = { top: 0, left: 0 };
    let direction = preferredPosition || 'bottom';

    switch (direction) {
      case 'top':
        position.top = rect.top - tooltipHeight - offset;
        position.left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        position.top = rect.bottom + offset;
        position.left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        position.top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        position.left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        position.top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        position.left = rect.right + offset;
        break;
      default:
        position.top = rect.bottom + offset;
        position.left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    }

    // Ensure tooltip stays within viewport
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (position.left < 10) position.left = 10;
    if (position.left + tooltipWidth > windowWidth - 10) {
      position.left = windowWidth - tooltipWidth - 10;
    }
    if (position.top < 10) position.top = 10;
    if (position.top + tooltipHeight > windowHeight - 10) {
      position.top = windowHeight - tooltipHeight - 10;
    }

    setTooltipPosition(position);
    setTooltipDirection(direction);
  };

  if (!isOnboardingActive || !step) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none">
        {/* Highlight for target element */}
        {targetElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-lg pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top - 4,
              left: targetElement.getBoundingClientRect().left - 4,
              width: targetElement.getBoundingClientRect().width + 8,
              height: targetElement.getBoundingClientRect().height + 8,
              background: 'rgba(59, 130, 246, 0.1)'
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm pointer-events-auto"
        style={tooltipPosition}
      >
        {/* Arrow */}
        {targetElement && (
          <div
            className={`absolute w-0 h-0 border-8 ${
              tooltipDirection === 'top' ? 'border-t-transparent border-l-transparent border-r-transparent border-b-white -bottom-2 left-1/2 transform -translate-x-1/2' :
              tooltipDirection === 'bottom' ? 'border-b-transparent border-l-transparent border-r-transparent border-t-white -top-2 left-1/2 transform -translate-x-1/2' :
              tooltipDirection === 'left' ? 'border-l-transparent border-t-transparent border-b-transparent border-r-white -right-2 top-1/2 transform -translate-y-1/2' :
              'border-r-transparent border-t-transparent border-b-transparent border-l-white -left-2 top-1/2 transform -translate-y-1/2'
            }`}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={skipTour}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <SkipForward size={16} />
              <span>Skip</span>
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              <span>{isLastStep ? 'Finish' : step?.action === 'navigate' ? 'Continue' : 'Next'}</span>
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourTooltip;