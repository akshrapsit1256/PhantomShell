import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [health, setHealth] = useState({
    backend_status: 'Connecting...',
    database_status: 'Checking...',
    ollama_connected: false,
    ollama_status: 'Checking...',
    configured_model: 'gemma2:2b',
    model_available: false,
    available_models: [],
    ollama_url: 'http://localhost:11434',
    error_message: null,
    troubleshooting_guidance: null
  });

  const [settings, setSettings] = useState({
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'gemma2:2b',
    personality: 'Friendly Ghost',
    reduced_motion: false,
    halloween_theme: true
  });

  const [activePersonality, setActivePersonality] = useState('Friendly Ghost');
  const [toasts, setToasts] = useState([]);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add toast notification
  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch system health
  const refreshHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      setHealth((prev) => ({
        ...prev,
        backend_status: 'Unreachable',
        database_status: 'Unavailable',
        ollama_connected: false,
        ollama_status: 'Ghost Missing',
        error_message: err.message || 'Cannot connect to backend service.'
      }));
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  // Fetch settings
  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      if (data.personality) {
        setActivePersonality(data.personality);
      }
      // Apply theme and motion to document root
      if (data.reduced_motion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      if (!data.halloween_theme) {
        document.documentElement.classList.add('classic-theme');
      } else {
        document.documentElement.classList.remove('classic-theme');
      }
    } catch (err) {
      console.warn('Could not load settings:', err);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshSettings();

    // Poll health periodically every 25 seconds
    const interval = setInterval(refreshHealth, 25000);
    return () => clearInterval(interval);
  }, [refreshHealth, refreshSettings]);

  const value = {
    health,
    refreshHealth,
    isHealthLoading,
    settings,
    setSettings,
    refreshSettings,
    activePersonality,
    setActivePersonality,
    toasts,
    addToast,
    removeToast,
    mobileMenuOpen,
    setMobileMenuOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
