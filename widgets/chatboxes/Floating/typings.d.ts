declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface SettingsWindow {
  AIrtisanSettings: {
    bot_slug: string;
    bot_name: string;
    api_url?: string;
  };
}
