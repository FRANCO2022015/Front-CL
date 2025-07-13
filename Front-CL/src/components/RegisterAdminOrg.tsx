import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ORG_URL = import.meta.env.VITE_API_ORG_URL
const USER_URL = import.meta.env.VITE_API_USER_URL

export default function RegisterAdminOrg() {
  const [org, setOrg] = useState({ tenant_id: '', descripcion: '', correo: '', dominio: '', puerto: '' })
  const [admin, setAdmin] = useState({ dni: '', full_name: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // 1. Crear organización
    const resOrg = await fetch(`${ORG_URL}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(org)
    })
    if (!resOrg.ok) { alert('Error creando organización'); setLoading(false); return }
    // 2. Crear admin para la org
    const resUser = await fetch(`${USER_URL}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...admin, rol: 'admin', tenant_id: org.tenant_id })
    })
    if (!resUser.ok) { alert('Error creando admin'); setLoading(false); return }
    alert('Organización y Admin creados. Ya puedes iniciar sesión.')
    navigate('/login')
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registrar Nueva Organización</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID Organización</label>
            <input value={org.tenant_id} onChange={e => setOrg({ ...org, tenant_id: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input value={org.descripcion} onChange={e => setOrg({ ...org, descripcion: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input value={org.correo} onChange={e => setOrg({ ...org, correo: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Dominio</label>
            <input value={org.dominio} onChange={e => setOrg({ ...org, dominio: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Puerto</label>
            <input value={org.puerto} onChange={e => setOrg({ ...org, puerto: e.target.value })} required />
          </div>
          <h3>Datos de Admin Principal</h3>
          <div className="form-group">
            <label>DNI</label>
            <input value={admin.dni} onChange={e => setAdmin({ ...admin, dni: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input value={admin.full_name} onChange={e => setAdmin({ ...admin, full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={admin.password} onChange={e => setAdmin({ ...admin, password: e.target.value })} required />
          </div>
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Organización y Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
