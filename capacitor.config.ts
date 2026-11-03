import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drishtant.utilities',
  appName: 'Utilities by Drishtant',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'utilitiesbydrishtant.netlify.app'
  }
};

export default config;
