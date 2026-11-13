// Application de la borne CIPREL : quiz plein écran (kiosque), hors ligne.
// - Le site généré (.output/public) est servi par le protocole app:// (pas de serveur ni de port).
// - Les participants sont enregistrés dans participants.json (dossier userData de l'application).
// Variables d'environnement :
//   BORNE_DEV_URL=http://localhost:3000  charge le serveur de développement Nuxt (fenêtré)
//   BORNE_FENETRE=1                      désactive le plein écran kiosque (tests)
//   BORNE_DATA_DIR=D:\quiz                dossier de participants.json (défaut : userData)
const { app, BrowserWindow, Menu, dialog, ipcMain, net, protocol } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { createStore } = require('./store.cjs')
const { createAdmin } = require('./admin.cjs')

const DEV_URL = process.env.BORNE_DEV_URL
const KIOSQUE = !DEV_URL && !process.env.BORNE_FENETRE
const PUBLIC_DIR = path.join(__dirname, '..', '.output', 'public')

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

if (!app.requestSingleInstanceLock()) app.quit()

let win = null
let store = null
let admin = null

// Fichier demandé, ou page SPA (200.html) pour les routes sans fichier.
function resolveFile (pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '')
  const file = path.normalize(path.join(PUBLIC_DIR, rel))
  if (!file.startsWith(PUBLIC_DIR)) return null
  try {
    if (fs.statSync(file).isFile()) return file
    const index = path.join(file, 'index.html')
    if (fs.statSync(index).isFile()) return index
  } catch {}
  return null
}

function createWindow () {
  win = new BrowserWindow({
    kiosk: KIOSQUE,
    fullscreen: KIOSQUE,
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    backgroundColor: '#e6f3f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
      devTools: !app.isPackaged
    }
  })
  // Pinch-zoom : désactivé par défaut dans Electron ; pas de menu, donc pas de Ctrl +/-.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  // Page rechargée : l'administration se reverrouille.
  win.webContents.on('did-navigate', () => admin?.lock())
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://') && !(DEV_URL && url.startsWith(DEV_URL))) event.preventDefault()
  })
  win.loadURL(DEV_URL || 'app://borne/').catch(error => console.error('Chargement impossible :', error))
}

app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus() }
})

app.whenReady().then(() => {
  const dataDir = process.env.BORNE_DATA_DIR || app.getPath('userData')
  store = createStore(path.join(dataDir, 'participants.json'))
  admin = createAdmin({ pinFile: path.join(__dirname, 'admin-pin.json'), dataDir })
  // Liste et export des participants : administration déverrouillée uniquement.
  const exigerAdmin = () => { if (!admin.estOuvert()) throw new Error('VERROUILLE') }

  protocol.handle('app', request => {
    const { pathname } = new URL(request.url)
    const file = resolveFile(pathname) || path.join(PUBLIC_DIR, '200.html')
    return net.fetch(pathToFileURL(file).toString())
  })

  ipcMain.handle('borne:hasEmail', (_e, email) => store.hasEmail(email))
  ipcMain.handle('borne:save', (_e, record) => store.save(record))
  ipcMain.handle('borne:adminStatus', () => admin.status())
  ipcMain.handle('borne:unlock', (_e, pin) => admin.unlock(pin))
  ipcMain.handle('borne:lock', () => admin.lock())
  ipcMain.handle('borne:setAppareil', (_e, nom) => admin.setAppareil(nom))
  ipcMain.handle('borne:list', () => { exigerAdmin(); return store.list() })
  ipcMain.handle('borne:saveFile', async (_e, { name, content }) => {
    exigerAdmin()
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Exporter les participants',
      defaultPath: path.join(app.getPath('documents'), path.basename(String(name))),
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (canceled || !filePath) return { ok: false }
    await fs.promises.writeFile(filePath, String(content), 'utf8')
    return { ok: true, path: filePath }
  })
  ipcMain.handle('borne:quit', () => app.quit())

  Menu.setApplicationMenu(null)
  // Démarrage automatique avec Windows : application installée uniquement, pas la version
  // de test portable (PORTABLE_EXECUTABLE_DIR est défini par l'exécutable portable).
  if (app.isPackaged && !process.env.PORTABLE_EXECUTABLE_DIR) app.setLoginItemSettings({ openAtLogin: true })

  createWindow()
})

app.on('window-all-closed', () => app.quit())
