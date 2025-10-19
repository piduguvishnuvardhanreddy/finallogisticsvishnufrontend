import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const AddMoneyPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get("/money/balance");
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("⚠️ Please enter a valid amount!");
      return;
    }

    setLoading(true);
    console.log("💰 Adding money:", amount);

    try {
      const response = await api.post("/money/add", {
        amount: parseFloat(amount)
      });

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        alert(`✅ Success! ₹${amount} added to your wallet!`);
        setAmount("");
        fetchBalance();
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to add money";
      alert("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">💰</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Add Money to Wallet</h1>
          <p className="text-xl text-gray-600">Quick and secure way to add funds</p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-lg mb-2">Current Balance</p>
              <h2 className="text-6xl font-bold">₹{balance.toFixed(2)}</h2>
            </div>
            <div className="text-8xl opacity-20">💳</div>
          </div>
        </div>

        {/* Add Money Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleAddMoney} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl text-2xl font-bold text-center focus:border-purple-500 focus:outline-none"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-lg font-bold text-gray-700 mb-3">Quick Select</p>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={loading}
                    className="py-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl font-bold text-lg hover:from-purple-200 hover:to-pink-200 transition disabled:opacity-50 transform hover:scale-105"
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:border-purple-500 focus:outline-none"
              >
                <option value="Card">💳 Credit/Debit Card</option>
                <option value="UPI">📱 UPI</option>
                <option value="Net Banking">🏦 Net Banking</option>
                <option value="Wallet">👛 Digital Wallet</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "💰 Add Money to Wallet"
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-bold text-gray-800 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">Bank-level encryption</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-bold text-gray-800 mb-1">Instant</h3>
            <p className="text-sm text-gray-600">Money added instantly</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">💯</div>
            <h3 className="font-bold text-gray-800 mb-1">Safe</h3>
            <p className="text-sm text-gray-600">100% secure payments</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyPage;
