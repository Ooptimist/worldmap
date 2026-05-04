import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getMusicPath: () => ipcRenderer.invoke('get-music-path')
})
