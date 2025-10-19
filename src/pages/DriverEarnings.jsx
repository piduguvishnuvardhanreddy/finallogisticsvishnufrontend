import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const profile = await api.get("/users/profile");
      const [earningsRes, walletRes] = await Promise.all([
        api.get(`/users/drivers/${profile.data._id}/earnings`),
        api.get("/users/wallet")
      ]);

      setEarnings(earningsRes.data);
      setWallet(walletRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > wallet.balance) {
      alert("Insufficient balance");
      return;
    }

    try {
      await api.post("/users/wallet/withdraw", { amount });
      alert("Withdrawal request submitted successfully!");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchEarningsData();
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert(error.response?.data?.message || "Failed to withdraw");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Earnings Analytics 💰</h1>
          <p className="text-gray-600">Track your income and manage withdrawals</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Total Earnings</p>
                <p className="text-4xl font-bold">₹{earnings?.totalEarnings?.toFixed(2) || "0.00"}</p>
                <p className="text-xs opacity-75 mt-2">All time</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Available Balance</p>
                <p className="text-4xl font-bold">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
                <p className="text-xs opacity-75 mt-2">Ready to withdraw</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-2">Avg per Delivery</p>
                <p className="text-4xl font-bold">₹{earnings?.averageEarningPerDelivery?.toFixed(2) || "0.00"}</p>
                <p className="text-xs opacity-75 mt-2">{earnings?.totalDeliveries || 0} deliveries</p>
              </div>
            </motion.div>

            {/* Monthly Earnings Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Earnings</h2>
              <div className="space-y-4">
                {Object.entries(earnings?.earningsByMonth || {}).reverse().slice(0, 6).map(([month, data]) => (
                  <div key={month} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">
                        {new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-xl font-bold text-green-600">₹{data.earnings.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{data.deliveries} deliveries</span>
                      <span>•</span>
                      <span>Avg: ₹{(data.earnings / data.deliveries).toFixed(2)}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full"
                        style={{ width: `${Math.min((data.earnings / earnings.totalEarnings) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Deliveries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Completed Deliveries</h2>
              <div className="space-y-3">
                {earnings?.recentDeliveries?.map((delivery) => (
                  <div key={delivery._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-800">{delivery.deliveryId}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(delivery.endTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        +₹{delivery.driverEarnings?.netEarnings?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {delivery.estimatedDistance} km
                      </p>
                    </div>
                  </div>
                ))}
                {(!earnings?.recentDeliveries || earnings.recentDeliveries.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No completed deliveries yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Wallet</h3>
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-700 mb-1">Current Balance</p>
                <p className="text-4xl font-bold text-gray-800 mb-4">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Withdraw Money
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="font-bold">₹{wallet?.totalEarnings?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawn</span>
                  <span className="font-bold">₹{((wallet?.totalEarnings || 0) - (wallet?.balance || 0)).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wallet?.transactions?.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-bold ${transaction.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "Credit" ? "+" : "-"}₹{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
                {(!wallet?.transactions || wallet.transactions.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No transactions yet</p>
                )}
              </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-4">Performance Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Total Deliveries</span>
                  <span className="text-2xl font-bold">{earnings?.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">This Month</span>
                  <span className="text-2xl font-bold">
                    {Object.values(earnings?.earningsByMonth || {}).slice(-1)[0]?.deliveries || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdraw Money</h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Available Balance</p>
              <p className="text-3xl font-bold text-green-600">₹{wallet?.balance?.toFixed(2) || "0.00"}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <div className="flex space-x-2 mt-3">
                {[500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setWithdrawAmount(amount.toString())}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                💡 Withdrawals are processed within 24-48 hours to your registered bank account.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Confirm Withdrawal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DriverEarnings;
