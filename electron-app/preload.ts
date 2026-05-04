import { contextBridge } from 'electron'

// 预加载脚本 — 暂不暴露 API，遵循最小权限原则
contextBridge.exposeInMainWorld('electronAPI', {})
