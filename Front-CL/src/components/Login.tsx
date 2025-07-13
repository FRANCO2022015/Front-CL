import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

type Props = {
  onLogin: (username: string, rol: string) => void
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<'alumno'|'instructor'|'admin'>('alumno')
  const [orgs, setOrgs] = useState<{ tenant_id: string; descripcion: string }[]>([])
  const [selectedOrg, setSelectedOrg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('https://h1m4en6skg.execute-api.us-east-1.amazonaws.com/dev/org/listar')
      .then(r => r.json())
      .then(data => {
        const b = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
        setOrgs(b.organizaciones || [])
      })
  }, [])

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  const body = {
    tenant_id: selectedOrg,    
    rol,                       
    dni: username,
    password
  }
  const res = await fetch('https://62zai3xgf6.execute-api.us-east-1.amazonaws.com/dev/usuario/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const raw = await res.json()
  const p = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body
  if (!p.token) {
    setLoading(false)
    alert(p.error || 'Credenciales incorrectas')
    return
  }
  localStorage.setItem('authToken', p.token)
  localStorage.setItem('user', username)
  localStorage.setItem('rol', rol)
  localStorage.setItem('orgId', selectedOrg)
  onLogin(username, rol)

    if (rol === 'instructor') navigate('/instructor/dashboard')
    if (rol === 'alumno') navigate('/alumno/cursos')
    if (rol === 'admin') navigate('/admin/dashboard')
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Inicio de Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>DNI</label>
            <input value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as any)} disabled={loading}>
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Organización</label>
            <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} disabled={loading}>
              <option value="">-- elige organización --</option>
              {orgs.map(o => (
                <option key={o.tenant_id} value={o.tenant_id}>
                  {o.tenant_id} – {o.descripcion}
                </option>
              ))}
            </select>
          </div>
          <button
                type="submit"
                className="login-button"
                disabled={loading || !username || !password || !selectedOrg}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="login-footer">
          ¿Eres nuevo?{' '}
          <button type="button" className="register-link"
          onClick={() => navigate('/register')}
          disabled={loading}
            tabIndex={-1}>
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  )
}
