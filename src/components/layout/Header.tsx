import React from 'react';
import { Bell, Search, Settings, User, Menu } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarCollapsed }) => {
  const { currentTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-4 py-4 mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      style={{
        backgroundColor: currentTheme.colors.primary,
        borderColor: currentTheme.colors.accent,
        color: currentTheme.colors.text
      }}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
          style={{
            backgroundColor: currentTheme.colors.secondary,
            color: currentTheme.colors.text
          }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border-2"
            style={{
              backgroundColor: currentTheme.colors.accent,
              color: currentTheme.colors.background,
              borderColor: currentTheme.colors.primaryBorder
            }}>
            WF
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">Workflow Engine</h1>
            <p className="text-xs opacity-75">Management System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 w-48 lg:w-64"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              borderColor: currentTheme.colors.accent,
              color: currentTheme.colors.text
            }}
          />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            className="p-2 rounded-lg hover:bg-opacity-80 transition-colors relative"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              color: currentTheme.colors.text
            }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs"
              style={{ backgroundColor: currentTheme.colors.accent }}>
            </span>
          </button>

          <ThemeSelector />

          <button
            className="p-2 rounded-lg hover:bg-opacity-80 transition-colors hidden sm:block"
            style={{
              backgroundColor: currentTheme.colors.secondary,
              color: currentTheme.colors.text
            }}
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
            style={{ backgroundColor: currentTheme.colors.secondary }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.colors.accent, color: currentTheme.colors.background }}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};