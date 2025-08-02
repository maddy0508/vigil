
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { getSystemProcesses, getNetworkConnections, getDiscoveredServices, getSystemLogs } = require('./src/services/system-monitor');
const { exec } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const appUrl = isDev ? 'http://localhost:9002' : `file://${path.join(__dirname, 'out', 'index.html')}`;
  mainWindow.loadURL(appUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for system commands
ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error for: "${command}" -> ${error.message}`);
        // For commands that might fail but still return useful info (like nmap not being installed)
        resolve(stderr || `Error: ${error.message}`);
        return;
      }
      if (stderr) {
         if (!command.startsWith('avahi-browse')) {
            console.warn(`Command "${command}" produced stderr: ${stderr}`);
        }
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('get-system-processes', async () => {
    return getSystemProcesses();
});

ipcMain.handle('get-network-connections', async () => {
    return getNetworkConnections();
});

ipcMain.handle('get-discovered-services', async () => {
    return getDiscoveredServices();
});

ipcMain.handle('get-system-logs', async () => {
    return getSystemLogs();
});
