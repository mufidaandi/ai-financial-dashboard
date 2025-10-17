import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, BarChart2, Wallet, CreditCard, Tag, Sun, Moon, ChevronLeft, ChevronRight, Brain, Target, LogOut, User, Settings, HelpCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useOnboarding } from "../context/OnboardingContext";
import Header from "./Header";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <BarChart2 size={20} /> },
  { name: "Transactions", href: "/transactions", icon: <Wallet size={20} /> },
  { name: "Accounts", href: "/accounts", icon: <CreditCard size={20} /> },
  { name: "Categories", href: "/categories", icon: <Tag size={20} /> },
  { name: "Budgets", href: "/budgets", icon: <Target size={20} /> },
  { name: "AI Insights", href: "/insights", icon: <Brain size={20} /> },
];

function Sidebar({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { restartOnboarding } = useOnboarding();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  // Theme toggle handler
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Apply theme on mount
  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  // Get user data from AuthContext - handle nested structure
  const actualUser = user?.user || user; // Handle both nested and flat structures
  const userName = actualUser?.name || "User";
  const userEmail = actualUser?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapse button positioned on the border - hidden on mobile */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`p-0 fixed top-6 z-[60] bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white items-center justify-center w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 shadow-lg hidden md:flex ${
          collapsed ? "left-[63px]" : "left-[240px]"
        }`}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{ minWidth: '28px', minHeight: '28px' }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:inset-0 h-screen ${collapsed ? "w-20" : "w-64"}`}>

        <div className="flex flex-col h-full">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 w-full">
              <div>
                <img
                  src={collapsed ? "/logo-icon.png" : `${theme === "light" ? "/light-mode.png" : "/dark-mode.png"}`}
                  alt="Logo"
                  className={`transition-all duration-200 ${collapsed ? "w-15 h-15 mx-auto" : "p-4 visible"}`}
                />
              </div>
              {/* <h1 className={`text-xl font-bold text-gray-800 dark:text-gray-100 transition-all duration-200 ${collapsed ? "hidden" : "visible"}`}>ExpenSure</h1> */}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 space-y-2 ${collapsed ? "px-2" : "px-4"}`}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  data-tour={
                    item.name === "Accounts" ? "accounts-nav" :
                    item.name === "Categories" ? "categories-nav" :
                    item.name === "Budgets" ? "budgets-nav" :
                    item.name === "Transactions" ? "transactions-nav" :
                    undefined
                  }
                  className={`flex items-center py-3 rounded-lg transition-colors ${collapsed ? "justify-center" : "px-4"
                    } ${isActive
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <span className="text-lg flex items-center justify-center">{item.icon}</span>
                  {!collapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Mobile-only Profile and Settings section */}
          <div className={`md:hidden border-t border-gray-200 dark:border-gray-700 p-4`}>
            {/* Profile Info */}
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {userInitial}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            
            {/* Profile Settings Link - mobile only */}
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center py-2 px-3 mb-2 rounded-lg transition-colors ${
                location.pathname === "/profile"
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="text-lg flex items-center justify-center">
                <Settings size={20} />
              </span>
              <span className="ml-3 text-sm font-medium">Profile Settings</span>
            </Link>

            {/* Help Button - mobile only */}
            <button
              onClick={() => {
                restartOnboarding();
                setSidebarOpen(false);
              }}
              className="flex items-center w-full py-2 px-3 mb-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="text-lg flex items-center justify-center">
                <HelpCircle size={20} />
              </span>
              <span className="ml-3 text-sm font-medium">Tutorial</span>
            </button>

            {/* Logout Button - mobile only */}
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="flex items-center w-full py-2 px-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <span className="text-lg flex items-center justify-center">
                <LogOut size={20} />
              </span>
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0 h-screen overflow-hidden">
        {/* Header - visible on desktop */}
        <div className="hidden md:block">
          <Header theme={theme} onThemeToggle={handleThemeToggle} />
        </div>
        
        {/* Mobile header */}
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">ExpenSure</h1>
            <div className="flex items-center gap-2">
              {/* Mobile theme toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Sidebar;