const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desmosElectronAPI', {
  saveState: (state, opts) =>
    ipcRenderer.invoke('graph:save', { state, saveAs: !!(opts && opts.saveAs) }),
  openState: () => ipcRenderer.invoke('graph:open'),
  notifyNew: () => ipcRenderer.send('graph:new'),
  onMenuNew: (cb) => ipcRenderer.on('menu-new', () => cb()),
  onMenuOpen: (cb) => ipcRenderer.on('menu-open', () => cb()),
  onMenuSave: (cb) => ipcRenderer.on('menu-save', () => cb()),
  onMenuSaveAs: (cb) => ipcRenderer.on('menu-save-as', () => cb()),
});
