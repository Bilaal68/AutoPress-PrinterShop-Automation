// src/features/fayda/PdfMode.jsx
import { useState } from "react";
import {
  Upload,
  X,
  FileText,
  Eye,
  Printer,
  Settings,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader,
  Download,
} from "lucide-react";
import api from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PdfMode = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [colorProfile, setColorProfile] = useState("color");
  const [removeBg, setRemoveBg] = useState(true);
  const [progressMessage, setProgressMessage] = useState("");

  const handlePdfUpload = (files) => {
    const newFiles = Array.from(files).slice(0, 5 - pdfFiles.length);
    setPdfFiles([...pdfFiles, ...newFiles]);
    setGeneratedPdf(null);
    setCurrentStep(1);
  };

  const removePdf = (index) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index));
    setGeneratedPdf(null);
  };

  // Process PDFs - Call backend with token
  const handleProcess = async () => {
    if (pdfFiles.length === 0) {
      alert("Please upload at least one PDF");
      return;
    }

    setIsProcessing(true);
    setProgressMessage("Uploading PDFs to server...");

    try {
      setProgressMessage("Extracting data from PDFs with AI...");

      // Create FormData for PDF upload
      const formData = new FormData();
      pdfFiles.forEach((file, index) => {
        formData.append(`pdf_${index + 1}`, file);
      });
      formData.append("color_profile", colorProfile);
      formData.append("remove_bg", removeBg);

      // Get the token
      const token = (await api.getToken?.()) || (await getTokenFromFirebase());

      // Call the process-pdf-template endpoint with token
      const response = await fetch(`${API_URL}/process-pdf-template`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Processing failed");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setGeneratedPdf({
        url: pdfUrl,
        filename: `fayda_pdfs_${Date.now()}.pdf`,
      });

      setProgressMessage("");
      setCurrentStep(3);
    } catch (error) {
      console.error("Processing error:", error);
      alert(`Failed to process: ${error.message}`);
      setProgressMessage("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get token
  const getTokenFromFirebase = async () => {
    const { auth } = await import("../../services/firebase");
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const handleDownload = () => {
    if (generatedPdf && generatedPdf.url) {
      const link = document.createElement("a");
      link.href = generatedPdf.url;
      link.download = generatedPdf.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (generatedPdf && generatedPdf.url) {
      const printWindow = window.open(generatedPdf.url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const hasFiles = pdfFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Progress Message */}
      {progressMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2">
          <Loader className="h-4 w-4 text-blue-500 animate-spin" />
          <p className="text-sm text-blue-700">{progressMessage}</p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div
              className={`flex items-center ${currentStep >= 1 ? "text-teal-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="ml-2 text-sm font-medium">Upload PDFs</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />

            <div
              className={`flex items-center ${currentStep >= 2 ? "text-teal-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="ml-2 text-sm font-medium">Process</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />

            <div
              className={`flex items-center ${currentStep >= 3 ? "text-teal-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                3
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Upload PDFs */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Upload PDFs (Max 5)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {pdfFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="border-2 border-gray-200 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 truncate">
                      {file.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removePdf(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {pdfFiles.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-500">Upload PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePdfUpload(e.target.files)}
                  />
                </label>
              )}
            </div>

            <p className="text-sm text-gray-500">
              {pdfFiles.length}/5 PDFs uploaded
            </p>
          </div>

          {/* Processing Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-teal-500" />
              <h3 className="font-semibold text-gray-800">
                Processing Options
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Profile
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="color"
                      checked={colorProfile === "color"}
                      onChange={(e) => setColorProfile(e.target.value)}
                      className="h-4 w-4 text-teal-500"
                    />
                    <span className="text-sm text-gray-700">Color Profile</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="none"
                      checked={colorProfile === "none"}
                      onChange={(e) => setColorProfile(e.target.value)}
                      className="h-4 w-4 text-teal-500"
                    />
                    <span className="text-sm text-gray-700">
                      No Color Profile (Grayscale)
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Background Removal
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      checked={removeBg === true}
                      onChange={() => setRemoveBg(true)}
                      className="h-4 w-4 text-teal-500"
                    />
                    <span className="text-sm text-gray-700">
                      Remove Background
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      checked={removeBg === false}
                      onChange={() => setRemoveBg(false)}
                      className="h-4 w-4 text-teal-500"
                    />
                    <span className="text-sm text-gray-700">
                      Keep Background
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost: 1 credit per PDF</p>
                <p className="text-xs text-gray-500">
                  Total: {pdfFiles.length} credits | Balance: 250
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!hasFiles}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <span>Next: Process PDFs</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Process */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Summary of files to process */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Ready to Process
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600">You are about to process:</p>
              <ul className="list-disc list-inside space-y-1">
                {pdfFiles.map((file, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚡ Processing {pdfFiles.length} PDF(s) will take{" "}
                  {pdfFiles.length * 5}-{pdfFiles.length * 10} seconds
                </p>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🖼️ Processing options:
                  {removeBg ? " ✓ Remove Background" : " ✗ Keep Background"}
                  {colorProfile === "none" ? " ✓ Grayscale" : " ✗ Color"}
                </p>
              </div>
            </div>
          </div>

          {/* Process Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Cost: {pdfFiles.length} credits
                </p>
                <p className="text-xs text-gray-500">
                  Balance after: {250 - pdfFiles.length} credits
                </p>
              </div>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Process Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Upload</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Print */}
      {currentStep === 3 && generatedPdf && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Generated ID Cards
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center h-96">
              <div className="text-center w-full">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">PDF Preview</p>
                <p className="text-xs text-gray-400 mt-1">
                  Processed with: {removeBg ? "Background Removed, " : ""}
                  {colorProfile === "none" ? "Grayscale" : "Color"}
                </p>
                {generatedPdf.url && (
                  <iframe
                    src={generatedPdf.url}
                    className="w-full h-80 mt-2"
                    title="PDF Preview"
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2 border border-teal-500 text-teal-500 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print Directly</span>
              </button>
            </div>
          </div>

          {/* New Batch Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => {
                setCurrentStep(1);
                setGeneratedPdf(null);
                setPdfFiles([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Process Another Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfMode;
