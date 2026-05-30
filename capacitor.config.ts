import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ustatop.app',
  appName: 'UstaTop',
  webDir: 'dist',
  server: {
    url: 'https://ustatop1.vercel.app',  // ← твоя ссылка
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;