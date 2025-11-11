import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes as configThemes, type Theme } from '@/components/config/themes';
interface ThemeContextType {
  theme: string;

  setTheme: (theme: string) => void;
  currentTheme: Theme;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({ children, defaultTheme = 'Platinum Elegant' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage?.getItem('theme');
    return savedTheme || defaultTheme;
  });

  const currentTheme: any = configThemes.find(t => t.name === theme) || configThemes[0];

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      currentTheme,
      availableThemes: configThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Legacy themes for backward compatibility
// export const themes: Record<string, any> = {
//   WorkflowEngine: {
//     name: 'WorkflowEngine',
//     icon: '⚡',
//     primary: 'bg-gray-900',
//     secondary: 'bg-gray-800',
//     text: 'text-yellow-400',
//     accent: 'bg-yellow-500',
//     muted: 'text-gray-500',
//     hover: 'hover:bg-yellow-500',
//     color: {
//       primary: '#1a1a1a',
//       secondary: '#262626',
//       text: '#fbbf24',
//       accent: '#f59e0b'
//     }
//   },
//   light: {
//     name: 'Light',
//     icon: '☀️',
//     primary: 'bg-white',
//     secondary: 'bg-gray-50',
//     text: 'text-gray-700',
//     accent: 'bg-gray-300',
//     muted: 'text-gray-200',
//     hover: "hover:bg-gray-300",
//     color: {
//       primary: '#ffffff',
//       secondary: '#f9fafb',
//       text: '#111827',
//       accent: '#2563eb'
//     }
//   },
//   dark: {
//     name: 'Dark',
//     icon: '🌙',
//     primary: 'bg-gray-900',
//     secondary: 'bg-gray-800',
//     text: 'text-white',
//     accent: 'bg-gray-500',
//     muted: 'text-gray-600',
//     hover: 'hover:bg-gray-500',
//     color: {
//       primary: '#111827',
//       secondary: '#1f2937',
//       text: '#f3f4f6',
//       accent: '#8b5cf6'
//     }
//   },
// }; 