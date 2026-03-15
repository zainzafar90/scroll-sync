import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Scroll Sync',
    description: 'Scroll two tabs in sync — control speed, direction, and pairing from one place.',
    permissions: ['tabs', 'scripting'],
    host_permissions: ['<all_urls>'],
  },
});
