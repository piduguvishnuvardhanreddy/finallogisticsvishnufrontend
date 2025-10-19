import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { loginUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data);
      navigate("/", { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Welcome Back
        </motion.h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              required
              type="email"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              required
              type="password"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Your password"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            {submitting ? "Logging in..." : "Login"}
          </motion.button>
        </form>
        <motion.p
          className="text-sm text-center mt-6 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          New here? <Link to="/register" className="text-blue-600 hover:text-purple-600 font-medium transition-colors">Create account</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
