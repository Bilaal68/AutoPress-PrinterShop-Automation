// src/layouts/MainLayout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const MainLayout = ({ children, activeModule, onModuleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeModule={activeModule}
        onModuleChange={onModuleChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
