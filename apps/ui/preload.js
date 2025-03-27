const { contextBridge, ipcRenderer, BrowserWindow } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.send('toMain', message),
  onMessage: (callback) => ipcRenderer.on('fromMain', (event, args) => {
    callback(args)
  }),
});


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

