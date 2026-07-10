import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosbase from "../../../axiosbasa";
import { Spinner } from "../ui/spinner";

const PrivateRoute = ({ children }) => {
  const [status, setStatus] = useState("loading"); // "loading" | "auth" | "unauth"

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        await axiosbase.get("/me");
        if (!cancelled) setStatus("auth");
      } catch {
        if (!cancelled) setStatus("unauth");
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-gray-900 flex items-center justify-center"
        role="status"
        aria-label="Checking authentication…"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return status === "auth" ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
