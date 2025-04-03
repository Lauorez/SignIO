import { networkInterfaces } from 'node:os'
import fs from 'node:fs'
import path from 'path'
import { annotatedDir, oldAnnotatedDir } from "./constants";
import log from 'electron-log'

export const getIPAddress = (): string | null => {
  const nets = networkInterfaces()
  const results: { [key: string]: string[] } = {}
  Object.keys(nets).forEach((name) => {
    const interfaces = nets[name]
    if (interfaces) {
      interfaces.forEach((net) => {
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = []
          }
          results[name].push(net.address)
        }
      })
    }
  })
  const nicNames = Object.keys(results)
  if (nicNames.length > 0) {
    const firstNICAddresses = results[nicNames[0]]
    if (firstNICAddresses && firstNICAddresses.length > 0) {
      return firstNICAddresses[0]
    }
  }
  return null
}

export const getAvailableFileName = (filename: string): string => {
  if (fs.existsSync(filename)) {
    const ext = path.extname(filename)
    return getAvailableFileName(filename.replace(ext, `-duplicate${ext}`))
  }
  return filename
}

export const moveAnnotatedToOldAnnotatedDir = (): void => {
  fs.readdir(annotatedDir, (err, files) => {
    if (err) {
      log.error(err)
      return
    }
    files.forEach((file) => {
      if (!fs.statSync(path.resolve(annotatedDir, file)).isDirectory())
        fs.renameSync(
          path.resolve(annotatedDir, file),
          getAvailableFileName(path.resolve(oldAnnotatedDir, file))
        )
    })
  })
}
