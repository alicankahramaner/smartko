const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('node:path')
const { SerialPort } = require('serialport')


const notificationSend = (message) => {
    new Notification({
        title: "SmartKo",
        body: message
    }).show()
}
var device = null;
var failConnectCount = 0;
async function connectDevice() {
    if (failConnectCount === 5) {
        return;
    }
    const devices = await SerialPort.list();
    const smartKo = devices.find(e => e.manufacturer === 'Smart KO');

    if (!smartKo) {
        new Notification({
            title: 'Smart KO',
            body: "Cihaz bulunamadı, 5 saniye sonra tekrar arama yapılacak."
        }).show();
        setTimeout(() => connectDevice(), 5000);
        failConnectCount += 1;
        return;
    }

    device = new SerialPort({
        path: smartKo.path,
        baudRate: 9600,
        autoOpen: true,

    }, (err) => {

        new Notification({
            title: 'Smart KO',
            body: err ? "Cihaz bağlantısı sırasında hata oluştu, 5 saniye sonra tekrar arama yapılacak. " : "Cihaz bağlantısı sağlandı"
        }).show();
        if (err) {
            failConnectCount += 1;
            setTimeout(() => connectDevice(), 5000);
        }
    })

    if (device === null) return;

    ipcMain.on('add', async () => {
        const ports = await SerialPort.list();
        console.log(ports);
    })

    ipcMain.on('toMain', (event, args) => {
        switch (args.type) {
            case 'update':
                console.log(args.data);
                device.write(Buffer.from(args.data))
                break;
            case 'list':
                device.write(Buffer.from('LIST'))
                break;
            case 'clear':
                device.write(Buffer.from('CLEAR'))
                break;
            default:
                break;
        }

        // // UI'ye mesaj gönder
        // event.reply('fromMain', `Merhaba, ${args}! Bu mesaj Main process’ten geldi.`);
    });

    device.on('data', function (data) {
        const val = data.toString();
        console.log(val);

        if (val.includes('MacroCleared')) {
            notificationSend("Cihaz sıfırlandı.")
            return;
        }

        if (val.includes('UPDATED')) {
            notificationSend("Pedal profili güncellendi.");
            return;
        }

        if (val.includes('UNDEFINED')) {
            notificationSend("Bilinmeyen bir hata oluştu: L52");
            return;
        }

        if (val.includes('MacroListEmpty')) {
            notificationSend("Pedalda makro yok. Bir profil seçin otomatik yüklenecektir.")
            return
        }
    })
}

async function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 480,
        height: 784,
        resizable: process.env === 'production' ? false : true,
        webPreferences: {
            contextIsolation: process.env === 'development' ? true : false, // Geliştirme için kapalı (production'da contextIsolation: true kullanmayı düşünün)
            enableRemoteModule: true,
            contextIsolation: true, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    mainWindow.webContents.openDevTools()
    const { webContents } = mainWindow;

    webContents.session.setPermissionRequestHandler(e => {
        return true;
    })

    switch ("development") {
        case "development":
            mainWindow.loadURL('http://localhost:5173/');
            break;
        case 'production':
            mainWindow.loadFile('index.html');
            break;
        default:
            break;
    }
}


app.whenReady().then(() => {
    createWindow()
    connectDevice()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


