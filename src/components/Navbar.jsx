import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <motion.header
      className="w-full bg-white shadow"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <motion.div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate(user ? "/" : "/login")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.6 }}
        >
          Mango Logistics
        </motion.div>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === "Customer" && (
                <motion.button
                  onClick={() => navigate("/customer/book")}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg text-sm font-semibold"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  📦 Book Delivery
                </motion.button>
              )}
              <div className="text-sm text-gray-600">
                {user.name} | {user.email}
              </div>
              <motion.button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => navigate("/login")}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => navigate("/register")}
                className="px-3 py-1 rounded border text-sm"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                Register
              </motion.button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
