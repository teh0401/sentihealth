import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AccessibilityContextValue {
  enabled: boolean;
  toggle: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("accessibility") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("accessibility");
      try { localStorage.setItem("accessibility", "1"); } catch {}
      // Voice feedback (if available)
      try {
        const msg = new SpeechSynthesisUtterance("Accessibility mode enabled. High contrast and larger text activated.");
        msg.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
      } catch {}
    } else {
      root.classList.remove("accessibility");
      try { localStorage.setItem("accessibility", "0"); } catch {}
    }
  }, [enabled]);

  const value = useMemo(() => ({
    enabled,
    toggle: () => setEnabled((v) => !v),
  }), [enabled]);

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
};
