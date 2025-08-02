const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { getSystemProcesses, getNetworkConnections, getDiscoveredServices } = require('./services/system-monitor');
const { exec } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      // Important: contextIsolation and nodeIntegration settings
      // are crucial for security in Electron.
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:9002' // Dev server URL
    : `file://${path.join(__dirname, '../out/index.html')}`; // Production build path

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// --- IPC Handlers ---
// These handlers listen for calls from the renderer process (our Next.js app)
// and execute Node.js code securely in the main process.

ipcMain.handle('execute-command', async (event, command) => {
    console.log(`Executing command: ${command}`);
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error for command "${command}": ${error.message}`);
                // Return stderr as it often contains useful info even on non-zero exit codes
                resolve(`Error: ${error.message}\nStderr: ${stderr}`);
                return;
            }
            if (stderr) {
                console.warn(`Command "${command}" produced stderr: ${stderr}`);
                // Resolve with both stdout and stderr if both exist
                resolve(`Stdout: ${stdout}\nStderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
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


// --- App Lifecycle ---

app.whenReady().then(() => {
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
