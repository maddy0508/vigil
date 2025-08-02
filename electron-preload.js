const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  getSystemProcesses: () => ipcRenderer.invoke('get-system-processes'),
  getNetworkConnections: () => ipcRenderer.invoke('get-network-connections'),
});
