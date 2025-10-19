import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const AddMoneyModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("⚠️ Please enter a valid amount");
      return;
    }

    setLoading(true);
    console.log("💰 Submitting add money request:", { amount: parseFloat(amount), paymentMethod });

    try {
      const response = await api.post("/wallet/customer/add-money", {
        amount: parseFloat(amount),
        paymentMethod
      });

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        alert(`✅ Success! ₹${amount} added to your wallet!`);
        setAmount("");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert("❌ " + (response.data.message || "Failed to add money"));
      }
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("Error response:", error.response);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      "Failed to add money. Please try again.";
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
              setAmount("");
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💰</div>
              <h2 className="text-3xl font-bold text-gray-800">Add Money</h2>
              <p className="text-gray-600 mt-2">Add funds to your wallet</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold"
                  required
                  disabled={loading}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Add</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => {
                        console.log("Quick amount clicked:", quickAmount);
                        setAmount(quickAmount.toString());
                      }}
                      disabled={loading}
                      className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition font-bold disabled:opacity-50"
                    >
                      ₹{quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
                >
                  <option value="Card">💳 Credit/Debit Card</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Net Banking">🏦 Net Banking</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setAmount("");
                  }}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      ➕ Add Money
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddMoneyModal;
