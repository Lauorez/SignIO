import fs from 'fs'
import { annotatedDir, oldAnnotatedDir, uploadsDir } from './constants'
import { moveAnnotatedToOldAnnotatedDir } from './util'
import log from 'electron-log'

if (fs.existsSync(uploadsDir)) {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) log.error(err)
    if (files.length > 0) {
      files.forEach((file) => {
        fs.rmSync(file)
      })
    }
  })
} else {
  fs.mkdirSync(uploadsDir)
}

if (!fs.existsSync(annotatedDir)) {
  fs.mkdirSync(annotatedDir)
  fs.mkdirSync(oldAnnotatedDir)
} else {
  if (!fs.existsSync(oldAnnotatedDir)) {
    fs.mkdirSync(oldAnnotatedDir)
  } else {
    moveAnnotatedToOldAnnotatedDir()
  }
}
