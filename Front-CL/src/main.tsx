// src/main.tsx
import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import './index.css'
import Login from './components/Login'
import Register from './components/Register'
import Alumno from './components/Alumno'
import Instructor from './components/Instructor'
import Admin from './components/Admin'

const AppRouter = () => {
  const [user, setUser] = useState<string | null>(null)
  const [rol, setRol] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedRol = localStorage.getItem('rol')

    if (token && savedUser && savedRol) {
      setUser(savedUser)
      setRol(savedRol)
    }
    setLoading(false)
  }, [])

  const handleLogin = (username: string, rol: string) => {
    localStorage.setItem('user', username)
    localStorage.setItem('rol', rol)
    setUser(username)
    setRol(rol)
  }

  if (loading) return <div>Cargando...</div>

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user || !rol ? (
            <Navigate to="/login" />
          ) : rol === 'alumno' ? (
            <Alumno />
          ) : rol === 'instructor' ? (
            <Instructor />
          ) : rol === 'admin' ? (
            <Admin />
          ) : (
            <div>Rol desconocido</div>
          )
        }
      />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
)
