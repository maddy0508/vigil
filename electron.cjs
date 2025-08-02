
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { getSystemProcesses, getNetworkConnections, getDiscoveredServices, getSystemLogs } = require('./src/services/system-monitor');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src/electron-preload.js'),
      // Important: These settings are needed for the preload script to work
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the Next.js app
  if (isDev) {
    win.loadURL('http://localhost:9002');
    win.webContents.openDevTools();
  } else {
    // In production, load the exported HTML file
     const startUrl = path.join(__dirname, '.next/server/app/index.html');
     win.loadFile(startUrl);
  }

  // --- IPC Handlers ---
  ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Exec error for command "${command}": ${error.message}`);
          // For commands that are expected to fail (like `nmap` if not installed),
          // we resolve with the error message so the AI can process it.
          resolve(`Error executing command: ${error.message}. Stderr: ${stderr}`);
          return;
        }
        if (stderr) {
          // Some tools output informational messages to stderr, so we log it but still resolve stdout.
           if (!command.startsWith('avahi-browse')) { // avahi-browse is noisy
             console.warn(`Exec command "${command}" produced stderr: ${stderr}`);
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
}

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
