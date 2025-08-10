import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1322192990f848bcba06593ac32d6a78',
  appName: 'sentihealth',
  webDir: 'dist',
  server: {
    url: 'https://13221929-90f8-48bc-ba06-593ac32d6a78.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;