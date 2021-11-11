const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      //必须得加这一行，不然在index.html中导入ipcRenderer会出错
      contextIsolation: false
    },
  });
  mainWindow.loadFile('public/index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  //打开开发者
  mainWindow.webContents.openDevTools();

  //检查更新，有的话会自动下载
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on('ready', () => {
  createWindow();
});

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

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

//
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});
ipcMain.on('restart_app', () => {
  setImmediate(() => {
    app.removeAllListeners("window-all-closed")
    // if (focusedWindow != null) {
    //   focusedWindow.close()
    // }
    autoUpdater.quitAndInstall(false)
  })
});
