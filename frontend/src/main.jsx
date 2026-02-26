import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './app/router'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster 
      position="top-right" 
      richColors 
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  </StrictMode>
)
