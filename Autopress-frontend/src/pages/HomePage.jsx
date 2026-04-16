// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import {
  Camera,
  FileText,
  Barcode,
  Sparkles,
  User,
  Coins,
  ShoppingCart,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userData, logout, credits } = useAuth();

  // Get user's display name
  const getUserName = () => {
    if (userData?.displayName) return userData.displayName;
    if (user?.email) return user.email.split("@")[0];
    if (user?.phoneNumber) {
      const phone = user.phoneNumber;
      return phone.slice(-8);
    }
    return "User";
  };

  // Get user's email
  const getUserEmail = () => {
    return user?.email || userData?.email || "No email";
  };

  // Get user's credits
  const getUserCredits = () => {
    return credits || userData?.credits || 0;
  };

  const modes = [
    {
      id: "image",
      title: "Image Mode",
      icon: Camera,
      status: "active",
      color: "teal",
      action: () => navigate("/image-mode"),
    },
    {
      id: "pdf",
      title: "PDF Mode",
      icon: FileText,
      status: "active",
      color: "blue",
      action: () => navigate("/pdf-mode"),
    },
    {
      id: "fan",
      title: "FAN Mode",
      icon: Barcode,
      status: "coming-soon",
      color: "purple",
      action: () => navigate("/fan-mode"),
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Profile, Credits, and Pricing */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-teal-600 p-2 rounded-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                AutoPress
              </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Pricing Button */}
              <button
                onClick={() => navigate("/pricing")}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                  Buy Credits
                </span>
              </button>

              {/* Credits Display */}
              <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1.5 rounded-lg">
                <Coins className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-600">
                  {getUserCredits()}
                </span>
                <span className="text-xs text-gray-500">credits</span>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {getUserName()}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-gray-500">{getUserEmail()}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <Coins className="h-3 w-3 text-teal-600" />
                      <p className="text-xs text-teal-600 font-medium">
                        {getUserCredits()} credits available
                      </p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate("/pricing")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Buy Credits</span>
                    </button>
                    <button
                      onClick={() => navigate("/image-mode")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Image Mode</span>
                    </button>
                    <button
                      onClick={() => navigate("/pdf-mode")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>PDF Mode</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Fayda ID Generator
        </h1>
        <p className="text-gray-500 text-lg">Print-ready ID cards in seconds</p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{getUserCredits()} credits available</span>
          <span className="mx-2">•</span>
          <span>1 credit = 1 ID card</span>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={mode.action}
              disabled={mode.status === "coming-soon"}
              className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-200 ${
                mode.status === "active"
                  ? "hover:shadow-md hover:border-gray-300 cursor-pointer"
                  : "opacity-60 cursor-not-allowed border-gray-200"
              }`}
            >
              <div className="p-8 text-center">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    mode.color === "teal"
                      ? "bg-teal-50"
                      : mode.color === "blue"
                        ? "bg-blue-50"
                        : "bg-purple-50"
                  }`}
                >
                  <mode.icon
                    className={`h-8 w-8 ${
                      mode.color === "teal"
                        ? "text-teal-600"
                        : mode.color === "blue"
                          ? "text-blue-600"
                          : "text-purple-600"
                    }`}
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {mode.title}
                </h3>

                {mode.status === "coming-soon" ? (
                  <span className="inline-block text-xs text-gray-400">
                    Coming soon
                  </span>
                ) : (
                  <div className="flex items-center justify-center text-teal-600 text-sm font-medium">
                    <span>Start</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © 2026 AutoPress Ethiopia. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
