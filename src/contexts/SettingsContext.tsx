
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type ColorScheme = 'blue' | 'green' | 'purple' | 'amber' | 'slate';
export type SidebarMode = 'expanded' | 'collapsed' | 'auto';

interface DashboardSettings {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  compactMode: boolean;
  setCompactMode: (mode: boolean) => void;
  cardsExpanded: Record<string, boolean>;
  toggleCardExpanded: (cardId: string) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<DashboardSettings | undefined>(undefined);

export const useSettings = (): DashboardSettings => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>("dashboard-color-scheme", "blue");
  const [sidebarMode, setSidebarMode] = useLocalStorage<SidebarMode>("dashboard-sidebar-mode", "auto");
  const [compactMode, setCompactMode] = useLocalStorage<boolean>("dashboard-compact-mode", false);
  const [cardsExpanded, setCardsExpanded] = useLocalStorage<Record<string, boolean>>("dashboard-cards-expanded", {});

  const toggleCardExpanded = (cardId: string) => {
    setCardsExpanded(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const resetSettings = () => {
    setColorScheme("blue");
    setSidebarMode("auto");
    setCompactMode(false);
    setCardsExpanded({});
  };

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-blue", "theme-green", "theme-purple", "theme-amber", "theme-slate"
    );
    document.documentElement.classList.add(`theme-${colorScheme}`);
    
    if (compactMode) {
      document.documentElement.classList.add("compact-mode");
    } else {
      document.documentElement.classList.remove("compact-mode");
    }
  }, [colorScheme, compactMode]);

  const value = {
    colorScheme,
    setColorScheme,
    sidebarMode,
    setSidebarMode,
    compactMode,
    setCompactMode,
    cardsExpanded,
    toggleCardExpanded,
    resetSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
