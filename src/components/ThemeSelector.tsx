import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeSelector: React.FC = () => {
    const { currentTheme, availableThemes, setTheme, theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="flex items-center gap-2 p-2 rounded-lg shadow-md transition-all duration-200 border border-transparent hover:border-accent focus:outline-none"
                style={{
                    background: `linear-gradient(90deg, ${currentTheme.colors.accent} 0%, ${currentTheme.colors.secondary} 100%)`,
                    color: currentTheme.colors.background,
                }}
                aria-label="Choose Theme"
            >
                <span
                    className="w-5 h-5 rounded-full border-2 border-white shadow"
                    style={{
                        backgroundColor: currentTheme.colors.accent,
                        display: 'inline-block',
                    }}
                />
                <Palette className="w-5 h-5 opacity-80" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-72  rounded-xl shadow-2xl border-2 z-50 animate-fade-in"
                    style={{
                        backgroundColor: currentTheme.colors.primary,
                        borderColor: currentTheme.colors.accent,
                        minWidth: 220,
                    }}
                >
                    {/* Arrow pointer */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-inherit border-t-2 border-l-2"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            borderColor: currentTheme.colors.accent,
                            transform: 'rotate(45deg)',
                            zIndex: 1,
                        }}
                    />
                    <div className="p-5 h-96 overflow-y-auto custom-scrollbar">
                        <h3 className="text-xl font-bold mb-4 tracking-tight" style={{ color: currentTheme.colors.text }}>
                            🎨 Choose Your Theme
                        </h3>
                        <div className="space-y-2">
                            {availableThemes.map((themeOption) => (
                                <button
                                    key={themeOption.name}
                                    onClick={() => {
                                        setTheme(themeOption.name);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border-2 group hover:transform hover:scale-[1.02]
                                        ${theme === themeOption.name
                                            ? 'border-accent ring-2 ring-accent shadow-lg'
                                            : 'border-transparent hover:border-accent hover:shadow-md'
                                        }`}
                                    style={{
                                        background: theme === themeOption.name
                                            ? `linear-gradient(90deg, ${themeOption.colors.accent} 0%, ${themeOption.colors.secondary} 100%)`
                                            : themeOption.colors.secondary,
                                        color: theme === themeOption.name
                                            ? themeOption.colors.background
                                            : themeOption.colors.text,
                                        boxShadow: theme === themeOption.name ? '0 2px 12px 0 rgba(0,0,0,0.08)' : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="w-4 h-4 rounded-full border shadow-sm"
                                                style={{
                                                    backgroundColor: themeOption.colors.accent,
                                                    borderColor: themeOption.colors.text,
                                                }}
                                            />
                                            <span
                                                className="w-4 h-4 rounded-full border shadow-sm"
                                                style={{
                                                    backgroundColor: themeOption.colors.secondary,
                                                    borderColor: themeOption.colors.text,
                                                }}
                                            />
                                            <span
                                                className="w-4 h-4 rounded-full border shadow-sm"
                                                style={{
                                                    backgroundColor: themeOption.colors.primary,
                                                    borderColor: themeOption.colors.text,
                                                }}
                                            />
                                        </div>
                                        <span className="font-medium text-sm">{themeOption.name}</span>
                                    </div>
                                    {theme === themeOption.name && (
                                        <Check className="w-5 h-5 text-accent animate-bounce-in" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Animations and Styles */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.18s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-bounce-in {
                    animation: bounceIn 0.4s;
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.7); opacity: 0; }
                    60% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${currentTheme.colors.accent};
                    border-radius: 10px;
                    opacity: 0.7;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${currentTheme.colors.primaryDark};
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};