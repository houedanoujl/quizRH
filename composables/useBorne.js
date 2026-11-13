// Accès au stockage de la borne.
// - Dans l'application Electron : window.borne (electron/preload.cjs), fichier JSON sur le disque.
// - Dans un navigateur (développement) : repli sur localStorage.
//   L'administration n'y est ouverte qu'en développement (yarn dev), avec le code 0000.
const KEY = 'ciprel-borne-participants'
const KEY_APPAREIL = 'ciprel-borne-appareil'
const appareilNavigateur = () => {
  try { return localStorage.getItem(KEY_APPAREIL) || 'Navigateur' } catch { return 'Navigateur' }
}

export const normaliserEmail = email => String(email || '').trim().toLowerCase()

// Les objets réactifs (Proxy) ne passent pas l'IPC Electron : copie JSON simple.
const plain = value => JSON.parse(JSON.stringify(value))

const navigateur = {
  native: false,
  read () {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  },
  async hasEmail (email) {
    const e = normaliserEmail(email)
    return this.read().some(p => p.email === e)
  },
  async saveParticipant (record) {
    const list = this.read()
    const email = normaliserEmail(record.email)
    if (list.some(p => p.email === email)) return { ok: false, code: 'EMAIL_DEJA_UTILISE' }
    try {
      localStorage.setItem(KEY, JSON.stringify([...list, { ...plain(record), email }]))
      return { ok: true, id: record.id }
    } catch {
      return { ok: false, code: 'ECRITURE_IMPOSSIBLE' }
    }
  },
  async list () {
    return this.read()
  },
  async adminStatus () {
    return { actif: import.meta.dev, appareil: appareilNavigateur() }
  },
  async unlock (pin) {
    return import.meta.dev && pin === '0000' ? { ok: true } : { ok: false, code: 'INCORRECT' }
  },
  async lock () {},
  async setAppareil (nom) {
    const appareil = String(nom ?? '').trim().slice(0, 40)
    if (!appareil) return { ok: false, code: 'NOM_VIDE' }
    try { localStorage.setItem(KEY_APPAREIL, appareil) } catch { return { ok: false, code: 'ECRITURE_IMPOSSIBLE' } }
    return { ok: true, appareil }
  },
  async saveFile (name, content) {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: name })
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return { ok: true, path: name }
  },
  async quit () {}
}

export const useBorne = () => {
  const api = import.meta.client ? window.borne : null
  if (!api) return navigateur
  return {
    native: true,
    hasEmail: email => api.hasEmail(normaliserEmail(email)),
    saveParticipant: record => api.saveParticipant(plain({ ...record, email: normaliserEmail(record.email) })),
    list: () => api.list(),
    adminStatus: () => api.adminStatus(),
    unlock: pin => api.unlock(String(pin)),
    lock: () => api.lock(),
    setAppareil: nom => api.setAppareil(String(nom)),
    saveFile: (name, content) => api.saveFile(name, content),
    quit: () => api.quit()
  }
}
