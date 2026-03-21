import { createContext, useContext, useEffect, useMemo } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    localStorage.setItem("plm_theme", "light");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: false,
      toggleTheme: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
