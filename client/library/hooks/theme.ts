import { useSettings } from "../contexts/Settings";
import { Theme, Themes } from "../../documentation/theme";
import { darkTheme, lightTheme } from "../helpers/theme";
import { useEffect } from "react";

export const useSetThemeVariables = () => {
  const {
    theme: { resolved, current },
  } = useSettings();

  useEffect(() => {
    if (resolved) {
      setCSSVariablesForTheme(resolved);
    }
  }, [resolved, current]);

  return null;
};

export const assignThemeVariableValue = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value);
};

export const resolveTheme = (theme: Themes) => {
  switch (theme) {
    case "light":
      return lightTheme;
    case "dark":
      return darkTheme;
  }
};

export const setCSSVariablesForTheme = (theme: Theme) => {
  // first colors
  for (const [key, value] of Object.entries(theme.colors)) {
    assignThemeVariableValue(themePropertyToCSSVariable.color[key], value);
  }

  // then fonts
  for (const [key, value] of Object.entries(theme.fonts)) {
    assignThemeVariableValue(themePropertyToCSSVariable.font[key], value);
  }

  // then details
  for (const [key, value] of Object.entries(theme.details)) {
    assignThemeVariableValue(themePropertyToCSSVariable.details[key], value);
  }

  // then current color scheme
  assignThemeVariableValue(
    themePropertyToCSSVariable.colorScheme,
    theme.currentColorScheme
  );
};

const themePropertyToCSSVariable = {
  color: {
    background: "--background-color",
    backgroundDark: "--background-dark",
    backgroundAlt: "--background-alt",
    backgroundContrast: "--background-contrast",
    text: "--text-color",
    textLight: "--text-color-light",
    textLink: "--text-link",
    primary: "--primary-color",
    primaryContrast: "--primary-contrast",
    deepPrimary: "--deep-primary-color",
    deepPrimaryContrast: "--deep-primary-contrast",
    danger: "--danger-color",
    dangerContrast: "--danger-contrast",
    success: "--success-color",
    successContrast: "--success-contrast",
    warning: "--warning-color",
    warningContrast: "--warning-contrast",
    info: "--info-color",
    infoContrast: "--info-contrast",
    accent: "--accent-color",
    accentContrast: "--accent-contrast",
  },
  font: {
    family: "--font-family",
    familyAlt: "--font-family-alt",
  },
  details: {
    cardBorderRadius: "--card-border-radius",
    cardBorderRadiusHover: "--card-border-radius-hover",
  },
  colorScheme: "--color-scheme",
};
