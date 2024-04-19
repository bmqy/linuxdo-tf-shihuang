import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'LinuxDo@真假始皇',
        icon: 'https://cdn.linux.do/uploads/default/original/1X/3a18b4b0da3e8cf96f7eea15241c3d251f28a39b.png',
        namespace: 'bmqy.net',
        match: ['https://linux.do/*'],
        connect: [
          'cfw.887776.xyz'
        ]
      },
    }),
  ],
});
