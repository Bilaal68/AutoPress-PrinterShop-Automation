// src/pages/PaymentPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Phone,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader,
  Coins,
  Receipt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, userData, addCredits, refreshUserData } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [step, setStep] = useState("select"); // select, payment, verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper function to get token
  const getToken = async () => {
    const { auth } = await import("../services/firebase");
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  const packages = [
    {
      id: "basic",
      credits: 50,
      price: 500,
      pricePerCredit: 10,
      popular: false,
    },
    { id: "pro", credits: 250, price: 2250, pricePerCredit: 9, popular: true },
    {
      id: "business",
      credits: 1000,
      price: 8000,
      pricePerCredit: 8,
      popular: false,
    },
  ];

  const paymentMethods = [
    { id: "webbir", name: "WeBirr", icon: Smartphone, color: "bg-green-500" },
    { id: "telebirr", name: "Telebirr", icon: Phone, color: "bg-blue-500" },
    { id: "cbe", name: "CBE Birr", icon: CreditCard, color: "bg-purple-500" },
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setStep("payment");
    setError("");
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    if (!receiptNumber || receiptNumber.trim() === "") {
      setError("Please enter your payment receipt number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch(`${api.BASE_URL}/submit-payment-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user?.uid,
          user_email: user?.email,
          user_name: userData?.username || user?.email,
          package_id: selectedPackage.id,
          credits: selectedPackage.credits,
          amount: selectedPackage.price,
          payment_method: paymentMethod,
          receipt_number: receiptNumber,
          transaction_id: transactionId || `TXN_${Date.now()}`,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSuccess(
          `Payment request submitted! Admin will verify and add ${selectedPackage.credits} credits to your account within 24 hours.`,
        );
        setTimeout(() => {
          navigate("/");
        }, 4000);
      } else {
        setError(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to submit payment request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("select");
      setSelectedPackage(null);
      setPaymentMethod("");
      setReceiptNumber("");
      setError("");
    } else {
      navigate("/pricing");
    }
  };

  if (step === "select") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Pricing</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your Purchase
            </h1>
            <p className="text-gray-500 mt-1">Select a package to continue</p>
          </div>

          {/* Package Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                  selectedPackage?.id === pkg.id
                    ? "border-teal-500"
                    : "border-gray-200 hover:border-teal-300"
                } relative`}
                onClick={() => handleSelectPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coins className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {pkg.credits} Credits
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-teal-600">
                      {pkg.price}
                    </span>
                    <span className="text-gray-500"> Birr</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.pricePerCredit} Birr/credit
                  </p>
                  <button
                    className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${
                      selectedPackage?.id === pkg.id
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selectedPackage?.id === pkg.id
                      ? "Selected"
                      : "Select Package"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          {selectedPackage && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep("payment")}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-500 mt-1">
            {selectedPackage?.credits} credits - {selectedPackage?.price} Birr
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    paymentMethod === method.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <method.icon
                    className={`h-6 w-6 mx-auto mb-2 ${paymentMethod === method.id ? "text-teal-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-sm font-medium ${paymentMethod === method.id ? "text-teal-600" : "text-gray-700"}`}
                  >
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Payment Instructions:
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>
                1. Open your{" "}
                {paymentMethod
                  ? paymentMethods.find((m) => m.id === paymentMethod)?.name
                  : "payment app"}
              </p>
              <p>
                2. Send <strong>{selectedPackage?.price} Birr</strong> to:
              </p>
              <div className="bg-white p-3 rounded-lg font-mono text-center">
                <p className="text-lg font-bold">09 123 4567</p>
                <p className="text-xs text-gray-500 mt-1">AutoPress Ethiopia</p>
              </div>
              <p>3. Enter the receipt/transaction number below</p>
            </div>
          </div>

          {/* Receipt Number */}
          <form onSubmit={handleSubmitPayment}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt / Transaction Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="e.g., WB123456789"
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the receipt number from your payment transaction
              </p>
            </div>

            {/* Transaction ID (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Optional transaction reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !paymentMethod || !receiptNumber}
              className="w-full py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Submitting Payment Request...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Submit Payment Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Package:</span>
            <span className="font-medium">
              {selectedPackage?.credits} Credits
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-teal-600">
              {selectedPackage?.price} Birr
            </span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            <p className="text-xs text-gray-500 text-center">
              Credits will be added to your account after admin verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
