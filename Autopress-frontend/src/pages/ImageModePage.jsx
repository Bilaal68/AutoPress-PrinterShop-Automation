// src/pages/ImageModePage.jsx
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  FileText,
  Barcode,
  User,
  Coins,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ImageMode from "../features/fayda/ImageMode";

const ImageModePage = () => {
  const navigate = useNavigate();
  const { user, credits } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Back Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </button>

            {/* Center - Mode Switcher */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => navigate("/image-mode")}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-teal-500 text-white text-sm"
              >
                <Camera className="h-4 w-4" />
                <span>Image</span>
              </button>
              <button
                onClick={() => navigate("/pdf-mode")}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-200 text-sm"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => navigate("/fan-mode")}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-200 text-sm"
              >
                <Barcode className="h-4 w-4" />
                <span>FAN</span>
              </button>
            </div>

            {/* Right - Credits & User */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/pricing")}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors text-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                  Buy
                </span>
              </button>

              <div className="flex items-center space-x-2 bg-teal-50 px-2 py-1.5 rounded-lg">
                <Coins className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-600">
                  {credits || 0}
                </span>
              </div>

              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <ImageMode />
      </main>
    </div>
  );
};

export default ImageModePage;
