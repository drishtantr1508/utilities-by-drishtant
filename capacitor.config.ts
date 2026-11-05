import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drishtant.utilities',
  appName: 'Utilities by Drishtant',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'utilitiesbydrishtant.netlify.app',
    allowNavigation: [
      'notionbydrishtant.netlify.app',
      'utilitiesbydrishtant.netlify.app',
      '*.netlify.app',
      '*.onrender.com'
    ]
  }
};

export default config;
