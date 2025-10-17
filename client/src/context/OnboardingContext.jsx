import React, { createContext, useContext, useState, useEffect } from 'react';
import onboardingService from '../services/onboardingService';
import { AuthContext } from './AuthContext';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTour, setCurrentTour] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [completedTours, setCompletedTours] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(true);

  // Define onboarding tours
  const tours = {
    setup: {
      id: 'setup',
      title: 'Account Setup',
      description: 'Let\'s set up your financial dashboard step by step!',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to ExpenSure!',
          content: 'Let\'s get you started by setting up your account. We\'ll walk you through adding your first account, category, budget, and transaction.',
          target: null,
          position: 'center'
        },
        {
          id: 'go-to-accounts',
          title: 'Step 1: Add Your First Account',
          content: 'First, let\'s click on "Accounts" in the sidebar to go to the Accounts page where you can add your checking account, savings, or credit card.',
          target: '[data-tour="accounts-nav"]',
          position: 'right',
          action: 'navigate',
          actionTarget: '/accounts'
        },
        {
          id: 'add-account',
          title: 'Add Your Account',
          content: 'Now click this button to add your first account. You can add checking accounts, savings, credit cards, or cash.',
          target: '[data-tour="add-account"]',
          position: 'bottom'
        },
        {
          id: 'go-to-categories',
          title: 'Step 2: Create a Category',
          content: 'Great! Now let\'s click on "Categories" in the sidebar to create a spending category like "Groceries", "Entertainment", or "Transportation".',
          target: '[data-tour="categories-nav"]',
          position: 'right',
          action: 'navigate',
          actionTarget: '/categories'
        },
        {
          id: 'add-category',
          title: 'Add Your Category',
          content: 'Click this button to create your first spending category. Categories help you organize and track different types of expenses.',
          target: '[data-tour="add-category"]',
          position: 'bottom'
        },
        {
          id: 'go-to-budgets',
          title: 'Step 3: Set Your First Budget',
          content: 'Perfect! Now let\'s click on "Budgets" in the sidebar to create a budget for your category. This helps you track and control your spending.',
          target: '[data-tour="budgets-nav"]',
          position: 'right',
          action: 'navigate',
          actionTarget: '/budgets'
        },
        {
          id: 'add-budget',
          title: 'Create Your Budget',
          content: 'Click this button to set up your first budget. You can set spending limits for the category you just created.',
          target: '[data-tour="add-budget"]',
          position: 'bottom'
        },
        {
          id: 'go-to-transactions',
          title: 'Step 4: Record Your First Transaction',
          content: 'Excellent! Now let\'s click on "Transactions" in the sidebar to record your first transaction. This could be an expense, income, or transfer.',
          target: '[data-tour="transactions-nav"]',
          position: 'right',
          action: 'navigate',
          actionTarget: '/transactions'
        },
        {
          id: 'add-transaction',
          title: 'Add Your Transaction',
          content: 'Click this button to record your first transaction. You can add expenses, income, or transfers using the accounts and categories you just created.',
          target: '[data-tour="add-transaction"]',
          position: 'bottom'
        },
        {
          id: 'setup-complete',
          title: 'Setup Complete!',
          content: 'Excellent! You\'ve set up the basics. Now let\'s explore your dashboard to see how everything comes together.',
          target: null,
          position: 'center',
          action: 'navigate',
          actionTarget: '/dashboard'
        }
      ]
    }
  };

  // Initialize onboarding state
  useEffect(() => {
    const initializeOnboarding = async () => {
      setIsLoading(true);
      
      try {
        // Only initialize if user is authenticated
        if (!user?.id) {
          console.log('No authenticated user, skipping onboarding initialization');
          setIsLoading(false);
          setIsFirstTimeUser(false); // Reset to false when no user
          return;
        }

        const userId = user.id;

        if (useDatabase) {
          // Try to sync with database first
          console.log('Syncing onboarding state with database for user:', userId);
          
          try {
            const dbState = await onboardingService.syncWithLocalStorage();
            
            if (dbState) {
              console.log('Database sync successful:', dbState);
              setIsFirstTimeUser(!dbState.hasSeenOnboarding);
              setCompletedTours(new Set(dbState.completedTours || []));
            } else {
              // Fallback to localStorage
              console.log('Database sync failed, falling back to localStorage');
              loadFromLocalStorage(userId);
            }
          } catch (error) {
            console.error('Database sync error, falling back to localStorage:', error);
            setUseDatabase(false); // Disable database for this session
            loadFromLocalStorage(userId);
          }
        } else {
          // Use localStorage only
          loadFromLocalStorage(userId);
        }
      } catch (error) {
        console.error('Onboarding initialization error:', error);
        setIsFirstTimeUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = (userId) => {
      const userOnboardingKey = `hasSeenOnboarding_${userId}`;
      const userToursKey = `completedTours_${userId}`;
      
      const hasSeenOnboarding = localStorage.getItem(userOnboardingKey);
      const completedToursData = localStorage.getItem(userToursKey);
      
      console.log('Loading from localStorage:', { 
        userId, 
        hasSeenOnboarding, 
        completedToursData
      });
      
      setIsFirstTimeUser(!hasSeenOnboarding);
      
      if (completedToursData) {
        setCompletedTours(new Set(JSON.parse(completedToursData)));
      }
    };

    initializeOnboarding();
  }, [user]); // Re-run when user changes



  // Start onboarding flow
  const startOnboarding = (tourId = 'welcome') => {
    const tour = tours[tourId];
    if (tour) {
      setCurrentTour(tour);
      setCurrentStep(0);
      setIsOnboardingActive(true);
      
      // Dismiss the welcome modal by marking user as having seen onboarding
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`hasSeenOnboarding_${userId}`, 'true');
      setIsFirstTimeUser(false);
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentTour && currentStep < currentTour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip current tour
  const skipTour = () => {
    setIsOnboardingActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
  };

  // Complete current tour
  const completeTour = async () => {
    const userId = user?.id || 'anonymous';
    
    let newCompletedTours = completedTours;
    
    if (currentTour) {
      newCompletedTours = new Set([...completedTours, currentTour.id]);
      setCompletedTours(newCompletedTours);
      
      // Update localStorage
      localStorage.setItem(`completedTours_${userId}`, JSON.stringify([...newCompletedTours]));
      
      // Sync with database if enabled
      if (useDatabase && userId !== 'anonymous') {
        try {
          await onboardingService.completeTour(currentTour.id);
          console.log(`Tour ${currentTour.id} synced to database`);
        } catch (error) {
          console.error('Failed to sync tour completion to database:', error);
        }
      }
    }
    
    setIsOnboardingActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
    
    // Mark onboarding as seen
    localStorage.setItem(`hasSeenOnboarding_${userId}`, 'true');
    setIsFirstTimeUser(false);
    
    // Sync hasSeenOnboarding to database
    if (useDatabase && userId !== 'anonymous') {
      try {
        await onboardingService.updateOnboardingState({
          hasSeenOnboarding: true,
          completedTours: [...newCompletedTours]
        });
        console.log('Onboarding completion synced to database');
      } catch (error) {
        console.error('Failed to sync onboarding completion to database:', error);
      }
    }
  };

  // Restart onboarding
  const restartOnboarding = async () => {
    const userId = user?.id || 'anonymous';
    
    // Clear localStorage
    localStorage.removeItem(`hasSeenOnboarding_${userId}`);
    localStorage.removeItem(`completedTours_${userId}`);
    setCompletedTours(new Set());
    setIsFirstTimeUser(true);
    
    // Reset in database if enabled
    if (useDatabase && userId !== 'anonymous') {
      try {
        await onboardingService.resetOnboarding();
        console.log('Onboarding reset synced to database');
      } catch (error) {
        console.error('Failed to sync onboarding reset to database:', error);
      }
    }
    
    startOnboarding('dashboard'); // Start with dashboard tour directly
  };

  // Check onboarding status for current user (call this after login)
  const checkOnboardingStatus = () => {
    const userId = user?.id || 'anonymous';
    
    const userOnboardingKey = `hasSeenOnboarding_${userId}`;
    const userToursKey = `completedTours_${userId}`;
    
    const hasSeenOnboarding = localStorage.getItem(userOnboardingKey);
    const completedToursData = localStorage.getItem(userToursKey);
    
    console.log('Checking onboarding status for user:', { 
      userId, 
      hasSeenOnboarding, 
      completedToursData 
    });
    
    if (!hasSeenOnboarding) {
      console.log('New user detected, showing welcome modal');
      setIsFirstTimeUser(true);
    } else {
      setIsFirstTimeUser(false);
    }
    
    if (completedToursData) {
      setCompletedTours(new Set(JSON.parse(completedToursData)));
    } else {
      setCompletedTours(new Set());
    }
  };

  // Get current step data
  const getCurrentStep = () => {
    if (currentTour && currentTour.steps[currentStep]) {
      return currentTour.steps[currentStep];
    }
    return null;
  };

  // Check if tour is completed
  const isTourCompleted = (tourId) => {
    return completedTours.has(tourId);
  };

  // Mark milestones
  const markMilestone = async (milestone) => {
    if (useDatabase) {
      try {
        await onboardingService.markMilestone(milestone);
        console.log(`Milestone ${milestone} marked in database`);
      } catch (error) {
        console.error(`Failed to mark milestone ${milestone}:`, error);
      }
    }
  };

  const value = {
    // State
    isOnboardingActive,
    currentStep,
    currentTour,
    isFirstTimeUser,
    completedTours,
    tours,
    isLoading,
    useDatabase,
    
    // Actions
    startOnboarding,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    restartOnboarding,
    checkOnboardingStatus,
    markMilestone,
    
    // Helpers
    getCurrentStep,
    isTourCompleted,
    totalSteps: currentTour?.steps.length || 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentTour ? currentStep === currentTour.steps.length - 1 : false
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};