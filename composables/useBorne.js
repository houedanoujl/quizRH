// Accès au stockage de la borne.
// - Dans l'application Electron : window.borne (electron/preload.cjs), fichier JSON sur le disque.
// - Dans un navigateur (développement) : repli sur localStorage.
const KEY = 'ciprel-borne-participants'

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
    saveFile: (name, content) => api.saveFile(name, content),
    quit: () => api.quit()
  }
}
