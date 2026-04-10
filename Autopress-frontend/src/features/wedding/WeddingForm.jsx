import {
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  MapPin,
  Loader,
} from "lucide-react";

const WeddingForm = ({
  formData,
  onChange,
  quantity,
  onQuantityChange,
  language,
  onLanguageChange,
  onBack,
  onGenerate,
  isGenerating,
}) => {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const isFormValid = () => {
    return (
      formData.name1 &&
      formData.name2 &&
      formData.wedding_date_sentence &&
      formData.wedding_time &&
      formData.wedding_day &&
      formData.wedding_month &&
      formData.wedding_year &&
      formData.father_name &&
      formData.mother_name &&
      formData.venue_address
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Wedding Details
        </h2>

        {/* Card Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="ilma"
                checked={formData.card_mode === "ilma"}
                onChange={(e) => handleChange("card_mode", e.target.value)}
                className="h-4 w-4 text-pink-500"
              />
              <span className="text-sm">ILMA (Groom's family)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="intala"
                checked={formData.card_mode === "intala"}
                onChange={(e) => handleChange("card_mode", e.target.value)}
                className="h-4 w-4 text-pink-500"
              />
              <span className="text-sm">INTALA (Bride's family)</span>
            </label>
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.card_mode === "ilma" ? "Groom Name" : "Bride Name"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name1}
              onChange={(e) => handleChange("name1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.card_mode === "ilma" ? "Bride Name" : "Groom Name"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name2}
              onChange={(e) => handleChange("name2", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Full name"
            />
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wedding Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.wedding_date_sentence}
            onChange={(e) =>
              handleChange("wedding_date_sentence", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g., 12/04/2017"
          />
        </div>

        {/* Time & Date Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.wedding_time}
              onChange={(e) => handleChange("wedding_time", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="10:00 AM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.wedding_day}
              onChange={(e) => handleChange("wedding_day", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Saturday"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.wedding_month}
              onChange={(e) => handleChange("wedding_month", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="March"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.wedding_year}
              onChange={(e) => handleChange("wedding_year", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="2024"
            />
          </div>
        </div>

        {/* Parents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Father's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.father_name}
              onChange={(e) => handleChange("father_name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Father's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.mother_name}
              onChange={(e) => handleChange("mother_name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Mother's full name"
            />
          </div>
        </div>

        {/* Venue */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.venue_address}
            onChange={(e) => handleChange("venue_address", e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Ceremony and reception venue address"
          />
        </div>

        {/* Quantity & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) =>
                onQuantityChange(
                  Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)),
                )
              }
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-center"
            />
            <p className="text-xs text-gray-500 mt-1">cards (max 1000)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="both"
                  checked={language === "both"}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="h-4 w-4 text-pink-500"
                />
                <span className="text-sm">Both</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="amharic"
                  checked={language === "amharic"}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="h-4 w-4 text-pink-500"
                />
                <span className="text-sm">Amharic</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="english"
                  checked={language === "english"}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="h-4 w-4 text-pink-500"
                />
                <span className="text-sm">English</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Total Cost:{" "}
            <span className="font-bold text-pink-600">
              {Math.ceil(quantity / 50)} credits
            </span>{" "}
            ({quantity} cards = 1 credit per 50 cards)
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Templates</span>
          </button>
          <button
            onClick={onGenerate}
            disabled={!isFormValid() || isGenerating}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Wedding Cards</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeddingForm;
