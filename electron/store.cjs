// Participants enregistrés sur le disque de la borne (fichier JSON, écriture atomique).
const fs = require('node:fs')
const path = require('node:path')

const norm = email => String(email || '').trim().toLowerCase()

function createStore (file) {
  let list = []
  try {
    list = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(list)) throw new Error('format inattendu')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // Fichier illisible : on le met de côté plutôt que de l'écraser.
      try { fs.copyFileSync(file, `${file}.illisible-${Date.now()}`) } catch {}
      console.error('participants.json illisible :', error)
    }
    list = []
  }

  const persist = () => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const tmp = `${file}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(list, null, 1), 'utf8')
    try {
      fs.renameSync(tmp, file)
    } catch {
      // Windows : fichier verrouillé (antivirus…) : écriture directe.
      fs.writeFileSync(file, JSON.stringify(list, null, 1), 'utf8')
      fs.rmSync(tmp, { force: true })
    }
  }

  return {
    file,
    hasEmail: email => list.some(p => p.email === norm(email)),
    save (record) {
      const email = norm(record?.email)
      if (!email.includes('@')) return { ok: false, code: 'EMAIL_INVALIDE' }
      if (list.some(p => p.email === email)) return { ok: false, code: 'EMAIL_DEJA_UTILISE' }
      list.push({ ...record, email })
      try {
        persist()
      } catch (error) {
        list.pop()
        console.error('Écriture impossible :', error)
        return { ok: false, code: 'ECRITURE_IMPOSSIBLE' }
      }
      return { ok: true, id: record.id }
    },
    list: () => list
  }
}

module.exports = { createStore }
