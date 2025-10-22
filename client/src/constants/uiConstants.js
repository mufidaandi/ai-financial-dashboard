// src/constants/uiConstants.js
/**
 * UI/UX constants for consistent design and behavior
 */

// Layout and spacing constants
export const LAYOUT = {
  // Container and wrapper sizes
  MAX_CONTENT_WIDTH: '1200px',
  SIDEBAR_WIDTH: '250px',
  SIDEBAR_COLLAPSED_WIDTH: '60px',
  HEADER_HEIGHT: '64px',
  FOOTER_HEIGHT: '48px',
  
  // Spacing values (Tailwind-compatible)
  SPACING: {
    XS: '0.25rem',    // 4px
    SM: '0.5rem',     // 8px
    MD: '1rem',       // 16px
    LG: '1.5rem',     // 24px
    XL: '2rem',       // 32px
    '2XL': '3rem',    // 48px
    '3XL': '4rem'     // 64px
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: '0.25rem',    // 4px
    MD: '0.375rem',   // 6px
    LG: '0.5rem',     // 8px
    XL: '0.75rem',    // 12px
    '2XL': '1rem'     // 16px
  }
};

// Color constants (extend Tailwind when needed)
export const COLORS = {
  // Status colors
  SUCCESS: '#10b981',     // green-500
  WARNING: '#f59e0b',     // amber-500
  ERROR: '#ef4444',       // red-500
  INFO: '#3b82f6',        // blue-500
  
  // Neutral grays
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
  
  // Dark mode colors
  DARK_BG: '#0f172a',      // slate-900
  DARK_SURFACE: '#1e293b', // slate-800
  DARK_BORDER: '#334155',  // slate-700
  DARK_TEXT: '#f1f5f9'     // slate-100
};

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// Breakpoints (Tailwind default)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Form constants
export const FORM = {
  // Input sizes
  INPUT_HEIGHT: {
    SM: '32px',
    MD: '40px',
    LG: '48px'
  },
  
  // Validation rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 500
  },
  
  // Field widths
  FIELD_WIDTH: {
    SMALL: '120px',
    MEDIUM: '200px',
    LARGE: '300px',
    FULL: '100%'
  }
};

// Animation constants
export const ANIMATIONS = {
  // Duration classes (Tailwind)
  DURATION: {
    FAST: 'duration-150',
    NORMAL: 'duration-200',
    SLOW: 'duration-300',
    SLOWER: 'duration-500'
  },
  
  // Easing functions
  EASING: {
    DEFAULT: 'ease-in-out',
    IN: 'ease-in',
    OUT: 'ease-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // Common transitions
  TRANSITIONS: {
    ALL: 'transition-all',
    COLORS: 'transition-colors',
    OPACITY: 'transition-opacity',
    TRANSFORM: 'transition-transform'
  }
};

// Component sizes
export const COMPONENT_SIZES = {
  // Button sizes
  BUTTON: {
    SM: { height: '32px', padding: '0 12px', fontSize: '14px' },
    MD: { height: '40px', padding: '0 16px', fontSize: '16px' },
    LG: { height: '48px', padding: '0 24px', fontSize: '18px' }
  },
  
  // Avatar sizes
  AVATAR: {
    XS: '24px',
    SM: '32px',
    MD: '40px',
    LG: '48px',
    XL: '64px',
    '2XL': '80px'
  },
  
  // Icon sizes
  ICON: {
    XS: '12px',
    SM: '16px',
    MD: '20px',
    LG: '24px',
    XL: '32px'
  }
};

// Data display constants
export const DATA_DISPLAY = {
  // Table pagination
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
  
  // Number formatting
  CURRENCY_DECIMALS: 2,
  PERCENTAGE_DECIMALS: 1,
  
  // Date formats
  DATE_FORMATS: {
    SHORT: 'MMM dd',           // Jan 15
    MEDIUM: 'MMM dd, yyyy',    // Jan 15, 2025
    LONG: 'MMMM dd, yyyy',     // January 15, 2025
    ISO: 'yyyy-MM-dd',         // 2025-01-15
    TIME: 'HH:mm'              // 14:30
  },
  
  // Chart colors (for data visualization)
  CHART_COLORS: [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316'  // orange-500
  ]
};

// Form validation and messaging constants
export const FORM_MESSAGES = {
  // Field requirement indicators
  REQUIRED_FIELDS_NOTICE: 'Fields are required.',
  REQUIRED_INDICATOR: '*',
  
  // Common validation messages
  VALIDATION: {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_AMOUNT: 'Please enter a valid amount.',
    INVALID_DATE: 'Please select a valid date.',
    MIN_LENGTH: (length) => `Must be at least ${length} characters.`,
    MAX_LENGTH: (length) => `Must be no more than ${length} characters.`,
    POSITIVE_NUMBER: 'Amount must be greater than 0.',
    FUTURE_DATE_NOT_ALLOWED: 'Future dates are not allowed.',
    ACCOUNTS_CANNOT_MATCH: 'From and To accounts cannot be the same.'
  },
  
  // Form submission messages
  SUBMISSION: {
    SAVING: 'Saving...',
    UPDATING: 'Updating...',
    DELETING: 'Deleting...',
    PROCESSING: 'Processing...'
  },
  
  // Help text and descriptions
  HELP_TEXT: {
    DESCRIPTION: 'e.g., Grocery shopping, Gas station, Salary deposit',
    AMOUNT: 'Enter amount in your base currency',
    CATEGORY: 'Select category (optional for expenses)',
    TRANSFER_ACCOUNTS: 'Choose different accounts for the transfer'
  }
};

// Accessibility constants
export const A11Y = {
  // ARIA labels and descriptions
  ARIA_LABELS: {
    REQUIRED_FIELD: 'Required field',
    OPTIONAL_FIELD: 'Optional field',
    LOADING: 'Loading',
    CLOSE_MODAL: 'Close modal',
    SORT_COLUMN: 'Sort by this column',
    FILTER_RESULTS: 'Filter results',
    CLEAR_FILTERS: 'Clear all filters'
  },
  
  // Screen reader announcements
  ANNOUNCEMENTS: {
    FORM_SUBMITTED: 'Form submitted successfully',
    VALIDATION_ERROR: 'Please fix the errors in the form',
    DATA_LOADED: 'Data has been loaded',
    FILTER_APPLIED: 'Filters have been applied'
  }
};

// Test credentials and demo data
export const DEMO_DATA = {
  TEST_CREDENTIALS: {
    EMAIL: 'admin@test.com',
    PASSWORD: 'admin'
  },
  
  SAMPLE_CATEGORIES: [
    'Groceries', 'Utilities', 'Transportation', 
    'Entertainment', 'Shopping', 'Healthcare',
    'Education', 'Travel', 'Dining', 'Bills'
  ],
  
  SAMPLE_ACCOUNT_TYPES: [
    'Checking', 'Savings', 'Credit Card', 
    'Investment', 'Cash', 'Loan'
  ]
};