import { FormEvent, ReactElement, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import log from 'electron-log'

function Home(): ReactElement {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)
  const fileLabelRef = useRef<HTMLLabelElement>(null)

  const navigate = useNavigate()

  const handleClick = (): void => {
    window.electron.ipcRenderer.send('sign-io', ['select-file'])
    window.electron.ipcRenderer.once('sign-io', (_e, arg) => {
      if (arg && arg[0] === 'file-selected' && fileLabelRef.current) {
        fileLabelRef.current.textContent = arg[2]
        setSelectedFile(arg[1])
      }
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!selectedFile) return
    log.info('Submitting file')
    window.electron.ipcRenderer.send('sign-io', ['submit-file', selectedFile])
    window.electron.ipcRenderer.once('sign-io', (_e, arg) => {
      if (arg && arg[0] === 'file-submitted') {
        log.info('Submitted file')
        window.electron.ipcRenderer.removeAllListeners('sign-io')
        navigate({ pathname: '/wait' })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">File Upload</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Choose a file:</label>
            <button
              id="fileInput"
              type="button"
              onClick={handleClick}
              className="py-2 px-4 border-0 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
            >
              Select file
            </button>
            <label ref={fileLabelRef} className="w-full text-gray-200">
              No file selected
            </label>
          </div>
          <button
            type="submit"
            className="w-full hover:bg-blue-700 bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  )
}

export default Home
