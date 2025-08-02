const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  getSystemProcesses: () => ipcRenderer.invoke('get-system-processes'),
  getNetworkConnections: () => ipcRenderer.invoke('get-network-connections'),
  getDiscoveredServices: () => ipcRenderer.invoke('get-discovered-services'),
  getSystemLogs: () => ipcRenderer.invoke('get-system-logs'),
});
