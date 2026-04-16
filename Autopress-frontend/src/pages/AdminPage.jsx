// src/pages/AdminPage.jsx
import { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Loader,
  Coins,
  RefreshCw,
  Bell,
  Shield,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminPage = () => {
  const { user, userData, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");

  // Helper function to get token
  const getToken = async () => {
    const { auth } = await import("../services/firebase");
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      setError("Unauthorized access. Admin privileges required.");
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin()) {
      fetchPayments();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchPayments = async () => {
    try {
      const token = await getToken();
      console.log("🔑 Fetching payments with token:", token ? "Yes" : "No");

      const response = await fetch(`${api.BASE_URL}/admin/payment-requests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Payments response status:", response.status);

      if (response.status === 403) {
        setError("Unauthorized. Admin access required.");
        return;
      }

      if (response.status === 404) {
        console.log("No payment_requests collection yet");
        setPayments([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Payments data:", data);
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Don't set error for empty collection
      setPayments([]);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("🔑 Fetching users with token:", token ? "Yes" : "No");

      const response = await fetch(`${api.BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Users response status:", response.status);

      if (response.status === 403) {
        setError("Unauthorized. Admin access required.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Users data:", data);
      setUsers(data.users || []);
      setError("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users from Firestore");
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (paymentId, userId, credits) => {
    try {
      const token = await getToken();
      const response = await fetch(`${api.BASE_URL}/admin/approve-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          user_id: userId,
          credits: credits,
        }),
      });

      if (response.ok) {
        setNotification(`✅ Approved! ${credits} credits added.`);
        fetchPayments();
        fetchUsers();
        setTimeout(() => setNotification(""), 3000);
      } else {
        const error = await response.json();
        setNotification(`❌ Failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      setNotification("❌ Failed to approve payment");
    }
  };

  const rejectPayment = async (paymentId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${api.BASE_URL}/admin/reject-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_id: paymentId }),
      });

      if (response.ok) {
        setNotification("❌ Payment rejected");
        fetchPayments();
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
    }
  };

  const addCreditsToUser = async (userId, credits) => {
    if (!credits || credits < 1) {
      setNotification("Please enter a valid credit amount");
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${api.BASE_URL}/admin/add-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, credits: parseInt(credits) }),
      });

      if (response.ok) {
        setNotification(`✅ Added ${credits} credits to user!`);
        fetchUsers();
        setShowAddCreditModal(false);
        setCreditAmount("");
        setSelectedUser(null);
        setTimeout(() => setNotification(""), 3000);
      } else {
        const error = await response.json();
        setNotification(`❌ Failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding credits:", error);
      setNotification("❌ Failed to add credits");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const filteredUsers = users.filter(
    (userItem) =>
      userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.uid?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unauthorized
          </h2>
          <p className="text-gray-500">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-teal-400" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full">
                Secure Area
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {userData?.username || user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-3 animate-fadeIn">
          <p className="text-sm">{notification}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-teal-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter((p) => p.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Credits Given</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.reduce((sum, u) => sum + (u.credits || 0), 0)}
                </p>
              </div>
              <Coins className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "payments"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Payment Requests
            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              {payments.filter((p) => p.status === "pending").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "users"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Users & Credits ({users.length})
          </button>
        </div>

        {/* Payment Requests Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">
                Payment Verifications
              </h2>
              <p className="text-sm text-gray-500">
                Verify payments and add credits to users
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No payment requests found</p>
                <p className="text-xs text-gray-400 mt-1">
                  When users submit payment requests, they will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Receipt #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.user_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.user_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {payment.credits}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-teal-600">
                          {payment.amount} Birr
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {payment.receipt_number}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  approvePayment(
                                    payment.id,
                                    payment.user_id,
                                    payment.credits,
                                  )
                                }
                                className="text-green-600 hover:text-green-800"
                                title="Approve"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => rejectPayment(payment.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users & Credits Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, username, or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  All Users from Firestore
                </h2>
                <button
                  onClick={fetchUsers}
                  className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <Loader className="h-8 w-8 animate-spin text-teal-500 mx-auto" />
                  <p className="mt-2 text-gray-500">
                    Loading users from Firestore...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found in Firestore</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Make sure users collection exists in Firestore
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          UID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.uid} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.username || userItem.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {userItem.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-500">
                            {userItem.uid?.slice(0, 12)}...
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-teal-600">
                              {userItem.credits || 0}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">
                              credits
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {userItem.role === "admin" ? (
                              <span className="inline-flex items-center space-x-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs">
                                <Shield className="h-3 w-3" />
                                <span>Admin</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {userItem.createdAt
                              ? new Date(
                                  userItem.createdAt,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedUser(userItem);
                                setShowAddCreditModal(true);
                              }}
                              className="flex items-center space-x-1 text-teal-600 hover:text-teal-700"
                            >
                              <Coins className="h-4 w-4" />
                              <span className="text-sm">Add Credits</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Credits Modal */}
      {showAddCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add Credits
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              User: <span className="font-medium">{selectedUser.email}</span>
              <br />
              Current credits:{" "}
              <span className="font-medium text-teal-600">
                {selectedUser.credits || 0}
              </span>
            </p>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Enter credit amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              min="1"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => addCreditsToUser(selectedUser.uid, creditAmount)}
                disabled={!creditAmount || creditAmount < 1}
                className="flex-1 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50"
              >
                Add Credits
              </button>
              <button
                onClick={() => {
                  setShowAddCreditModal(false);
                  setSelectedUser(null);
                  setCreditAmount("");
                }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
