const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('konverter', {
	quit: () => ipcRenderer.invoke('quit-app'),
	trace: (m) => ipcRenderer.invoke('trace', m),
  convertFile: (inPath, target_ext) => ipcRenderer.invoke('convert-file', { inPath, target_ext }),
	// register a page callback to be invoked when main sends open-file
	onOpen: (cb) => {
		ipcRenderer.on('open-file', (event, filePath) => {
			try { ipcRenderer.invoke('trace', 'preload invoking page onOpen callback: ' + filePath) } catch (e) {}
			try { cb(filePath) } catch (e) {}
		})
	}
})

console.log('preload initialized')

// receive open-file from main and notify renderer page
ipcRenderer.on('open-file', (event, filePath) => {
	// log reception to main process log
	try { ipcRenderer.invoke('trace', 'preload received open-file: ' + filePath) } catch (e) {}
	window.dispatchEvent(new CustomEvent('konverter-open', { detail: { path: filePath } }))
})
