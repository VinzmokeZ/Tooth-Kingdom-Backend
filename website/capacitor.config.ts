import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'Tooth.Kingdom.Adventure',
    appName: 'Tooth Kingdom Adventure',
    webDir: 'build',
    bundledWebRuntime: false,
    server: {
        cleartext: true
    }
};

export default config;
