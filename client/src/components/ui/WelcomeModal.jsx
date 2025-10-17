import React from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { Play, BookOpen, X, Zap } from 'lucide-react';

const WelcomeModal = () => {
  const { isFirstTimeUser, isLoading, startOnboarding, completeTour } = useOnboarding();

  if (isLoading || !isFirstTimeUser) return null;

  const handleStartTour = () => {
    startOnboarding('setup');
  };

  const handleSkip = async () => {
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser?.user?.id || currentUser?.id || 'anonymous';
    
    localStorage.setItem(`hasSeenOnboarding_${userId}`, 'true');
    await completeTour();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 flex items-center justify-center mx-auto mb-4">
            <img src="/logo-icon.png" alt="ExpenSure Logo" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to ExpenSure!
          </h2>
          <p className="text-gray-600">
            Take control of your finances with AI-powered insights and smart budget tracking.
          </p>
        </div>

        {/* Features highlight */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Track Expenses</p>
              <p className="text-xs text-gray-600">Monitor your spending with detailed categorization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-sm">🎯</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Smart Budgeting</p>
              <p className="text-xs text-gray-600">Set goals and track progress in real-time</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI Insights</p>
              <p className="text-xs text-gray-600">Get personalized financial recommendations</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleStartTour}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Play size={18} />
            <span>Start Interactive Tour</span>
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <BookOpen size={18} />
            <span>Explore on My Own</span>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can restart this tour anytime from the help menu
        </p>
      </div>
    </div>
  );
};

export default WelcomeModal;