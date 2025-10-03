import React from "react";

// Base Pill/Badge component
export const Pill = ({ 
  children, 
  variant = "default", 
  size = "sm",
  className = "",
  icon = null,
  removable = false,
  onRemove = null,
  ...props 
}) => {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    primary: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    success: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700",
    warning: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
    danger: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
    info: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700",
    pink: "bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700",
    indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700",
    
    // Outline variants
    "outline-default": "bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
    "outline-primary": "bg-transparent border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300",
    "outline-success": "bg-transparent border-green-300 dark:border-green-600 text-green-700 dark:text-green-300",
    "outline-warning": "bg-transparent border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300",
    "outline-danger": "bg-transparent border-red-300 dark:border-red-600 text-red-700 dark:text-red-300",
    
    // Solid variants (no background, just colored text)
    "solid-primary": "bg-blue-600 text-white border-blue-600",
    "solid-success": "bg-green-600 text-white border-green-600",
    "solid-warning": "bg-yellow-600 text-white border-yellow-600",
    "solid-danger": "bg-red-600 text-white border-red-600",
    "solid-info": "bg-blue-600 text-white border-blue-600",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-sm",
    xl: "px-5 py-2.5 text-base"
  };

  const baseClasses = "inline-flex items-center font-medium rounded-full border transition-colors";
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size];

  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} gap-2 py-1 px-2`}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center w-5 h-5 text-current hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Specialized components for common use cases
export const StatusPill = ({ status, ...props }) => {
  const statusVariants = {
    active: { variant: "success", children: "Active" },
    inactive: { variant: "default", children: "Inactive" },
    pending: { variant: "warning", children: "Pending" },
    completed: { variant: "success", children: "Completed" },
    cancelled: { variant: "danger", children: "Cancelled" },
    draft: { variant: "default", children: "Draft" },
    published: { variant: "success", children: "Published" },
    archived: { variant: "default", children: "Archived" },
  };

  const config = statusVariants[status] || { variant: "default", children: status };
  
  return <Pill {...config} {...props} />;
};

export const CategoryPill = ({ category, ...props }) => {
  // Predefined colors for common categories
  const categoryColors = {
    groceries: "success",
    dining: "warning", 
    transportation: "info",
    utilities: "primary",
    entertainment: "purple",
    healthcare: "danger",
    shopping: "pink",
    education: "indigo",
    insurance: "default",
    "personal care": "secondary",
    income: "success",
    transfer: "info",
    uncategorized: "default",
  };

  const variant = categoryColors[category?.toLowerCase()] || "primary";
  
  return (
    <Pill variant={variant} {...props}>
      {category}
    </Pill>
  );
};

export const TypePill = ({ type, ...props }) => {
  const typeVariants = {
    income: { variant: "success", children: "Income" },
    expense: { variant: "danger", children: "Expense" },
    transfer: { variant: "info", children: "Transfer" },
  };

  const config = typeVariants[type] || { variant: "default", children: type };
  
  return <Pill {...config} {...props} />;
};

export const PriorityPill = ({ priority, ...props }) => {
  const priorityVariants = {
    low: { variant: "success", children: "Low" },
    medium: { variant: "warning", children: "Medium" },
    high: { variant: "danger", children: "High" },
    urgent: { variant: "solid-danger", children: "Urgent" },
  };

  const config = priorityVariants[priority] || { variant: "default", children: priority };
  
  return <Pill {...config} {...props} />;
};

export const TagPill = ({ tag, colorIndex = 0, ...props }) => {
  // Cycle through colors for tags
  const tagVariants = [
    "primary", "success", "warning", "info", "purple", "pink", "indigo"
  ];
  
  const variant = tagVariants[colorIndex % tagVariants.length];
  
  return (
    <Pill variant={variant} size="xs" {...props}>
      {tag}
    </Pill>
  );
};

// Interactive pill that can be clicked
export const InteractivePill = ({ 
  children, 
  onClick,
  selected = false,
  variant = "outline-primary",
  selectedVariant = "solid-primary",
  className = "",
  ...props 
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Pill
      variant={selected ? selectedVariant : variant}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Pill>
  );
};

// Pill group container
export const PillGroup = ({ 
  children, 
  className = "",
  spacing = "gap-2",
  wrap = true,
  ...props 
}) => {
  return (
    <div
      className={`flex items-center ${spacing} ${wrap ? 'flex-wrap' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Export everything
export default {
  Pill,
  StatusPill,
  CategoryPill,
  TypePill,
  PriorityPill,
  TagPill,
  InteractivePill,
  PillGroup
};