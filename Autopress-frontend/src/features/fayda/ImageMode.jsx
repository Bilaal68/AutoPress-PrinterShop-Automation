// src/features/fayda/ImageMode.jsx
import api from "../../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Upload,
  X,
  Eye,
  Download,
  Printer,
  Settings,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Loader,
  Zap,
} from "lucide-react";

const ImageMode = () => {
  const navigate = useNavigate();
  const { credits, deductCredits, refreshUserData } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState({
    front: null,
    back: null,
    profile: null,
  });
  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    profile: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [colorProfile, setColorProfile] = useState("color");
  const [removeBg, setRemoveBg] = useState(true);
  const [queueStatus, setQueueStatus] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [processingMethod, setProcessingMethod] = useState(null);

  // Store extracted images from backend
  const [extractedProfileImage, setExtractedProfileImage] = useState(null);
  const [extractedQrImage, setExtractedQrImage] = useState(null);

  let pollingInterval = null;

  // Extracted data from backend - ALL 19+ FIELDS
  const [extractedData, setExtractedData] = useState({
    amharic_name: "",
    english_name: "",
    amharic_birth: "",
    english_birth: "",
    amharic_sex: "",
    english_sex: "",
    amharic_region: "",
    english_region: "",
    amharic_zone: "",
    english_zone: "",
    amharic_woreda: "",
    english_woreda: "",
    phone: "",
    fin: "",
    fan: "",
    issueDateEthiopian: "",
    issueDateGregorian: "",
    expiryDateEthiopian: "",
    expiryDateGregorian: "",
  });

  const handleFileUpload = (type, file) => {
    if (file) {
      setFiles({ ...files, [type]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [type]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    setFiles({ ...files, [type]: null });
    setPreviews({ ...previews, [type]: null });
  };

  const cleanupPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const pollJobStatus = async (jobId) => {
    cleanupPolling();

    pollingInterval = setInterval(async () => {
      try {
        const status = await api.getJobStatus(jobId);
        console.log("Job status:", status);

        if (status.status === "processing" || status.status === "pending") {
          setQueueStatus("processing");
        } else if (status.status === "completed") {
          cleanupPolling();
          setQueueStatus("completed");

          const pdfBlob = await api.getGeneratedPDF(jobId);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setGeneratedPdf({ url: pdfUrl, filename: `fayda_id_${jobId}.pdf` });

          setTimeout(() => {
            setCurrentStep(4);
          }, 1000);
        } else if (status.status === "failed") {
          cleanupPolling();
          alert(`Job failed: ${status.error || "Unknown error"}`);
          setCurrentStep(2);
          setQueueStatus(null);
          setJobId(null);
          setProcessingMethod(null);
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    }, 2000);
  };

  // Process profile photo with backend (background removal + grayscale)
  const processProfilePhoto = async (profileImageBase64) => {
    try {
      console.log("Processing profile photo with backend...");
      console.log("Options:", { removeBg, grayscale: colorProfile === "none" });

      const result = await api.processPhoto(
        profileImageBase64,
        removeBg,
        colorProfile === "none",
      );

      if (result.status === "success" && result.profile_image) {
        console.log("Photo processed successfully");
        // Return the processed image with proper data:image prefix
        return `data:image/png;base64,${result.profile_image}`;
      }
      console.log("Photo processing returned no image, using original");
      return profileImageBase64;
    } catch (error) {
      console.error("Photo processing error:", error);
      alert(`Photo processing failed: ${error.message}. Using original image.`);
      return profileImageBase64;
    }
  };

  // Step 1: Extract data
  const handleExtractData = async () => {
    if (!files.front || !files.back || !files.profile) {
      alert("Please upload all 3 images first");
      return;
    }

    setIsProcessing(true);
    setProgressMessage("Uploading images...");

    try {
      setProgressMessage("Processing ID card...");

      const result = await api.extractImageData(
        files.front,
        files.back,
        files.profile,
        { colorProfile, removeBg },
      );

      console.log("Full extraction result:", result);

      setProgressMessage("Processing extracted data...");

      // Store extracted data
      setExtractedData({
        amharic_name: result.amharic_name || "",
        english_name: result.english_name || "",
        amharic_birth: result.amharic_birth || "",
        english_birth: result.english_birth || "",
        amharic_sex: result.amharic_sex || "",
        english_sex: result.english_sex || "",
        amharic_region: result.amharic_region || "",
        english_region: result.english_region || "",
        amharic_zone: result.amharic_zone || "",
        english_zone: result.english_zone || "",
        amharic_woreda: result.amharic_woreda || "",
        english_woreda: result.english_woreda || "",
        phone: result.phone || "",
        fin: result.fin || "",
        fan: result.fan || "",
        issueDateEthiopian: result.issueDateEthiopian || "",
        issueDateGregorian: result.issueDateGregorian || "",
        expiryDateEthiopian: result.expiryDateEthiopian || "",
        expiryDateGregorian: result.expiryDateGregorian || "",
      });

      // Store the extracted profile and QR images from backend
      if (result.profile_image) {
        const profileImg = result.profile_image.startsWith("data:image")
          ? result.profile_image
          : `data:image/png;base64,${result.profile_image}`;
        setExtractedProfileImage(profileImg);
        console.log("✅ Extracted profile image stored");
      }

      if (result.qr_image) {
        const qrImg = result.qr_image.startsWith("data:image")
          ? result.qr_image
          : `data:image/png;base64,${result.qr_image}`;
        setExtractedQrImage(qrImg);
        console.log("✅ Extracted QR image stored");
      }

      setProgressMessage("");
      setCurrentStep(2);
    } catch (error) {
      console.error("Extraction error:", error);
      alert(`Failed to extract data: ${error.message}`);
      setProgressMessage("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setExtractedData({ ...extractedData, [field]: value });
  };

  // Option 1: Add to Queue (with photo processing and credit deduction)
  const handleAddToQueue = async () => {
    if (!extractedData.amharic_name) {
      alert("No extracted data found. Please go back and extract data first.");
      return;
    }

    // ✅ Check credits first
    if (credits < 1) {
      alert("Insufficient credits! You need 1 credit to generate an ID card.");
      navigate("/pricing");
      return;
    }

    setIsProcessing(true);
    setProgressMessage("Processing profile photo...");
    setProcessingMethod("queue");

    try {
      // Process the profile photo first if needed
      let processedProfileImage = extractedProfileImage;
      if (extractedProfileImage && (removeBg || colorProfile === "none")) {
        processedProfileImage = await processProfilePhoto(
          extractedProfileImage,
        );
        console.log("Profile photo processed for queue");
      }

      setProgressMessage("Adding job to queue...");

      const jobData = {
        cards: [
          {
            extracted_texts: extractedData,
            edited_texts: extractedData,
            profile_image: processedProfileImage
              ? processedProfileImage.split(",")[1] || processedProfileImage
              : null,
            qr_image: extractedQrImage
              ? extractedQrImage.split(",")[1] || extractedQrImage
              : null,
            use_black_and_white: colorProfile === "none",
            use_white_bg: removeBg,
          },
        ],
        template_count: 1,
      };

      console.log("Sending to queue with processed images:", {
        hasProfileImage: !!jobData.cards[0].profile_image,
        hasQrImage: !!jobData.cards[0].qr_image,
        removeBg: removeBg,
        grayscale: colorProfile === "none",
      });

      const result = await api.addToQueue(jobData);
      console.log("Queue response:", result);

      const newJobId = result.job_id;

      // ✅ Deduct 1 credit after successful queue addition
      const deducted = await deductCredits(1);
      if (!deducted) {
        alert("Failed to deduct credits. Please try again.");
        setIsProcessing(false);
        return;
      }

      // ✅ Refresh user data to update credits display
      await refreshUserData();

      setJobId(newJobId);
      setQueueStatus("queued");
      setProgressMessage("");
      setCurrentStep(3);

      pollJobStatus(newJobId);
    } catch (error) {
      console.error("Queue error:", error);
      alert(`Failed to add to queue: ${error.message}`);
      setProgressMessage("");
      setIsProcessing(false);
      setProcessingMethod(null);
    }
  };

  // Option 2: Process Now (Instant with photo processing and credit deduction)
  const handleProcessNow = async () => {
    if (!extractedData.amharic_name) {
      alert("No extracted data found. Please go back and extract data first.");
      return;
    }

    // ✅ Check credits first
    if (credits < 1) {
      alert("Insufficient credits! You need 1 credit to generate an ID card.");
      navigate("/pricing");
      return;
    }

    setIsProcessing(true);
    setProgressMessage("Processing profile photo...");
    setProcessingMethod("instant");

    try {
      // Process the profile photo first if needed
      let processedProfileImage = extractedProfileImage;
      if (extractedProfileImage && (removeBg || colorProfile === "none")) {
        processedProfileImage = await processProfilePhoto(
          extractedProfileImage,
        );
        console.log("Profile photo processed for instant");
      }

      setProgressMessage("Generating PDF...");

      const cardsData = [
        {
          extracted_texts: extractedData,
          edited_texts: extractedData,
          profile_image: processedProfileImage
            ? processedProfileImage.split(",")[1] || processedProfileImage
            : null,
          qr_image: extractedQrImage
            ? extractedQrImage.split(",")[1] || extractedQrImage
            : null,
          use_black_and_white: colorProfile === "none",
          use_white_bg: removeBg,
        },
      ];

      console.log("Processing now with processed images:", {
        hasProfileImage: !!cardsData[0].profile_image,
        hasQrImage: !!cardsData[0].qr_image,
        removeBg: removeBg,
        grayscale: colorProfile === "none",
      });

      const pdfBlob = await api.generatePDF(cardsData);
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // ✅ Deduct 1 credit after successful generation
      const deducted = await deductCredits(1);
      if (!deducted) {
        alert("Failed to deduct credits. Please try again.");
        setIsProcessing(false);
        return;
      }

      // ✅ Refresh user data to update credits display
      await refreshUserData();

      setGeneratedPdf({
        url: pdfUrl,
        filename: `fayda_id_instant_${Date.now()}.pdf`,
      });

      setProgressMessage("");
      setCurrentStep(4);
    } catch (error) {
      console.error("Instant processing error:", error);
      alert(`Failed to process: ${error.message}`);
      setProgressMessage("");
    } finally {
      setIsProcessing(false);
      setProcessingMethod(null);
    }
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

  const isUploadComplete = files.front && files.back && files.profile;

  return (
    <div className="space-y-6">
      {/* Credit Warning Banner */}
      {credits < 5 && credits > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-yellow-800">
            ⚠️ Low credits: Only {credits} credit(s) left
          </span>
          <button
            onClick={() => navigate("/pricing")}
            className="text-sm text-yellow-800 underline"
          >
            Buy more
          </button>
        </div>
      )}

      {credits === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-red-800">
            ❌ No credits remaining. Purchase credits to generate ID cards.
          </span>
          <button
            onClick={() => navigate("/pricing")}
            className="text-sm text-red-800 underline font-medium"
          >
            Buy Credits
          </button>
        </div>
      )}

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
              <span className="ml-2 text-sm font-medium">Upload</span>
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
              <span className="ml-2 text-sm font-medium">Edit</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />

            <div
              className={`flex items-center ${currentStep >= 3 ? "text-teal-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <span className="ml-2 text-sm font-medium">Process</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />

            <div
              className={`flex items-center ${currentStep >= 4 ? "text-teal-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                4
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Upload Files */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["front", "back", "profile"].map((type) => (
              <div
                key={type}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {type === "front"
                    ? "Front ID Card"
                    : type === "back"
                      ? "Back ID Card"
                      : "Profile + QR Code"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {!previews[type] ? (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(type, e.target.files[0])
                      }
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={previews[type]}
                      alt={type}
                      className="h-48 w-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(type)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
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
                <p className="text-sm text-gray-600">Cost: 1 credit</p>
                <p className="text-xs text-gray-500">
                  Balance: {credits} credits
                </p>
              </div>
              <button
                onClick={handleExtractData}
                disabled={!isUploadComplete || isProcessing}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Edit Information</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Edit Extracted Data & Choose Processing Method */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Show Extracted Images Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Extracted Images from ID Card
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Profile Photo
                </label>
                {extractedProfileImage ? (
                  <img
                    src={extractedProfileImage}
                    alt="Extracted Profile"
                    className="h-48 w-full object-contain border rounded-lg bg-gray-50"
                  />
                ) : (
                  <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-sm text-gray-500">
                      No profile image extracted
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted QR Code
                </label>
                {extractedQrImage ? (
                  <img
                    src={extractedQrImage}
                    alt="Extracted QR Code"
                    className="h-48 w-full object-contain border rounded-lg bg-gray-50"
                  />
                ) : (
                  <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-sm text-gray-500">
                      No QR code extracted
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              ✅ These images were automatically extracted from the uploaded ID
              card
            </p>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Edit Extracted Information
            </h3>

            <div className="mb-6">
              <h4 className="text-md font-medium text-teal-600 mb-3 border-b pb-2">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amharic Name
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_name}
                    onChange={(e) =>
                      handleInputChange("amharic_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_name}
                    onChange={(e) =>
                      handleInputChange("english_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date (Amharic)
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_birth}
                    onChange={(e) =>
                      handleInputChange("amharic_birth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date (English)
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_birth}
                    onChange={(e) =>
                      handleInputChange("english_birth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender (Amharic)
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_sex}
                    onChange={(e) =>
                      handleInputChange("amharic_sex", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender (English)
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_sex}
                    onChange={(e) =>
                      handleInputChange("english_sex", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-teal-600 mb-3 border-b pb-2">
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region (Amharic)
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_region}
                    onChange={(e) =>
                      handleInputChange("amharic_region", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region (English)
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_region}
                    onChange={(e) =>
                      handleInputChange("english_region", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone (Amharic)
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_zone}
                    onChange={(e) =>
                      handleInputChange("amharic_zone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone (English)
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_zone}
                    onChange={(e) =>
                      handleInputChange("english_zone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Woreda (Amharic)
                  </label>
                  <input
                    type="text"
                    value={extractedData.amharic_woreda}
                    onChange={(e) =>
                      handleInputChange("amharic_woreda", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Woreda (English)
                  </label>
                  <input
                    type="text"
                    value={extractedData.english_woreda}
                    onChange={(e) =>
                      handleInputChange("english_woreda", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-teal-600 mb-3 border-b pb-2">
                Contact & ID Numbers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={extractedData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FIN Number
                  </label>
                  <input
                    type="text"
                    value={extractedData.fin}
                    onChange={(e) => handleInputChange("fin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FAN Number
                  </label>
                  <input
                    type="text"
                    value={extractedData.fan}
                    onChange={(e) => handleInputChange("fan", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-teal-600 mb-3 border-b pb-2">
                Issue & Expiry Dates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date (Ethiopian)
                  </label>
                  <input
                    type="text"
                    value={extractedData.issueDateEthiopian}
                    onChange={(e) =>
                      handleInputChange("issueDateEthiopian", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date (Gregorian)
                  </label>
                  <input
                    type="text"
                    value={extractedData.issueDateGregorian}
                    onChange={(e) =>
                      handleInputChange("issueDateGregorian", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Ethiopian)
                  </label>
                  <input
                    type="text"
                    value={extractedData.expiryDateEthiopian}
                    onChange={(e) =>
                      handleInputChange("expiryDateEthiopian", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Gregorian)
                  </label>
                  <input
                    type="text"
                    value={extractedData.expiryDateGregorian}
                    onChange={(e) =>
                      handleInputChange("expiryDateGregorian", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Choose Processing Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Choose Processing Method</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-teal-500 transition-all">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-6 w-6 text-yellow-500" />
                  <h4 className="font-semibold text-gray-800">Add to Queue</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Your job will be processed when server is free
                </p>
                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  <p>⏱️ Wait time: 30 sec - 2 min</p>
                  <p>💰 Cost: 1 credit</p>
                </div>
                <button
                  onClick={handleAddToQueue}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-teal-500 text-teal-500 rounded-lg font-medium hover:bg-teal-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isProcessing && processingMethod === "queue" ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Adding to Queue...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Add to Queue</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-2 border-teal-500 rounded-lg p-6 bg-teal-50/30">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-6 w-6 text-teal-500" />
                  <h4 className="font-semibold text-gray-800">Process Now</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Get your ID card immediately
                </p>
                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  <p>⚡ Processing time: 5-10 seconds</p>
                  <p>💰 Cost: 1 credit</p>
                </div>
                <button
                  onClick={handleProcessNow}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isProcessing && processingMethod === "instant" ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Process Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

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

      {/* Step 3: Queue Status */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            {queueStatus === "queued" && (
              <>
                <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Job Added to Queue
                </h3>
                <p className="text-gray-600 mb-2">Job ID: {jobId}</p>
                <p className="text-gray-500">
                  Your job is queued and will be processed shortly.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full animate-pulse"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <p className="text-sm text-yellow-800 mt-2">
                    ⏳ Position in queue: Processing...
                  </p>
                </div>
              </>
            )}

            {queueStatus === "processing" && (
              <>
                <Loader className="h-16 w-16 text-teal-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Processing Your ID
                </h3>
                <p className="text-gray-600">Job ID: {jobId}</p>
                <div className="mt-4 bg-gray-100 rounded-lg p-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Generating PDF with your ID card...
                  </p>
                </div>
              </>
            )}

            {queueStatus === "completed" && (
              <>
                <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-600 mb-4">Your ID card is ready</p>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                >
                  View Preview
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                cleanupPolling();
                setCurrentStep(2);
                setQueueStatus(null);
                setJobId(null);
                setProcessingMethod(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel & Start New
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Print */}
      {currentStep === 4 && generatedPdf && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Generated ID Card</h3>
              {processingMethod === "queue" && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Processed via Queue
                </span>
              )}
              {processingMethod === "instant" && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                  Processed Instantly
                </span>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center h-96">
              <div className="text-center w-full">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">PDF Preview</p>
                <p className="text-sm text-gray-400">Job ID: {jobId}</p>
                {generatedPdf.url && generatedPdf.url !== "#" && (
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => {
                cleanupPolling();
                setCurrentStep(1);
                setGeneratedPdf(null);
                setFiles({ front: null, back: null, profile: null });
                setPreviews({ front: null, back: null, profile: null });
                setExtractedProfileImage(null);
                setExtractedQrImage(null);
                setQueueStatus(null);
                setJobId(null);
                setProcessingMethod(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Generate Another ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMode;
