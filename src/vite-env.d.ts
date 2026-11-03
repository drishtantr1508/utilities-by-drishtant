/// <reference types="vite/client" />

interface Window {
  AndroidThemeBridge?: {
    setSystemBarTheme: (isDark: boolean) => void;
  };
}

