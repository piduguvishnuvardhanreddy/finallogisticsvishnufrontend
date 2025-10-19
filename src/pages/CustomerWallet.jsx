import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const CustomerWallet = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    console.log("showAddMoney state changed:", showAddMoney);
  }, [showAddMoney]);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wallet/customer/balance");
      setWallet(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      console.log("Adding money to wallet:", {
        amount: parseFloat(amount),
        paymentMethod
      });

      const response = await api.post("/wallet/customer/add-money", {
        amount: parseFloat(amount),
        paymentMethod
      });

      console.log("Add money response:", response.data);

      if (response.data.success) {
        alert(`✅ ₹${amount} added to wallet successfully!`);
        setShowAddMoney(false);
        setAmount("");
        fetchWalletBalance();
      } else {
        alert(response.data.message || "Failed to add money");
      }
    } catch (error) {
      console.error("Error adding money:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to add money. Please try again.";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 My Wallet</h1>
          <p className="text-gray-600">Manage your wallet balance and transactions</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold">₹{wallet.balance?.toFixed(2) || "0.00"}</h2>
            </div>
            <div className="text-6xl">💳</div>
          </div>
          
          <button
            onClick={() => {
              console.log("Add Money button clicked");
              setShowAddMoney(true);
              console.log("showAddMoney set to true");
            }}
            className="mt-6 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition shadow-lg"
          >
            ➕ Add Money
          </button>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h3>
          
          {wallet.transactions && wallet.transactions.length > 0 ? (
            <div className="space-y-3">
              {wallet.transactions.map((transaction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${
                    transaction.type === "Credit" 
                      ? "bg-green-50 border-green-200" 
                      : transaction.type === "Refund"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`text-3xl ${
                          transaction.type === "Credit" ? "text-green-600" : 
                          transaction.type === "Refund" ? "text-blue-600" : "text-red-600"
                        }`}>
                          {transaction.type === "Credit" ? "💰" : 
                           transaction.type === "Refund" ? "🔄" : "💸"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                          {transaction.deliveryId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Delivery: {transaction.deliveryId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.type === "Credit" || transaction.type === "Refund"
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {transaction.type === "Credit" || transaction.type === "Refund" ? "+" : "-"}
                        ₹{transaction.amount?.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: ₹{transaction.balanceAfter?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p>No transactions yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddMoney && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => {
              // Close modal if clicking on backdrop
              if (e.target === e.currentTarget) {
                setShowAddMoney(false);
                setAmount("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Add Money to Wallet</h2>
              
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Card">Credit/Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Add</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-semibold"
                      >
                        ₹{quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMoney(false);
                      setAmount("");
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    Add Money
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerWallet;
