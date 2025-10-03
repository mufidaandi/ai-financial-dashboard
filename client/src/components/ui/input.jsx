import * as React from "react";

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-400 ${className || ""}`} {...props} />
));
Input.displayName = "Input";

export { Input };
