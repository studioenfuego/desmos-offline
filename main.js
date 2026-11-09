const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 640,
    minHeight: 480,
    title: 'Desmos Offline',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'desmos.html'));
  Menu.setApplicationMenu(buildMenu());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function send(channel) {
  if (mainWindow) mainWindow.webContents.send(channel);
}

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const fileMenu = {
    label: 'File',
    submenu: [
      { label: 'New Graph', accelerator: 'CmdOrCtrl+N', click: () => send('menu-new') },
      { type: 'separator' },
      { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => send('menu-open') },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('menu-save') },
      { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu-save-as') },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  };

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    fileMenu,
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ];

  return Menu.buildFromTemplate(template);
}

function defaultFileName() {
  return 'graph.json';
}

ipcMain.handle('graph:save', async (_event, { state, saveAs }) => {
  try {
    let filePath = currentFilePath;
    if (saveAs || !filePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Desmos Graph',
        defaultPath: filePath || defaultFileName(),
        filters: [{ name: 'Desmos Graph', extensions: ['json'] }],
      });
      if (result.canceled || !result.filePath) return { ok: false, canceled: true };
      filePath = result.filePath;
    }
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
    currentFilePath = filePath;
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('graph:open', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Desmos Graph',
      properties: ['openFile'],
      filters: [{ name: 'Desmos Graph', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePaths.length) return { ok: false, canceled: true };
    const filePath = result.filePaths[0];
    const text = fs.readFileSync(filePath, 'utf-8');
    const state = JSON.parse(text);
    currentFilePath = filePath;
    return { ok: true, state, filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.on('graph:new', () => {
  currentFilePath = null;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
