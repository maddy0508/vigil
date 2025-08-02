
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const systemMonitor = require('./src/services/system-monitor');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'electron-preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/.next/server/app/index.html'),
        protocol: 'file:',
        slashes: true,
    });

    if (process.env.ELECTRON_START_URL) {
      mainWindow.loadURL(startUrl);
    } else {
      // In production, load the built Next.js app
      const finalPath = path.join(__dirname, '.next', 'server', 'app', 'index.html');
      mainWindow.loadFile(finalPath);
    }

    // Uncomment to open DevTools
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC handlers for system commands
ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error for command "${command}": ${error.message}`);
                // For many CLI tools, stderr is used for progress or info, not just errors.
                // We resolve with stderr if stdout is empty so the AI can still analyze it.
                if (stderr && !stdout) {
                   resolve(`Execution failed, but got output on stderr: ${stderr}`);
                } else {
                   resolve(`Execution failed with error: ${error.message}`);
                }
                return;
            }
             if (stderr) {
                // Log stderr for debugging but don't treat it as a failure, as many tools use it for non-error output.
                console.warn(`Command "${command}" produced stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
});

ipcMain.handle('get-system-processes', async () => {
    return systemMonitor.getSystemProcesses();
});

ipcMain.handle('get-network-connections', async () => {
    return systemMonitor.getNetworkConnections();
});

ipcMain.handle('get-discovered-services', async () => {
    return systemMonitor.getDiscoveredServices();
});

ipcMain.handle('get-system-logs', async () => {
    return systemMonitor.getSystemLogs();
});
