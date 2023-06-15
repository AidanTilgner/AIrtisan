import React, { useContext, useEffect, useMemo } from "react";
import { createContext } from "react";
import { Theme, Themes } from "../../documentation/theme";
import { resolveTheme } from "../hooks/theme";

interface SettingsContextValue {
  theme: {
    current: Themes;
    set: (theme: Themes) => void;
    toggle: () => void;
    resolved: Theme | undefined;
  };
}

const defaultValue: SettingsContextValue = {
  theme: {
    current: "dark",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toggle: () => {},
    resolved: undefined,
  },
};

export const SettingsContext = createContext(defaultValue);

const writeSettingsToLocalStorage = (settings: SettingsContextValue) => {
  localStorage.setItem("settings", JSON.stringify(settings));
};

const readSettingsFromLocalStorage = (): SettingsContextValue => {
  const settings = localStorage.getItem("settings");
  if (!settings) return defaultValue;
  return JSON.parse(settings);
};

const getSettingFromLocalStorage = <T extends keyof SettingsContextValue>(
  key: T
) => {
  const settings = readSettingsFromLocalStorage();
  return settings[key];
};

export function SettingsProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [theme, setTheme] = React.useState<Themes>(
    getSettingFromLocalStorage("theme").current
  );

  const resolvedTheme = resolveTheme(theme);

  const value = useMemo<SettingsContextValue>(
    () => ({
      theme: {
        current: theme,
        set: (theme: Themes) => {
          setTheme(theme);
        },
        toggle: () => {
          setTheme(theme === "dark" ? "light" : "dark");
        },
        resolved: resolvedTheme,
      },
    }),
    [theme]
  );

  useEffect(() => {
    writeSettingsToLocalStorage(value);
  }, [value]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
