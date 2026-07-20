import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import './index.css'
import './App.tsx'
import Operator from './pages/Operator.tsx'
import General from './pages/General.tsx'
import Auth from './pages/Auth.tsx'

import ProtectedRoute from './components/layout/ProtectedRoute.tsx'

const router = createBrowserRouter ([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Navigate to="/auth" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/operator',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'operator']}>
        <Operator />
      </ProtectedRoute>
    ),
  },
  {
    path: '/general',
    element: (
      <ProtectedRoute>
        <General />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth',
    element: <Auth />, // Akses lewat localhost:5173/auth
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
