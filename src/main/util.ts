import fs from 'node:fs'
import path from 'path'
import { annotatedDir, oldAnnotatedDir } from './constants'
import log from 'electron-log'
import * as os from 'node:os'
import { NetworkInterfaceInfo } from 'node:os'

export const getIPAddress = (): string | undefined => {
  const interfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = os.networkInterfaces()
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName]
    if (!networkInterface) continue
    for (const net of networkInterface) {
      if (net.family === 'IPv4')
        if (!interfaceName.includes('VMware') && !interfaceName.includes('Loopback'))
          return net.address
    }
  }
  return undefined
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
