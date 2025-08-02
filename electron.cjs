const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:9002');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }
}

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


// IPC handler for executing system commands
ipcMain.handle('execute-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        // IMPORTANT: In a real-world application, this is a major security risk
        // and should be handled with extreme care. Commands should be sanitized
        // and validated. For this prototype, we will log the command instead of
        // executing it to prevent accidental system changes.
        console.log(`[SECURITY] Received command to execute: ${command}`);
        // To actually run it, you would use:
        // exec(command, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`exec error: ${error}`);
        //         return reject(error.message);
        //     }
        //     if (stderr) {
        //         console.error(`stderr: ${stderr}`);
        //         return reject(stderr);
        //     }
        //     resolve(stdout);
        // });
        resolve(`Simulated execution of: ${command}`);
    });
});
