import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1f2937",
          color: "#f9fafb",
          border: "1px solid #374151",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#f9fafb" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#f9fafb" },
        },
      }}
    />
  );
}
