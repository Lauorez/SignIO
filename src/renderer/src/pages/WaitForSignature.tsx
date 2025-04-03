import { ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import log from 'electron-log'
import loading from '../assets/loading.gif'

function WaitForSignature(): ReactElement {
  const [file, setFile] = useState<string | undefined>(undefined)
  const [address, setAddress] = useState<string | undefined>(undefined)

  const navigate = useNavigate()

  useEffect(() => {
    window.electron.ipcRenderer.send('sign-io', ['get-ip'])
    window.electron.ipcRenderer.on('sign-io', (_e, args) => {
      switch (args[0]) {
        case 'ip': {
          setAddress(`http://${args[1]}:8080/`)
          break
        }
        case 'is-annotated': {
          setFile(args[1])
          break
        }
        default: {
          log.error('Error: Unknown token. args: ', args)
        }
      }
    })
    const fetchData = (): void => {
      window.electron.ipcRenderer.send('sign-io', ['is-annotated'])
    }
    fetchData()
    const intervalId = setInterval(fetchData, 3000)
    return (): void => {
      clearInterval(intervalId)
      window.electron.ipcRenderer.removeAllListeners('sign-io')
    }
  }, [])

  function handleDownloadClick(): void {
    window.electron.ipcRenderer.send('sign-io', ['open', file])
    navigate('/')
  }
  function handleSaveClick(): void {
    window.electron.ipcRenderer.send('sign-io', ['save', file])
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col gap-4 p-8 rounded-lg shadow-lg bg-gray-800 w-full max-w-md">
        <div className="flex justify-center items-center">
          <h1 className="text-3xl font-bold text-white text-center">
            {!file && 'Waiting for signature'}
            {file && 'Signed document ready'}
          </h1>
          {!file && <img className="w-8 h-8 ml-2" src={loading} alt="loading" />}
          {file && <span className="w-8 h-8 ml-2 text-2xl">✅</span>}
        </div>
        {!file && (
          <div className="w-full flex justify-center items-center">
            <span className="text-lg text-white text-center">
              Please open
              <span className="text-lg text-blue-400 underline mx-1.5">{address}</span>
              on your tablet / stylus device.
            </span>
          </div>
        )}
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="w-full bg-blue-600 disabled:bg-gray-600 hover:bg-blue-700 disabled:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded enabled:cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
            disabled={!file}
            onClick={handleDownloadClick}
          >
            Open
          </button>
          <button
            type="button"
            className="w-full bg-blue-600 disabled:bg-gray-600 hover:bg-blue-700 disabled:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded enabled:cursor-pointer overflow-hidden transition-all duration-200 active:bg-blue-400"
            disabled={!file}
            onClick={handleSaveClick}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default WaitForSignature
