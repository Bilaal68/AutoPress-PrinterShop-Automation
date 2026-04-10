// src/layouts/Sidebar.jsx
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  User,
  Briefcase,
  Layout,
  CreditCard,
  Settings,
} from "lucide-react";

const Sidebar = ({ collapsed, setCollapsed, activeModule, onModuleChange }) => {
  const menuItems = [
    {
      id: "fayda",
      name: "Fayda ID Processor",
      icon: Camera,
      color: "text-teal-400",
      bgColor: "bg-teal-500/20",
      borderColor: "border-teal-400",
    },
    {
      id: "wedding",
      name: "Wedding Card",
      icon: Heart,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
      borderColor: "border-pink-400",
    },
    {
      id: "passport",
      name: "Passport Photo",
      icon: User,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400",
    },
    {
      id: "business",
      name: "Business Card",
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400",
    },
    {
      id: "photolayout",
      name: "Photo Layout",
      icon: Layout,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400",
    },
    {
      id: "credits",
      name: "Credits",
      icon: CreditCard,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-400",
    },
    {
      id: "admin",
      name: "Admin Dashboard",
      icon: Settings,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-400",
    },
  ];

  const handleMenuClick = (itemId) => {
    console.log("Clicked:", itemId); // For debugging
    onModuleChange(itemId);
  };

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"} bg-dark-navy transition-all duration-300 flex flex-col shadow-xl`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-teal-400" />
            <span className="text-white font-bold text-lg">AutoPress</span>
          </div>
        )}
        {collapsed && <Camera className="h-6 w-6 text-teal-400 mx-auto" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-8">
        <div className="px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } px-4 py-3 rounded-lg transition-all duration-200 ${
                activeModule === item.id
                  ? `${item.bgColor} border-l-4 ${item.borderColor} ${item.color}`
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${activeModule === item.id ? item.color : ""}`}
              />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>AutoPress v1.0</p>
            <p className="mt-1">Complete Print Solution</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
