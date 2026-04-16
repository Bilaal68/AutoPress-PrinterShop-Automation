// src/pages/PricingPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Coins, Sparkles, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PricingPage = () => {
  const navigate = useNavigate();
  const { credits } = useAuth();

  const packages = [
    {
      id: "basic",
      name: "Basic",
      credits: 50,
      price: 500,
      pricePerCredit: 10,
      features: [
        "50 ID card generations",
        "Image Mode access",
        "PDF Mode access",
        "Email support",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Professional",
      credits: 250,
      price: 2250,
      pricePerCredit: 9,
      features: [
        "250 ID card generations",
        "Image Mode access",
        "PDF Mode access",
        "Priority support",
        "Bulk processing",
      ],
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      credits: 1000,
      price: 8000,
      pricePerCredit: 8,
      features: [
        "1000 ID card generations",
        "All modes access",
        "Priority support",
        "Bulk processing",
        "Dedicated account manager",
        "API access",
      ],
      popular: false,
    },
  ];

  const handleBuyNow = (pkg) => {
    navigate("/payment", { state: { selectedPackage: pkg } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-teal-600 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Buy Credits
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1.5 rounded-lg">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-600">
                Your balance: {credits} credits
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Choose Your Credit Package
        </h1>
        <p className="text-gray-500">
          1 credit = 1 ID card generation. Bulk discounts available.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-sm border transition-all hover:shadow-lg ${pkg.popular ? "border-teal-300 shadow-md" : "border-gray-200"}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {pkg.credits}
                  </span>
                  <span className="text-gray-500"> credits</span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-teal-600">
                    {pkg.price}
                  </span>
                  <span className="text-gray-500"> Birr</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  {pkg.pricePerCredit === 10
                    ? `${pkg.pricePerCredit} Birr per credit`
                    : `${pkg.pricePerCredit} Birr per credit (Save ${Math.round((10 - pkg.pricePerCredit) * 10)}%)`}
                </p>
                <button
                  onClick={() => handleBuyNow(pkg)}
                  className={`w-full py-3 rounded-xl font-medium transition-all mb-6 ${pkg.popular ? "bg-teal-500 hover:bg-teal-600 text-white shadow-lg" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                >
                  Buy {pkg.credits} Credits
                </button>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Includes:
                  </p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            💡 1 credit = 1 ID card generation. Credits never expire.
          </p>
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">Secure payment methods</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">WeBirr</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Telebirr</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">CBE Birr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
