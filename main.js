const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;

const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({width: 320, height: 240});
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }));

  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

exports.getAppPath = function() {
  if (process.platform == 'darwin') {
    const path = app.getPath('userData');
    return path;
  } else {
    const path = app.getPath('exe');
    return path + '/..';
  }
};
