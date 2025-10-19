import React, { useState } from "react";
import api from "../services/api";

/**
 * BRAND NEW ADD MONEY BUTTON
 * Simple, clean, and works!
 */
const AddMoneyButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("⚠️ Please enter a valid amount!");
      return;
    }

    setLoading(true);
    console.log("🆕 Adding money:", amount);

    try {
      const response = await api.post("/money/add", {
        amount: parseFloat(amount)
      });

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        alert(`✅ Success! ₹${amount} added to your wallet!`);
        setShowModal(false);
        setAmount("");
        if (onSuccess) onSuccess();
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

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
      >
        ➕ ADD MONEY
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">💰</div>
              <h2 className="text-3xl font-bold text-gray-800">Add Money</h2>
              <p className="text-gray-600 mt-2">Add funds to your wallet</p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-xl font-bold text-center focus:border-purple-500 focus:outline-none"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Quick Amounts */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3">Quick Select</p>
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={loading}
                    className="py-3 bg-purple-100 text-purple-700 rounded-lg font-bold hover:bg-purple-200 transition disabled:opacity-50"
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                disabled={loading || !amount}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Money"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddMoneyButton;
