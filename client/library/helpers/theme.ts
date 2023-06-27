import { Theme } from "../../documentation/theme";

export const lightTheme: Theme = {
  colors: {
    background: "#fff",
    backgroundDark: "#ffffff",
    backgroundAlt: "#f8f8f8", // #f5f6f8
    backgroundContrast: "#eaeaea",
    text: "#000000",
    textLight: "#6e6e6e",
    textLink: "#2256f2",
    primary: "#2256f2",
    primaryContrast: "#ffffff",
    deepPrimary: "#1614db",
    deepPrimaryContrast: "#ffffff",
    danger: "#ff0000",
    dangerContrast: "#ffffff",
    success: "#00ff00",
    successContrast: "#ffffff",
    warning: "#f28f2e",
    warningContrast: "#ffffff",
    info: "#00ffff",
    infoContrast: "#ffffff",
    accent: "#8709e8",
    accentContrast: "#ffffff",
  },
  fonts: {
    family: "Quicksand, sans-serif",
    familyAlt: "Lato, sans-serif",
  },
  currentColorScheme: "light",
  details: {
    cardBorderRadius: "5px",
    cardBorderRadiusHover: "5px",
  },
};

export const darkTheme: Theme = {
  colors: {
    background: "#1e1e1e",
    backgroundDark: "#000000",
    backgroundAlt: "#2e2e2e",
    backgroundContrast: "#3e3e3e",
    text: "#ffffff",
    textLight: "#c1c2c5",
    textLink: "#2256f2",
    primary: "#2256f2",
    primaryContrast: "#ffffff",
    deepPrimary: "#1614db",
    deepPrimaryContrast: "#ffffff",
    danger: "#ff0000",
    dangerContrast: "#ffffff",
    success: "#64a60f",
    successContrast: "#ffffff",
    warning: "#f28f2e",
    warningContrast: "#ffffff",
    info: "#147adb",
    infoContrast: "#ffffff",
    accent: "#8709e8",
    accentContrast: "#ffffff",
  },
  fonts: {
    family: "Quicksand, sans-serif",
    familyAlt: "Lato, sans-serif",
  },
  currentColorScheme: "dark",
  details: {
    cardBorderRadius: "5px",
    cardBorderRadiusHover: "0",
  },
};
