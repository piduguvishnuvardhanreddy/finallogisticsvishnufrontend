import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  // Redirect based on role
  switch (user.role) {
    case "Admin":
      return <Navigate to="/dashboard" replace />;
    case "Driver":
      return <Navigate to="/driver/dashboard" replace />;
    case "Customer":
      return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default HomeRedirect;
