import { MemoryRouter, Route, Routes } from 'react-router'
import Home from '@renderer/pages/Home'
import WaitForSignature from '@renderer/pages/WaitForSignature'
import { ReactElement } from 'react'
import History from '@renderer/pages/History'

function App(): ReactElement {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wait" element={<WaitForSignature />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </MemoryRouter>
  )
}

export default App
