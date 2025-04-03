import path from 'path'
import fs from 'fs'
import { dialog, ipcMain, shell } from 'electron'
import log from 'electron-log'
import { getIPAddress, moveAnnotatedToOldAnnotatedDir } from "./util";
import { annotatedDir, uploadsDir } from './constants'

let currentFile: string | undefined = undefined

ipcMain.on('sign-io', async (event, arg) => {
  switch (arg[0]) {
    case 'select-file': {
      dialog
        .showOpenDialog({
          title: 'Select a PDF file',
          properties: ['openFile'],
          filters: [{ name: 'Portable Document Format (PDF)', extensions: ['pdf'] }]
        })
        .then((value) => {
          if (value) {
            event.reply('sign-io', [
              'file-selected',
              value.filePaths[0],
              path.basename(value.filePaths[0])
            ])
          }
        })
        .catch((err) => {
          log.error(err)
        })
      break
    }
    case 'submit-file': {
      const filePath = arg[1]
      const fileName = path.basename(filePath)
      const destinationPath = path.join(uploadsDir, fileName)
      moveAnnotatedToOldAnnotatedDir()
      fs.cpSync(filePath, destinationPath)

      currentFile = fileName.replace('.pdf', '.annotated.pdf')
      event.reply('sign-io', ['file-submitted', destinationPath])
      break
    }
    case 'get-ip': {
      event.reply('sign-io', ['ip', getIPAddress()])
      break
    }
    case 'open': {
      await shell.openPath(`${annotatedDir}/${arg[1]}`)
      break
    }
    case 'is-annotated': {
      fs.readdir(annotatedDir, (err, files) => {
        if (err) {
          log.error(err)
          return
        }
        if (files.length > 0) {
          if (files.includes(currentFile ?? ''))
            event.reply('sign-io', ['is-annotated', path.basename(files[0])])
        }
      })
      break
    }
    default:
      log.error('Unknown command args: ', arg)
      break
  }
})
