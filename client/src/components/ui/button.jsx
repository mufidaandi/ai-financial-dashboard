import * as React from "react";

const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const base = "border border-gray-400 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-700 dark:focus:ring-blue-400 ";
  const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-700 dark:text-white dark:hover:bg-red-800",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-white",
  link: "underline-offset-4 hover:underline text-primary dark:text-blue-400"
  };
  return (
    <button ref={ref} className={`${base} ${variants[variant] || variants.default} ${className || ""}`} {...props} />
  );
});
Button.displayName = "Button";

export { Button };
