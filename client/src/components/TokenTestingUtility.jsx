import React, { useState, useContext } from 'react';
import { Clock, TestTube, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TokenTestingUtility = () => {
  const { user, login } = useContext(AuthContext);
  const { info, success, error } = useToast();
  const [isCreatingShortToken, setIsCreatingShortToken] = useState(false);

  // Create a short-lived token for testing (2 minutes)
  const createShortLivedToken = async () => {
    setIsCreatingShortToken(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/test-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ duration: '2m' }) // 2 minutes for testing
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the context with the short-lived token
        login(data);
        success('Test token created! Will expire in 2 minutes.');
        info('The notification will appear 15 minutes before expiry (immediately for this test token).');
      } else {
        throw new Error('Failed to create test token');
      }
    } catch (err) {
      console.error('Error creating test token:', err);
      error('Failed to create test token. Using manual token manipulation instead.');
      
      // Fallback: manually create a token that expires soon
      createManualTestToken();
    } finally {
      setIsCreatingShortToken(false);
    }
  };

  // Manually create a test token using the browser (for testing without backend changes)
  const createManualTestToken = () => {
    try {
      // Create a fake JWT token that expires in 1 minute for testing
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        id: user?.id || 'test-user',
        exp: Math.floor(Date.now() / 1000) + 60 // Expires in 1 minute
      }));
      const signature = 'test-signature';
      
      const testToken = `${header}.${payload}.${signature}`;
      
      // Update the user context with the test token
      const testUser = { ...user, token: testToken };
      login({ user: testUser, token: testToken });
      
      success('Manual test token created! Will expire in 1 minute.');
      info('This will trigger the notification immediately since it expires in 1 minute.');
    } catch (err) {
      error('Failed to create manual test token.');
    }
  };

  // Get current token info
  const getTokenInfo = () => {
    if (!user?.token) return null;
    
    try {
      const parts = user.token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeLeft = exp - now;
      
      return {
        expiresAt: new Date(exp),
        timeLeft: timeLeft,
        isExpired: timeLeft <= 0,
        willExpireSoon: timeLeft <= 15 * 60 * 1000 // 15 minutes
      };
    } catch (err) {
      return null;
    }
  };

  const tokenInfo = getTokenInfo();

  if (!user?.token) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          Please log in to test token expiration functionality.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Token Testing Utility
        </h3>
      </div>
      
      {tokenInfo && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Current Token Info:</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Expires:</span> {tokenInfo.expiresAt.toLocaleString()}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Time Left:</span> {
                tokenInfo.isExpired 
                  ? 'Expired' 
                  : `${Math.floor(tokenInfo.timeLeft / (1000 * 60))} minutes`
              }
            </p>
            <p className={`font-medium ${
              tokenInfo.isExpired 
                ? 'text-red-600 dark:text-red-400'
                : tokenInfo.willExpireSoon 
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              Status: {
                tokenInfo.isExpired 
                  ? 'Expired' 
                  : tokenInfo.willExpireSoon 
                  ? 'Will expire soon - notification should be visible'
                  : 'Valid'
              }
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={createManualTestToken}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Clock className="h-4 w-4" />
          Create 1-Minute Test Token
        </button>
        
        <button
          onClick={createShortLivedToken}
          disabled={isCreatingShortToken}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isCreatingShortToken ? 'animate-spin' : ''}`} />
          {isCreatingShortToken ? 'Creating...' : 'Create 2-Minute Server Token'}
        </button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• First button creates a client-side test token that expires in 1 minute</p>
          <p>• Second button requests a server-generated 2-minute token (requires backend support)</p>
          <p>• Notification appears 15 minutes before expiry (immediately for test tokens)</p>
        </div>
      </div>
    </div>
  );
};

export default TokenTestingUtility;