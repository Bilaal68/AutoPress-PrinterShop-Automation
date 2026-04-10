import { ArrowLeft, Eye, Heart, Loader } from "lucide-react";

const WeddingPreview = ({
  template,
  formData,
  quantity,
  language,
  onBack,
  onGenerate,
  isGenerating,
}) => {
  const getPreviewUrl = (templateId) => {
    return `http://localhost:5000/static/previews/${templateId}.png`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Preview Your Wedding Card
        </h2>

        {/* Template Preview */}
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[500px]">
          {template ? (
            <div className="relative max-w-md mx-auto">
              <img
                src={getPreviewUrl(template.id)}
                alt={template.name}
                className="rounded-lg shadow-lg max-h-96 w-auto mx-auto"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x600/FFD700/FFFFFF?text=Wedding+Card+Preview";
                }}
              />
              {/* Text Overlay Preview */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black bg-opacity-30 rounded-lg">
                <div className="bg-white bg-opacity-90 p-4 rounded-lg max-w-xs">
                  <p className="text-lg font-bold text-gray-800">
                    {formData.name1} & {formData.name2}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.wedding_date_sentence}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.wedding_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.wedding_day}, {formData.wedding_month}{" "}
                    {formData.wedding_year}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.venue_address}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No template selected</p>
            </div>
          )}
        </div>

        {/* Card Details Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Card Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-600">Template:</p>
            <p className="text-gray-800 font-medium">
              {template?.name || "Not selected"}
            </p>
            <p className="text-gray-600">Quantity:</p>
            <p className="text-gray-800">{quantity} cards</p>
            <p className="text-gray-600">Language:</p>
            <p className="text-gray-800">
              {language === "both" ? "Amharic & English" : language}
            </p>
            <p className="text-gray-600">Card Mode:</p>
            <p className="text-gray-800">
              {formData.card_mode === "ilma"
                ? "ILMA (Groom)"
                : "INTALA (Bride)"}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ This is a preview. The actual card will have text properly
            positioned and styled according to the template design.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Edit</span>
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Generate Final Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeddingPreview;
