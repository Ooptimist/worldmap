const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

// 构建并复制 main.cjs 和 preload.cjs 到根目录
Promise.all([
  build({
    entryPoints: ['electron-app/main.ts'],
    outfile: 'electron-app/dist/main.cjs',
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
    bundle: true,
    logLevel: 'info',
  }).then(() => {
    // 复制到根目录，让 package.json 的 "main": "main.cjs" 能找到
    fs.copyFileSync('electron-app/dist/main.cjs', 'main.cjs');
    console.log('✅ Copied main.cjs to project root');
  }),
  build({
    entryPoints: ['electron-app/preload.ts'],
    outfile: 'electron-app/dist/preload.cjs',
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
    bundle: true,
    logLevel: 'info',
  }).then(() => {
    fs.copyFileSync('electron-app/dist/preload.cjs', 'preload.cjs');
    console.log('✅ Copied preload.cjs to project root');
  }),
]).then(() => {
  console.log('✅ All builds successful');
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
