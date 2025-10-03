import * as React from "react";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={`block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 ${className || ""}`} {...props} />
));
Label.displayName = "Label";

export { Label };
