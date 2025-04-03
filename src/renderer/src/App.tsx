import { MemoryRouter, Route, Routes } from 'react-router'
import Home from '@renderer/pages/Home'
import WaitForSignature from '@renderer/pages/WaitForSignature'
import { ReactElement } from 'react'

function App(): ReactElement {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wait" element={<WaitForSignature />} />
      </Routes>
    </MemoryRouter>
  )
}

export default App
