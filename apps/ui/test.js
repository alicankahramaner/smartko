const { SerialPort } = require('serialport')



async function main() {
    const devices = await SerialPort.list();
    const smartKo = devices.find(e => e.manufacturer === 'Smart KO');
    if (!smartKo) {
        console.log("Cihaz bulunamadı");
        setTimeout(() => connectDevice(), 5000);
        return;
    }
    function toBuffer(bufferString) {
        const hex = bufferString.match(/\s[0-9a-fA-F]+/g).map((x) => x.trim());
        return Buffer.from(hex.join(''), 'hex');
    }
    const device = new SerialPort({
        path: smartKo.path,
        baudRate: 9600,
        autoOpen: true,
    }, (err) => {
        console.log(err ? "Cihaz bağlantısı sırasında hata oluştu" : "Cihaz bağlantısı sağlandı");
    })

    const ListToBuffer = (list) => Buffer.from(list.join(''), 'hex');

    device.on('data', function (data) {
        console.log('Data:', JSON.parse(data.toString()).type)
    })

    setTimeout(() => {
        device.write(Buffer.from('CLEAR'))
    }, 2000)
}

main()