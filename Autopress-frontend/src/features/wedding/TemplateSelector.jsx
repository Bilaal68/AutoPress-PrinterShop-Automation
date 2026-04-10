import { Heart, Loader, Check, ArrowRight } from "lucide-react";
import { useState } from "react";

const TemplateSelector = ({
  templates,
  isLoading,
  selectedTemplate,
  onSelect,
  onNext,
}) => {
  const [imageErrors, setImageErrors] = useState({});

  // Get preview image URL from backend static folder
  const getPreviewUrl = (templateId) => {
    // Your backend serves static files from /static/previews/
    // Make sure your backend has CORS enabled for static files
    return `http://localhost:5000/static/previews/${templateId}.png`;
  };

  const handleImageError = (templateId) => {
    setImageErrors((prev) => ({ ...prev, [templateId]: true }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Loader className="h-8 w-8 animate-spin text-pink-500 mx-auto" />
        <p className="mt-2 text-gray-500">Loading templates...</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No templates available</p>
        <p className="text-sm text-gray-400 mt-2">
          Please check your backend connection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Choose Your Wedding Card Template
        </h2>
        <p className="text-gray-600 mb-6">
          Select a design that matches your wedding style
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedTemplate?.id === template.id
                  ? "border-pink-500 shadow-lg"
                  : "border-gray-200 hover:border-pink-300"
              } ${!template.available && "opacity-50 cursor-not-allowed"}`}
              onClick={() => template.available && onSelect(template)}
            >
              {/* Preview Image */}
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 h-56 flex items-center justify-center relative">
                {template.available ? (
                  !imageErrors[template.id] ? (
                    <img
                      src={getPreviewUrl(template.id)}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(template.id)}
                    />
                  ) : (
                    // Fallback when image fails to load
                    <div className="text-center p-4">
                      <Heart className="h-12 w-12 text-pink-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{template.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Preview not available
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center p-4">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Coming Soon</p>
                  </div>
                )}

                {/* Selected Badge */}
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {template.description}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Language:{" "}
                    {template.language === "both"
                      ? "አማርኛ + English"
                      : template.language}
                  </span>
                  {!template.available && (
                    <span className="text-xs text-red-500">Coming Soon</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            {selectedTemplate && (
              <p className="text-sm text-green-600">
                ✓ Selected: {selectedTemplate.name}
              </p>
            )}
          </div>
          <button
            onClick={onNext}
            disabled={!selectedTemplate}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <span>Next: Enter Details</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
