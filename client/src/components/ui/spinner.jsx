import { cn } from "../../lib/utils";

function Spinner({ className, size = "md" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  };
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-gray-600 border-t-red-500",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export { Spinner };
