// src/App.tsx
import { useState, useEffect } from 'react'
import Alumno from './components/Alumno'
import Instructor from './components/Instructor'
import Admin from './components/Admin'
import Login from './components/Login'
import './App.css'

function App() {
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
    setUser(username)
    setRol(rol)
  }

  if (loading) return <div>Cargando...</div>

  if (!user || !rol) return <Login onLogin={handleLogin} />

  if (rol === 'alumno') return <Alumno />
  if (rol === 'instructor') return <Instructor />
  if (rol === 'admin') return <Admin />

  return <div>Rol desconocido</div>
}

export default App
