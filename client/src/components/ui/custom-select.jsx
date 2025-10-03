import * as React from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = React.forwardRef(({ value, onValueChange, children, placeholder, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  
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

  const handleSelect = (optionValue, optionLabel) => {
    onValueChange?.(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`border border-gray-200 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${className || ""}`}
        {...props}
      >
        <span className={selectedLabel ? "" : "text-gray-500 dark:text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-[100] border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: () => handleSelect(child.props.value, child.props.children),
                  isSelected: child.props.value === value
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});
CustomSelect.displayName = "CustomSelect";

const CustomSelectItem = React.forwardRef(({ children, value, onClick, isSelected, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={`w-full text-left relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 ${isSelected ? "bg-gray-100 dark:bg-gray-700 dark:text-gray-100" : ""} ${className || ""}`}
    {...props}
  >
    {children}
  </button>
));
CustomSelectItem.displayName = "CustomSelectItem";

export { CustomSelect, CustomSelectItem };
