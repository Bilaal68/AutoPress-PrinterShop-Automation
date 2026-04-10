// src/layouts/TopBar.jsx
import { Bell, User, Coins } from "lucide-react";

const TopBar = () => {
  const mockUser = {
    name: "Bilal Mohamed",
    credits: 250,
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Fayda ID Processor
        </h1>
        <p className="text-sm text-gray-500">
          Extract and generate Ethiopian ID cards
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Credits Badge */}
        <div className="flex items-center space-x-2 bg-teal-50 px-3 py-1.5 rounded-lg">
          <Coins className="h-5 w-5 text-teal-600" />
          <span className="font-semibold text-teal-600">
            {mockUser.credits}
          </span>
          <span className="text-sm text-gray-600">credits</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="text-sm font-semibold text-gray-900">
              {mockUser.name}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
