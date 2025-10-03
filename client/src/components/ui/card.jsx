import * as React from "react";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`rounded-xl border bg-card text-card-foreground shadow dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${className || ""}`} {...props} />
));
Card.displayName = "Card";

export function CardHeader({ className, ...props }) {
  return <div className={`p-4 pb-1 ${className || ""}`} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={`font-semibold text-lg dark:text-gray-100 ${className || ""}`} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={`text-sm dark:text-gray-300 ${className || ""}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={` ${className || ""} p-4 pt-1`} {...props} />;
}

export { Card };
