import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      Admin: "/dashboard",
      Driver: "/driver/dashboard",
      Customer: "/customer/dashboard"
    };
    return <Navigate to={roleRedirects[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
