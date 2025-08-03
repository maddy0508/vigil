const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { getSystemProcesses, getNetworkConnections, getDiscoveredServices, getSystemLogs } = require('./services/system-monitor');

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

  const appUrl = 'http://localhost:9002';
  mainWindow.loadURL(appUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// IPC handler to execute system commands
ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error for command "${command}": ${error.message}`);
        // For some commands, stderr might contain valid information or warnings
        if (stderr) {
           resolve(`Stderr: ${stderr}`);
        } else {
          // Reject with the actual error object
          reject(error);
        }
        return;
      }
      resolve(stdout);
    });
  });
});

// IPC handlers for system monitoring
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


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
