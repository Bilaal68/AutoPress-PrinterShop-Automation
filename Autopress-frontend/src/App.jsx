// src/App.jsx
import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import FaydaModule from "./features/fayda/FaydaModule";
import WeddingModule from "./features/wedding/WeddingModule";
import BackendStatus from "./components/BackendStatus";

function App() {
  const [activeModule, setActiveModule] = useState("fayda");

  const renderModule = () => {
    switch (activeModule) {
      case "fayda":
        return <FaydaModule />;
      case "wedding":
        return <WeddingModule />;
      case "passport":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Passport Photo Tool
            </h2>
            <p className="text-gray-600">
              Coming Soon - AI background removal, 30×40mm, A4 layout
            </p>
          </div>
        );
      case "business":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Business Card Generator
            </h2>
            <p className="text-gray-600">
              Coming Soon - Custom templates, professional designs
            </p>
          </div>
        );
      case "photolayout":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Photo Print Layout Tool
            </h2>
            <p className="text-gray-600">
              Coming Soon - Layout multiple photos on A4
            </p>
          </div>
        );
      case "credits":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Credits & Payment System
            </h2>
            <p className="text-gray-600">
              Coming Soon - WeBirr integration, buy credits
            </p>
          </div>
        );
      case "admin":
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Coming Soon - Analytics, user management, sales reports
            </p>
          </div>
        );
      default:
        return <FaydaModule />;
    }
  };

  return (
    <>
      <MainLayout activeModule={activeModule} onModuleChange={setActiveModule}>
        {renderModule()}
      </MainLayout>
      <BackendStatus />
    </>
  );
}

export default App;
