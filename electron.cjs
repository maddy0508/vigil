const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { getSystemProcesses, getNetworkConnections, getDiscoveredServices, getSystemLogs } = require('./src/services/system-monitor');


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:9002');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the exported static files
    mainWindow.loadFile(path.join(__dirname, 'out/index.html'));
  }
}

app.whenReady().then(() => {
  // Expose a handler for executing shell commands
  ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          // Even on error, we might want to resolve with stderr to show in the UI
          resolve(stderr || error.message);
          return;
        }
        if (stderr) {
           console.warn(`Command stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  });

  // Expose handlers for system monitoring
  ipcMain.handle('get-system-processes', getSystemProcesses);
  ipcMain.handle('get-network-connections', getNetworkConnections);
  ipcMain.handle('get-discovered-services', getDiscoveredServices);
  ipcMain.handle('get-system-logs', getSystemLogs);


  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
