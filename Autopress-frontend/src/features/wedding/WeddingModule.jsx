import { useState, useEffect } from "react";
import TemplateSelector from "./TemplateSelector";
import WeddingForm from "./WeddingForm";
import WeddingPreview from "./WeddingPreview";
import { Heart, Loader, Check, ArrowRight } from "lucide-react";
import api from "../../services/api";

const WeddingModule = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [language, setLanguage] = useState("both");
  const [formData, setFormData] = useState({
    card_mode: "ilma",
    name1: "",
    name2: "",
    wedding_date_sentence: "",
    wedding_time: "",
    wedding_day: "",
    wedding_month: "",
    wedding_year: "",
    father_name: "",
    mother_name: "",
    venue_address: "",
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await api.getWeddingTemplates();
      console.log("Templates loaded:", result);
      setTemplates(result.templates || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
      alert("Failed to load templates: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      alert("Please select a template");
      return;
    }

    setIsLoading(true);
    setProgressMessage(`Generating ${quantity} wedding card(s)...`);

    try {
      const pdfBlob = await api.generateWeddingCard(
        selectedTemplate.id,
        quantity,
        language,
        formData,
      );

      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdf({
        url: pdfUrl,
        filename: `wedding_cards_${quantity}.pdf`,
      });

      setProgressMessage("");
      setCurrentStep(4);
    } catch (error) {
      console.error("Generation error:", error);
      alert(`Failed to generate: ${error.message}`);
      setProgressMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setGeneratedPdf(null);
    setFormData({
      card_mode: "ilma",
      name1: "",
      name2: "",
      wedding_date_sentence: "",
      wedding_time: "",
      wedding_day: "",
      wedding_month: "",
      wedding_year: "",
      father_name: "",
      mother_name: "",
      venue_address: "",
    });
    setQuantity(1);
    setLanguage("both");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Wedding Card Generator</h1>
            <p className="text-pink-100">
              Create beautiful Ethiopian wedding invitations
            </p>
          </div>
        </div>
      </div>

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
              className={`flex items-center ${currentStep >= 1 ? "text-pink-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="ml-2 text-sm font-medium">Template</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div
              className={`flex items-center ${currentStep >= 2 ? "text-pink-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div
              className={`flex items-center ${currentStep >= 3 ? "text-pink-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {currentStep > 3 ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Template Selector */}
      {currentStep === 1 && (
        <TemplateSelector
          templates={templates}
          isLoading={isLoading}
          selectedTemplate={selectedTemplate}
          onSelect={setSelectedTemplate}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* Step 2: Wedding Form */}
      {currentStep === 2 && (
        <WeddingForm
          formData={formData}
          onChange={setFormData}
          quantity={quantity}
          onQuantityChange={setQuantity}
          language={language}
          onLanguageChange={setLanguage}
          onBack={() => setCurrentStep(1)}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
        />
      )}

      {/* Step 3: Preview */}
      {currentStep === 3 && (
        <WeddingPreview
          template={selectedTemplate}
          formData={formData}
          quantity={quantity}
          language={language}
          onBack={() => setCurrentStep(2)}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
        />
      )}

      {/* Step 4: Result */}
      {currentStep === 4 && generatedPdf && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Wedding Cards Generated!
              </h3>
              <p className="text-gray-600">
                {quantity} card(s) ready for printing
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center h-96">
              <div className="text-center w-full">
                <Heart className="h-12 w-12 text-pink-400 mx-auto mb-2" />
                <p className="text-gray-500">PDF Preview</p>
                {generatedPdf.url && (
                  <iframe
                    src={generatedPdf.url}
                    className="w-full h-80 mt-2"
                    title="PDF Preview"
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create Another Wedding Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingModule;
