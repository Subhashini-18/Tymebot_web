import React from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export default function Header({
  title = "Third Party Risk Intelligence Platform",
  showLogout = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authData");

    // Show logout message
    showToast({
      message: "Successfully logged out",
      type: "success",
    });

    // Navigate to login page
    navigate("/login");
  };

  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData) : null;
  };

  const authData = getAuthData();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-l mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 p-2">
            <div className="flex items-center ">
              <img
                src="/src/assets/images/Frame 121.png"
                alt="G3 SEC.AI Logo"
                className="h-10 w-auto object-cover"
                draggable={false}
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
          </div>

          {/* User Actions */}
          {showLogout && authData && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{authData.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
