import API from '../api';

class OnboardingService {
  // Get user's onboarding state from database
  async getOnboardingState() {
    try {
      const response = await API.get('/auth/onboarding');
      console.log('API: Onboarding state response:', response.data);
      return response.data.onboarding;
    } catch (error) {
      console.error('API: Error fetching onboarding state:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update user's onboarding state in database
  async updateOnboardingState(state) {
    try {
      const response = await API.put('/auth/onboarding', state);
      return response.data.onboarding;
    } catch (error) {
      console.error('Error updating onboarding state:', error);
      throw error;
    }
  }

  // Mark a specific tour as completed
  async completeTour(tourId) {
    try {
      const response = await API.post('/auth/onboarding/complete-tour', { tourId });
      return response.data.onboarding;
    } catch (error) {
      console.error('Error completing tour:', error);
      throw error;
    }
  }

  // Reset onboarding state
  async resetOnboarding() {
    try {
      const response = await API.post('/auth/onboarding/reset');
      return response.data.onboarding;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }

  // Mark milestone achievements
  async markMilestone(milestone) {
    try {
      const updateData = {};
      updateData[milestone] = true;
      
      const response = await API.put('/auth/onboarding', updateData);
      return response.data.onboarding;
    } catch (error) {
      console.error('Error marking milestone:', error);
      throw error;
    }
  }

  // Sync localStorage with database
  async syncWithLocalStorage() {
    try {
      console.log('API: Starting sync with database...');
      // Get database state
      const dbState = await this.getOnboardingState();
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser?.user?.id || currentUser?.id || 'anonymous';
      
      console.log('API: Sync details:', {
        dbState,
        userId,
        currentUser
      });
      
      // Update localStorage with database state
      if (dbState.hasSeenOnboarding) {
        localStorage.setItem(`hasSeenOnboarding_${userId}`, 'true');
      } else {
        localStorage.removeItem(`hasSeenOnboarding_${userId}`);
      }
      
      if (dbState.completedTours && dbState.completedTours.length > 0) {
        localStorage.setItem(`completedTours_${userId}`, JSON.stringify(dbState.completedTours));
      } else {
        localStorage.removeItem(`completedTours_${userId}`);
      }
      
      console.log('API: Sync completed successfully');
      return dbState;
    } catch (error) {
      console.error('API: Error syncing onboarding state:', error);
      // Fallback to localStorage if API fails
      return null;
    }
  }

  // Upload localStorage state to database
  async uploadLocalState() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser?.user?.id || currentUser?.id || 'anonymous';
      
      const hasSeenOnboarding = localStorage.getItem(`hasSeenOnboarding_${userId}`) === 'true';
      const completedToursData = localStorage.getItem(`completedTours_${userId}`);
      const completedTours = completedToursData ? JSON.parse(completedToursData) : [];
      
      const updateData = {
        hasSeenOnboarding,
        completedTours
      };
      
      return await this.updateOnboardingState(updateData);
    } catch (error) {
      console.error('Error uploading local state:', error);
      throw error;
    }
  }
}

export default new OnboardingService();