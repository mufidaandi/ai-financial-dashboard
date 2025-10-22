import * as React from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = React.forwardRef(({ value, onValueChange, children, placeholder, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const selectRef = React.useRef(null);
  const optionsRef = React.useRef([]);
  
  React.useEffect(() => {
    // Find the selected option's label from children
    const findSelectedLabel = (children) => {
      if (!children) return "";
      const childrenArray = React.Children.toArray(children);
      const selected = childrenArray.find(child => child.props?.value === value);
      return selected?.props?.children || "";
    };
    setSelectedLabel(findSelectedLabel(children));
  }, [value, children]);

  // Get options for keyboard navigation
  const options = React.Children.toArray(children).filter(child => React.isValidElement(child));

  const handleSelect = (optionValue, optionLabel) => {
    onValueChange?.(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
    setFocusedIndex(-1);
    selectRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        selectRef.current?.focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          const option = options[focusedIndex];
          handleSelect(option.props.value, option.props.children);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={selectRef}>
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={props.id ? `${props.id}-label` : undefined}
        aria-describedby={props.id ? `${props.id}-description` : undefined}
        className={`border border-gray-400 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-blue-400 ${className || ""}`}
        {...props}
      >
        <span className={selectedLabel ? "" : "text-gray-600 dark:text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 mr-2" aria-hidden="true" />
      </button>
      {isOpen && (
        <div 
          className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-[100] border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
          role="listbox"
          aria-labelledby={props.id ? `${props.id}-label` : undefined}
        >
          <div className="p-1">
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: () => handleSelect(child.props.value, child.props.children),
                  isSelected: child.props.value === value,
                  isFocused: index === focusedIndex,
                  role: "option",
                  "aria-selected": child.props.value === value,
                  tabIndex: -1,
                  ref: (el) => {
                    optionsRef.current[index] = el;
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
});
CustomSelect.displayName = "CustomSelect";

const CustomSelectItem = React.forwardRef(({ children, value, onClick, isSelected, isFocused, className, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    onClick={onClick}
    aria-selected={isSelected}
    className={`w-full text-left relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 ${
      isSelected ? "bg-gray-100 dark:bg-gray-700 dark:text-gray-100" : ""
    } ${
      isFocused ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-800 dark:ring-blue-400" : ""
    } ${className || ""}`}
    {...props}
  >
    {children}
  </div>
));
CustomSelectItem.displayName = "CustomSelectItem";

export { CustomSelect, CustomSelectItem };
