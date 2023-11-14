const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { ActiveWindow } = require('@paymoapp/active-window');

ipcMain.emit()

ActiveWindow.initialize();

if (!ActiveWindow.requestPermissions()) {
    console.log('Error: You need to grant screen recording permission in System Preferences > Security & Privacy > Privacy > Screen Recording');
    process.exit(0);
}


ActiveWindow.subscribe((e) => {
    console.log(e.title)
})
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 480,
        height: 784,
        resizable: process.env === 'production' ? false : true,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: true, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    mainWindow.webContents.openDevTools()
    const {webContents} = mainWindow;

    webContents.session.setPermissionRequestHandler(e=>{
        return true;
    })
    mainWindow.webContents.session.on('select-serial-port', (event, deviceList, callback) => {
        console.log('asdasd')
        event.preventDefault()
        if (deviceList && deviceList.length > 0) {
            callback(deviceList[0].deviceId)
        }
    })

    // and load the index.html of the app.

    switch (process.env) {
        case "development":
            mainWindow.loadURL('http://localhost:5173/');
            break;
        case 'production':
            mainWindow.loadFile('index.html');
            break;
        default:
            break;
    }
    mainWindow.loadFile('index.html')

    mainWindow.loadURL("http://localhost:5173/")


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


