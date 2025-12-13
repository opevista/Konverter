const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const Jimp = require('jimp')

// simple trace logger for debugging open-file flow
ipcMain.handle('trace', async (ev, msg) => {
  try {
    fs.appendFileSync('/tmp/konverter_trace.log', new Date().toISOString() + ' ' + String(msg) + '\n')
  } catch (e) {}
})

let mainWindow
let openedFileMode = false

// --- NEW: Conversion logic in Node.js ---
ipcMain.handle('convert-file', async (event, { inPath, target_ext }) => {
  const in_path = path.resolve(inPath)
  if (!fs.existsSync(in_path)) {
    return { ok: false, error: 'input file not found' }
  }

  // Normalize extension
  if (!target_ext.startsWith('.')) {
    target_ext = '.' + target_ext
  }

  // Build output path in the same directory as input
  function make_unique_path(p) {
    if (!fs.existsSync(p)) {
      return p
    }
    const stem = path.parse(p).name
    const parent = path.dirname(p)
    const ext = path.parse(p).ext
    for (let i = 1; i < 1000; i++) {
      const candidate = path.join(parent, `${stem}_${i}${ext}`)
      if (!fs.existsSync(candidate)) {
        return candidate
      }
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    return path.join(parent, `${stem}_${ts}${ext}`)
  }

  const out_path = make_unique_path(path.join(path.dirname(in_path), path.parse(in_path).name + target_ext))
  console.log('Generated out_path:', out_path);
  
  // Define formats that jimp can handle
  const jimp_exts = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif']
  const input_ext_lower = path.extname(in_path).toLowerCase()

  try {
    // Try jimp first for common image-to-image conversions
    if (jimp_exts.includes(input_ext_lower) && jimp_exts.includes(target_ext.toLowerCase())) {
      try {
        const image = await Jimp.read(in_path)
        await image.writeAsync(out_path)
        return { ok: true, out: out_path }
      } catch (e) {
        // Fall through to ffmpeg if jimp fails
      }
    }

    // Fallback to ffmpeg for everything else (video, audio, complex images)
    return new Promise((resolve, reject) => {
      
      function getFfmpegPath() {
        if (app.isPackaged) {
          return path.join(process.resourcesPath, 'app.asar.unpacked', 'bin', 'ffmpeg');
        }
        return path.join(__dirname, 'bin', 'ffmpeg');
      }

      const ffmpegPath = getFfmpegPath();
      
      try {
        // Ensure the binary is executable
        fs.chmodSync(ffmpegPath, 0o755);
      } catch (e) {
        // ignore chmod errors
      }

      const ffmpeg = spawn(ffmpegPath, ['-y', '-i', in_path, out_path]);
      
      let stderr = ''
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve({ ok: true, out: out_path })
        } else {
          resolve({ ok: false, error: `ffmpeg failed with code ${code}:\n${stderr}` })
        }
      })
      ffmpeg.on('error', (err) => {
        resolve({ ok: false, error: `ffmpeg spawn error: ${err.message}. This should not happen with a bundled ffmpeg.` })
      })
    })

  } catch (e) {
    return { ok: false, error: e.message }
  }
})


function createWindowWithFile(opened, filePath) {
  openedFileMode = !!opened
  const smallOptions = {
    width: 480,
    height: 120,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: true
    }
  }

  const normalOptions = {
    width: 900,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: true
    }
  }

  mainWindow = new BrowserWindow(opened ? smallOptions : normalOptions)

  if (opened) {
    const url = `file://${path.join(__dirname, 'index.html')}?opened=1&path=${encodeURIComponent(filePath)}`
    mainWindow.loadURL(url)
    mainWindow.webContents.once('did-finish-load', async () => {
      try { mainWindow.webContents.send('open-file', filePath) } catch (e) { console.error('send open-file failed', e) }
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    if (openedFileMode) {
      app.quit()
    }
  })
}

// macOS: capture files opened via Finder
let pendingOpenPath = null
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  pendingOpenPath = filePath
  if (app.isReady()) createWindowWithFile(true, filePath)
})

app.whenReady().then(() => {
  const argvCandidates = process.argv.slice(1).filter(a => a && a !== '.' && !a.startsWith('--'))
  const argPath = argvCandidates.find(a => {
    try {
      if (fs.existsSync(a)) return true
    } catch (e) {}
    if (typeof a === 'string' && a.startsWith('/')) return true
    return false
  })

  if (pendingOpenPath) {
    createWindowWithFile(true, pendingOpenPath)
  } else if (argPath) {
    createWindowWithFile(true, argPath)
  } else {
    createWindowWithFile(false, null)
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindowWithFile(false, null)
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin' || !openedFileMode) {
    app.quit()
  }
})

ipcMain.handle('quit-app', async () => {
  app.quit()
})