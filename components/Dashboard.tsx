"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/users"),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      const transactions = await response.json();
      setUserTransactions(transactions);
    } catch (error) {
      console.error("Failed to fetch user transactions:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserTransactions(user._id);
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium">Total Customers</h3>
          <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
        </div>

        <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium">Active Policies</h3>
          <p className="text-2xl font-bold">{stats?.totalPolicies || 0}</p>
        </div>

        <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium">Total Balance</h3>
          <p className="text-2xl font-bold">
            ${stats?.totalBalance?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium">Successful Payments</h3>
          <p className="text-2xl font-bold">
            {stats?.transactionStats?.succeeded?.count || 0}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length
                ? users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">${user.balance.toFixed(2)}</td>
                      <td className="p-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleUserClick(user)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Details */}
      {selectedUser && (
        <div className="bg-white p-4 rounded border">
          <h2 className="text-xl font-bold mb-4">
            Transactions for {selectedUser.name}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Policy</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b">
                    <td className="p-2 capitalize">{transaction.type}</td>
                    <td className="p-2">${transaction.amount.toFixed(2)}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          transaction.status === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {transaction.policyId?.name || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions?.map((transaction) => (
                <tr key={transaction._id} className="border-b">
                  <td className="p-2">
                    {transaction.userId?.name || "Unknown"}
                  </td>
                  <td className="p-2">${transaction.amount.toFixed(2)}</td>
                  <td className="p-2 capitalize">{transaction.type}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        transaction.status === "succeeded"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
