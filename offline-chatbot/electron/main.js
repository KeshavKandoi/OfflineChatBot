const { app, BrowserWindow, shell } = require('electron')
const { spawn, execSync } = require('child_process')
const path = require('path')
const http = require('http')
const fs = require('fs')

let mainWindow
let setupWindow
let backendProcess
let ollamaProcess

const isWin = process.platform === 'win32'

// ── Get correct paths ─────────────────────────────────────────
function getResourcePath(relativePath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath)
  }
  if (relativePath === 'backend') {
    return path.join(__dirname, '..', 'backend')
  }
  return path.join(__dirname, relativePath)
}

// ── Get bundled Ollama binary path ────────────────────────────
function getOllamaPath() {
  const binaryName = isWin ? 'ollama.exe' : 'ollama'
  const platform = isWin ? 'win' : 'mac'
  return getResourcePath(`binaries/${platform}/${binaryName}`)
}

// ── Check if models are already downloaded ────────────────────
function modelsExist() {
  const homeDir = isWin ? process.env.USERPROFILE : process.env.HOME
  const ollamaModelsPath = path.join(
    homeDir, '.ollama', 'models', 'manifests', 'registry.ollama.ai'
  )
  try {
    const entries = fs.readdirSync(ollamaModelsPath, { recursive: true })
    const hasQwen = entries.some(e => e.toString().includes('qwen'))
    const hasLlava = entries.some(e => e.toString().includes('minicpm-v'))
    return hasQwen && hasLlava
  } catch {
    return false
  }
}

// ── Kill process on port 8000 ─────────────────────────────────
function killPort8000() {
  try {
    if (isWin) {
      execSync('for /f "tokens=5" %a in (\'netstat -aon ^| findstr :8000\') do taskkill /F /PID %a', { shell: true })
    } else {
      execSync('lsof -ti:8000 | xargs kill -9')
    }
  } catch (e) {}
}

// ── Kill existing Ollama ──────────────────────────────────────
function killOllama() {
  try {
    if (isWin) {
      execSync('taskkill /IM ollama.exe /F', { shell: true })
    } else {
      execSync('pkill ollama')
    }
  } catch (e) {}
}

// ── Start Ollama using bundled binary ─────────────────────────
function startOllama() {
  console.log('[Electron] Starting bundled Ollama...')
  const ollamaPath = getOllamaPath()

  killOllama()

  ollamaProcess = spawn(ollamaPath, ['serve'], {
    detached: false,
    stdio: 'ignore',
    env: { ...process.env },
    shell: isWin
  })

  ollamaProcess.on('error', (err) => {
    console.error('[Electron] Ollama error:', err)
  })
}

// ── Start Python backend ──────────────────────────────────────
function startBackend() {
  console.log('[Electron] Starting Python backend...')
  const backendPath = getResourcePath('backend')
  const scriptName = isWin ? 'start_backend.bat' : 'start_backend.sh'
  const scriptPath = path.join(backendPath, scriptName)
  const shell = isWin ? 'cmd.exe' : '/bin/bash'
  const args = isWin ? ['/c', scriptPath] : [scriptPath]

  killPort8000()

  backendProcess = spawn(shell, args, {
    cwd: backendPath,
    detached: false,
    stdio: 'pipe'
  })

  backendProcess.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString())
  })

  backendProcess.stderr.on('data', (data) => {
    console.log('[Backend stderr]', data.toString())
  })

  backendProcess.on('error', (err) => {
    console.error('[Electron] Backend error:', err)
  })
}

// ── Wait for backend to be ready ─────────────────────────────
function waitForBackend(retries = 60, delay = 2000) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      if (attempt === 0) {
        reject(new Error('Backend did not start in time'))
        return
      }
      http.get('http://127.0.0.1:8000/health', (res) => {
        if (res.statusCode === 200) {
          console.log('[Electron] Backend is ready!')
          resolve()
        } else {
          setTimeout(() => check(attempt - 1), delay)
        }
      }).on('error', () => {
        console.log(`[Electron] Waiting for backend... (${attempt} retries left)`)
        setTimeout(() => check(attempt - 1), delay)
      })
    }
    check(retries)
  })
}

// ── Create setup window ───────────────────────────────────────
function createSetupWindow() {
  setupWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    titleBarStyle: isWin ? 'default' : 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  setupWindow.loadFile(path.join(__dirname, 'setup.html'))
}

// ── Create main window ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: isWin ? 'default' : 'hiddenInset',
webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(
      path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
    )
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ── Download models via bundled ollama ────────────────────────
async function downloadModels(win) {
  const ollamaPath = getOllamaPath()
  const models = ['qwen2.5:7b', 'minicpm-v', 'nomic-embed-text']

  for (const model of models) {
    console.log(`[Electron] Downloading ${model}...`)
    await new Promise((resolve, reject) => {
      const pull = spawn(ollamaPath, ['pull', model], {
        env: { ...process.env },
        shell: isWin
      })

      pull.stdout.on('data', (data) => {
        const text = data.toString()
        console.log(`[Ollama] ${text}`)
        if (win && !win.isDestroyed()) {
          win.webContents.send('download-progress', { model, text })
        }
      })

      pull.stderr.on('data', (data) => {
        const text = data.toString()
        if (win && !win.isDestroyed()) {
          win.webContents.send('download-progress', { model, text })
        }
      })

      pull.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Failed to pull ${model}`))
      })
    })
  }
}

// ── App lifecycle ─────────────────────────────────────────────
app.whenReady().then(async () => {
  startOllama()
  startBackend()

  await new Promise(r => setTimeout(r, 3000))
  await waitForBackend()

  if (!modelsExist()) {
    createSetupWindow()
    await downloadModels(setupWindow)
    if (setupWindow && !setupWindow.isDestroyed()) {
      setupWindow.close()
    }
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

app.on('before-quit', () => {
  console.log('[Electron] Shutting down...')
  if (backendProcess) backendProcess.kill()
  if (ollamaProcess) ollamaProcess.kill()
})
