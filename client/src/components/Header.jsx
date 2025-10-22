import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Bell, Settings, LogOut, ChevronDown, User, HelpCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useOnboarding } from "../context/OnboardingContext";

function Header({ theme, onThemeToggle }) {
  const { user, logout } = useContext(AuthContext);
  const { restartOnboarding } = useOnboarding();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Get user data from AuthContext - handle nested structure
  const actualUser = user?.user || user;
  const userName = actualUser?.name || "User";
  const userEmail = actualUser?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="h-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - could be used for breadcrumbs or page title */}
        <div className="flex-1">
          {/* Future: breadcrumbs or page title */}
        </div>

        {/* Right side - Theme toggle, Notifications, User dropdown */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-400"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-400" aria-hidden="true" />
            ) : (
              <Moon size={20} aria-hidden="true" />
            )}
          </button>

          {/* Notifications (disabled for now) */}
          <button
            disabled
            className="p-2 rounded-lg text-gray-400 dark:text-gray-600 dark:bg-gray-800 cursor-not-allowed"
            aria-label="Notifications (coming soon)"
          >
            <Bell size={20} aria-hidden="true" />
          </button>

          {/* Help/Tutorial Button */}
          <button
            onClick={restartOnboarding}
            className="p-2 rounded-lg text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-400"
            aria-label="Restart Tutorial"
          >
            <HelpCircle size={20} aria-hidden="true" />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg dark:bg-gray-800 transition-colors"
            >
              <div className="h-8 w-8 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{userInitial}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10 dark:bg-black/20" 
                  onClick={() => setUserDropdownOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;