import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom' // 1. Import ini

import './index.css'
import App from './App.tsx'
import Operator from './pages/Operator.tsx'
import General from './pages/General.tsx'

const router = createBrowserRouter ([
  {
    path: '/',
    element: <App />, // Halaman utama/landing page
  },
  {
    path: '/operator',
    element: <Operator />, // Akses lewat localhost:5173/operator
  },
  {
    path: '/general',
    element: <General />, // Akses lewat localhost:5173/general
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
