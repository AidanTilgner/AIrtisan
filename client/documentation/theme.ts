export type Themes = "light" | "dark";

export interface Theme {
  colors: {
    background: string;
    backgroundDark: string;
    backgroundAlt: string;
    backgroundContrast: string;
    text: string;
    textLight: string;
    textLink: string;
    primary: string;
    primaryContrast: string;
    deepPrimary: string;
    deepPrimaryContrast: string;
    danger: string;
    dangerContrast: string;
    success: string;
    successContrast: string;
    warning: string;
    warningContrast: string;
    info: string;
    infoContrast: string;
    accent: string;
    accentContrast: string;
  };
  fonts: {
    family: string;
    familyAlt: string;
  };
  currentColorScheme: Themes;
  details: {
    cardBorderRadius: string;
    cardBorderRadiusHover: string;
  };
}
