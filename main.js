// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const httpProxy = require('http-proxy');
const url = require('url');
const https = require('https');

const ipcMain = require('electron').ipcMain;

let htmlPic = null;
ipcMain.on('init', (event, arg) => {
  htmlPic = event.sender;
})
const proxyServer = httpProxy.createProxyServer({});
proxyServer.on('error', function (err) {
  console.log(err, '123');
  htmlPic.send('error', err);
});
let proxy = null;
let proxyList = [];

ipcMain.on('open', function (event, arg) {
  proxyList[arg['index']] = http.createServer((req, res) => {
    var finalUrl = arg['target'];
    var finalAgent = null;
    var parsedUrl = url.parse(finalUrl);
    if (parsedUrl.protocol === 'https:') {
      finalAgent = https.globalAgent;
    } else {
      finalAgent = http.globalAgent;
    }
    proxyServer.web(req, res, {
      target: finalUrl,
      agent: finalAgent,
      headers: { host: parsedUrl.hostname },
      prependPath: false,
      xfwd: true,
      hostRewrite: finalUrl.host,
      protocolRewrite: parsedUrl.protocol
    });
  }).listen(arg.port);

  proxyList[arg['index']].on('error', (error) => {
    htmlPic.send('error', error);
  })
});
ipcMain.on('close', function (event, arg) {
  proxyList[arg['index']].close();
  delete proxyList[arg['index']];
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    // width: 260,
    // height: 360,
    // maxWidth: 260,
    // maxHeight: 360,

    width: 700,
    height: 500,
    resizable: false,
    fullscreen: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, 'scripts/preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: __dirname + '/icon.icns',
  })
  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
