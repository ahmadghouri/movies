import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// eslint-disable-next-line react-refresh/only-export-components
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-red-600 text-white",
        secondary: "border-transparent bg-gray-700 text-gray-200",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "border-gray-600 text-gray-300",
        success: "border-transparent bg-green-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
