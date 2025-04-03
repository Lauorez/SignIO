import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Annotate from "./Annotate.tsx";
import './App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Annotate />
  </StrictMode>,
)
