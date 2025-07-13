import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.css'

export default function Register() {
  const [tenantId, setTenantId] = useState('')
  const [dni, setDni] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<'alumno'|'instructor'|'admin'>('alumno')
  const [orgs, setOrgs] = useState<{ tenant_id: string; descripcion: string }[]>([])
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
    await fetch('https://62zai3xgf6.execute-api.us-east-1.amazonaws.com/dev/usuario/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, dni, full_name: fullName, password, rol })
    })
    navigate('/login')
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organización</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} required>
              <option value="">-- elige organización --</option>
              {orgs.map(o => (
                <option key={o.tenant_id} value={o.tenant_id}>
                  {o.tenant_id} – {o.descripcion}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input value={dni} onChange={e => setDni(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as any)} required>
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="register-footer">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              className="register-link"
              onClick={() => navigate('/login')}
              tabIndex={-1}
            >
              Inicia sesión aquí
            </button>
          </div>
          <button type="submit" className="register-button">Registrar</button>
        </form>
      </div>
    </div>
  )
}
