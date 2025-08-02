const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { 
    getSystemProcesses, 
    getNetworkConnections,
    getDiscoveredServices,
    getSystemLogs,
    executeCommand
} = require('./src/services/system-monitor');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadUrl = isDev
    ? 'http://localhost:9002'
    : `file://${path.join(__dirname, '.next/server/app/index.html')}`;

  win.loadURL(loadUrl).catch(err => {
    console.error('Failed to load URL:', loadUrl, err);
  });
  
  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Register IPC handlers for system monitoring functions
  ipcMain.handle('execute-command', async (event, command) => {
    return await executeCommand(command);
  });
  ipcMain.handle('get-system-processes', async () => {
    return await getSystemProcesses();
  });
  ipcMain.handle('get-network-connections', async () => {
    return await getNetworkConnections();
  });
  ipcMain.handle('get-discovered-services', async () => {
      return await getDiscoveredServices();
  });
  ipcMain.handle('get-system-logs', async () => {
      return await getSystemLogs();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
