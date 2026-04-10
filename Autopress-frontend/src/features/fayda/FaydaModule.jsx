// src/features/fayda/FaydaModule.jsx
import { useState } from "react";
import ImageMode from "./ImageMode";
import PdfMode from "./PdfMode";
import { Image, FileText } from "lucide-react";

const FaydaModule = () => {
  const [mode, setMode] = useState("image");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mode Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
        <button
          onClick={() => setMode("image")}
          className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-all ${
            mode === "image"
              ? "bg-teal-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Image className="h-4 w-4" />
          <span>Image Mode</span>
        </button>
        <button
          onClick={() => setMode("pdf")}
          className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-all ${
            mode === "pdf"
              ? "bg-teal-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>PDF Mode</span>
        </button>
      </div>

      {/* Mode Content */}
      {mode === "image" ? <ImageMode /> : <PdfMode />}
    </div>
  );
};

export default FaydaModule;
