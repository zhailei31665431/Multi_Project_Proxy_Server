// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const httpProxy = require('http-proxy');
const url = require('url');
const https = require('https');

const ipcMain = require('electron').ipcMain;
function deepMerge(target, source) {
  // 遍历源对象的所有键
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // 如果值是对象并且不是数组，递归合并
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        // 如果目标中没有此键，初始化为空对象
        if (typeof target[key] !== 'object' || target[key] === null || Array.isArray(target[key])) {
          target[key] = {};
        }
        // 递归合并子对象
        deepMerge(target[key], source[key]);
      } else {
        // 如果不是对象，直接覆盖
        target[key] = source[key];
      }
    }
  }
  return target;
}
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
  console.log(arg, '123123');
  proxyList[arg['index']] = http.createServer((req, res) => {
    var finalUrl = arg['target'];
    var finalAgent = null;
    var parsedUrl = url.parse(finalUrl);
    if (parsedUrl.protocol === 'https:') {
      finalAgent = https.globalAgent;
    } else {
      finalAgent = http.globalAgent;
    }
    let options = Object.assign({}, {
      target: finalUrl,
      agent: finalAgent,
      headers: Object.assign({ host: parsedUrl.hostname }, JSON.parse(arg.params || {})),
      prependPath: false,
      xfwd: true,
      hostRewrite: finalUrl.host,
      protocolRewrite: parsedUrl.protocol,
      ws: true
    });
    console.log(options, '12312313');
    proxyServer.web(req, res, options);
  }).listen(arg.port);


  htmlPic.send('success');
  proxyList[arg['index']].on('error', (error) => {
    proxyList[arg['index']].close();
    delete proxyList[arg['index']];
    htmlPic.send('error', { error: error, index: arg['index'] })
  })
});
ipcMain.on('close', function (event, arg) {
  proxyList[arg['index']].close();
  delete proxyList[arg['index']];
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    // resizable: false,
    fullscreen: false,
    frame: true,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: __dirname + '/icon.icns',
  })
  mainWindow.loadFile('src/index.html');
  // mainWindow.maximize();
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  for (let i in proxyList) {
    let item = proxyList[i];
    item.close();
  }
  if (process.platform !== 'darwin') app.quit()
})
