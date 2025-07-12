// src/components/Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

type Props = { onLogin: (username: string) => void }

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('alumno')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      alert('Ingrese usuario y contraseña')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        'https://9fea0kjoe5.execute-api.us-east-1.amazonaws.com/dev/usuario/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: 'udemy',
            dni: username,
            rol,
            password
          })
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as {
        message: string
        token?: string
        expires_at?: string
        error?: string
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', username)
        onLogin(username)
      } else {
        alert(data.error || 'Usuario o contraseña incorrectos')
      }
    } catch (err: any) {
      console.error('fetch error:', err)
      alert('Error: ' + (err.message || 'Error de conexión'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Inicio de Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              disabled={loading}
            >
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="login-footer">
          ¿Eres nuevo?{' '}
          <button
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
