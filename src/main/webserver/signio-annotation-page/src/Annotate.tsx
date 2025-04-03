import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import DrawingCanvas from './DrawingCanvas'
import axios from 'axios'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const hostname: string = window.location.hostname

const Annotate: React.FC = () => {
  const [file, setFile] = useState<string | undefined>(undefined)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale] = useState<number>(1.5)
  const [canvasData, setCanvasData] = useState<string | undefined>(undefined)

  const onDocumentLoadSuccess = (doc: pdfjs.PDFDocumentProxy): void => {
    setNumPages(doc.numPages)
  }

  const handleCanvasChange = (data: string): void => {
    setCanvasData(data)
  }

  const submitAnnotation = (): void => {
    console.log('Submitting annotation:')
    axios
      .post(`http://${hostname}:8080/annotate`, {
        pdfFile: file,
        pageNumber: pageNumber,
        canvasData: canvasData
      })
      .then((response) => {
        alert(response.data.message)
      })
      .catch((error) => {
        console.error('Error submitting annotation:', error)
      })
  }

  useEffect(() => {
    axios
      .get(`http://${hostname}:8080/latest`)
      .then((response) => {
        setFile(response.data.file)
      })
      .catch((error) => {
        console.error('Error fetching latest file:', error)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-10">
      {!file && (
        <h1 className="text-3xl font-bold text-white mb-6 text-center">No file uploaded yet</h1>
      )}
      {file && (
        <div className="select-none">
          <Document
            file={`/uploads/${file}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error: Error) => {
              console.error(error)
            }}
          >
            <div className="flex justify-center">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                className="w-min bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
              >
                ⬅️
              </button>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                className="w-min bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
              >
                ➡️
              </button>
            </div>
            <Page key={`page_${pageNumber}`} pageNumber={pageNumber} scale={scale}>
              <DrawingCanvas onCanvasChange={handleCanvasChange} />
            </Page>
          </Document>
          <div className="flex justify-center">
            <button
              onClick={submitAnnotation}
              className={"w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Annotate
