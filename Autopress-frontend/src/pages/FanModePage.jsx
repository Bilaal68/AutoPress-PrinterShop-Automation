// src/pages/FanModePage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Barcode } from "lucide-react";

const FanModePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Barcode className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            FAN Mode
          </h2>
          <p className="text-gray-500">Coming soon</p>
        </div>
      </main>
    </div>
  );
};

export default FanModePage;
