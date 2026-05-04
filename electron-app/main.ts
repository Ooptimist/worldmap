// main.ts - Electron 主进程
declare function require(name: string): any;
const electron = require('electron');
const fs = require('fs');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// 注册 IPC：返回背景音乐文件的 file:// 路径
ipcMain.handle('get-music-path', async () => {
  const isDev = !app.isPackaged;
  let musicFile: string;

  if (isDev) {
    // 开发环境：直接使用项目根目录下的 public/music
    musicFile = path.join(__dirname, 'public', 'music', 'Earth From Silence.mp4');
    log(`[get-music-path] dev mode, path: ${musicFile}`);
  } else {
    // 打包后：extraResources 会将文件放到 resources/music/
    musicFile = path.join(process.resourcesPath, 'music', 'Earth From Silence.mp4');
    log(`[get-music-path] packaged, path: ${musicFile}`);
  }

  // 验证文件是否存在
  const exists = fs.existsSync(musicFile);
  log(`[get-music-path] exists: ${exists}`);

  if (!exists) {
    // fallback：尝试在 __dirname/dist/music/ 查找（Vite 构建输出目录）
    const fallback = path.join(__dirname, 'dist', 'music', 'Earth From Silence.mp4');
    log(`[get-music-path] fallback: ${fallback}, exists: ${fs.existsSync(fallback)}`);
    if (fs.existsSync(fallback)) {
      musicFile = fallback;
    }
  }

  // 返回 file:// URL（Audio 对象需要完整的文件协议路径）
  const fileUrl = 'file://' + musicFile.split(path.sep).join('/');
  log(`[get-music-path] returning: ${fileUrl}`);
  return fileUrl;
});

const logPath = 'C:\\temp\\electron-main.log';

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(logPath, line); } catch (e) {}
}

log('=== App starting ===');
log(`__dirname: ${__dirname}`);

function createWindow() {
  log('Creating BrowserWindow...');
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  log(`isDev: ${isDev}, app.isPackaged: ${app.isPackaged}`);

  if (isDev) {
    log('Loading http://localhost:3000');
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    const htmlPath = path.join(__dirname, 'dist/index.html');
    log(`Loading file: ${htmlPath}`);
    try {
      log(`File exists: ${fs.existsSync(htmlPath)}`);
    } catch (e) {}
    win.loadFile(htmlPath);
  }

  win.on('closed', () => log('Window closed'));
  win.webContents.on('did-finish-load', () => log('Page loaded successfully'));
  win.webContents.on('crashed', () => log('WebContents crashed!'));
}

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  log('app.ready fired');
  createWindow();
}).catch((err: any) => {
  log(`app.ready error: ${err}`);
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on('uncaughtException', (err: any) => log(`UNCAUGHT: ${err && err.stack || err}`));
process.on('unhandledRejection', (reason: any) => log(`REJECTION: ${reason}`));
