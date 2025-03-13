
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ffc4071d554345cf9878cd0064336291',
  appName: 'ניהול תקציב',
  webDir: 'dist',
  server: {
    url: 'https://ffc4071d-5543-45cf-9878-cd0064336291.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#34d399",
    },
  }
};

export default config;
