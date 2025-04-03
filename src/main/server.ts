import express from 'express'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import log from 'electron-log'
import cors from 'cors'
import { is } from '@electron-toolkit/utils'

const server = express()
const PORT = 8080

log.initialize()

export default async function startServer(): Promise<void> {
  server.use(cors())

  server.use(express.json({ limit: '50mb' }))

  server.use('/uploads', express.static(path.resolve('uploads')))
  server.use('/annotated', express.static(path.resolve('annotated')))

  if (is.dev) {
    server.use(express.static(path.resolve('src', 'main', 'webserver', 'dist')))
  } else {
    server.use(express.static(path.resolve('resources', 'webserver', 'dist')))
  }

  async function addAnnotationToPDF(
    pdfPath: string,
    pageNumber: number,
    outputPdfPath: string,
    canvasDataUrl: string
  ): Promise<void> {
    // Remove the data URL header, if present.
    const base64Data = canvasDataUrl.replace(/^data:image\/png;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Load the existing PDF
    const existingPdfBytes = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // Embed the PNG image into the PDF document
    const pngImage = await pdfDoc.embedPng(imageBuffer)

    // Select the first page of the PDF (change as needed)
    const pages = pdfDoc.getPages()
    const firstPage = pages[pageNumber - 1]

    // Determine the image dimensions.
    // (You can set these to match your canvas size; here we assume 800x600.)
    const imageWidth = firstPage.getWidth()
    const imageHeight = firstPage.getHeight()

    // Draw the embedded image on the page
    firstPage.drawImage(pngImage, {
      x: 0,
      y: firstPage.getHeight() - imageHeight, // position at top of the page
      width: imageWidth,
      height: imageHeight
    })

    // Save the annotated PDF to a new file
    const pdfBytes = await pdfDoc.save()
    if (fs.existsSync(outputPdfPath))
      outputPdfPath = outputPdfPath.replace('.annotated.pdf', '-2.annotated.pdf')
    fs.writeFileSync(outputPdfPath, pdfBytes)

    fs.rm(pdfPath, { force: true }, (err) => {
      if (err) throw err
    })
    log.info(`Annotated PDF saved as ${outputPdfPath}`)
  }

  server.get('/', (_req, res) => {
    if (is.dev) {
      res.sendFile(path.resolve('src', 'main', 'webserver', 'dist', 'index.html'))
    } else {
      res.sendFile(path.resolve('resources', 'webserver', 'dist', 'index.html'))
    }
  })

  server.post('/annotate', async (req, res): Promise<any> => {
    try {
      const { pdfFile, pageNumber, canvasData } = req.body
      if (!pdfFile || !canvasData) {
        return res.status(400).send('Missing pdfFile or canvasData in the request body.')
      }
      log.info(`Annotating PDF ${pdfFile} with canvas data...`)
      await addAnnotationToPDF(
        path.resolve('uploads', pdfFile),
        pageNumber,
        path.resolve('annotated', pdfFile.replace('.pdf', '.annotated.pdf')),
        canvasData
      )
      fs.rmSync(path.resolve('uploads', pdfFile))
      return res.send({
        message: 'PDF annotated successfully!'
      })
    } catch (error) {
      log.error('Error during annotation:', error)
      return res.status(500).send('Error annotating PDF.')
    }
  })

  server.get('/latest', (_req, res) => {
    fs.readdir('./uploads', (err, files) => {
      if (err) {
        log.error(err)
        return res.status(500).send('Error getting latest PDF.')
      }
      if (files.length > 0) {
        return res.send({
          file: files[0]
        })
      } else {
        return res.send({
          file: null
        })
      }
    })
  })

  server.get('/annotated', (_req, res) => {
    fs.readdir('./annotated', (err, files) => {
      if (err) {
        log.error(err)
        return res.status(500).send('Error getting latest annotated PDF.')
      }
      if (files.length > 0) {
        return res.send({
          file: files[0]
        })
      } else {
        return res.send({
          file: null
        })
      }
    })
  })

  server.listen(PORT, () => {
    log.info(`Server is running on port ${PORT}`)
  })
}
