// Pont entre la page (Nuxt) et le processus principal : stockage des participants et export.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('borne', {
  hasEmail: email => ipcRenderer.invoke('borne:hasEmail', email),
  saveParticipant: record => ipcRenderer.invoke('borne:save', record),
  adminStatus: () => ipcRenderer.invoke('borne:adminStatus'),
  unlock: pin => ipcRenderer.invoke('borne:unlock', pin),
  lock: () => ipcRenderer.invoke('borne:lock'),
  setAppareil: nom => ipcRenderer.invoke('borne:setAppareil', nom),
  list: () => ipcRenderer.invoke('borne:list'),
  saveFile: (name, content) => ipcRenderer.invoke('borne:saveFile', { name, content }),
  quit: () => ipcRenderer.invoke('borne:quit')
})
