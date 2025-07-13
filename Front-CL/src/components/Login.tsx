// src/components/Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

type Props = {
  onLogin: (username: string, rol: string) => void
}

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
      const rolLower = rol.toLowerCase()

      const res = await fetch(
        'https://os8e4l68fh.execute-api.us-east-1.amazonaws.com/dev/usuario/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: 'udemy',
            dni: username,
            password,
            rol: rolLower // 👈 aquí es clave
          })
        }
      )

      const rawData = await res.json()
      console.log('📦 Respuesta sin parsear:', rawData)

      const parsed =
        typeof rawData.body === 'string'
          ? JSON.parse(rawData.body)
          : rawData.body

      console.log('✅ Respuesta parseada:', parsed)

      if (!parsed.token) {
        alert(parsed.error || 'Usuario o contraseña incorrectos')
        return
      }

      localStorage.setItem('token', parsed.token)
      localStorage.setItem('user', username)
      localStorage.setItem('rol', rolLower)

      onLogin(username, rolLower)
    } catch (err: any) {
      console.error('❌ Error de login:', err)
      alert('Error de conexión')
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
  <label>DNI</label>
  <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="Ingresa tu DNI"
    disabled={loading}
  />
</div>


          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={loading}
            >
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="login-footer">
          ¿Eres nuevo?{' '}
          <button onClick={() => navigate('/register')} disabled={loading}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
