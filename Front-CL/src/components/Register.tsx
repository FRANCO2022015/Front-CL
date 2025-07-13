import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.css'

const ORG_URL = import.meta.env.VITE_API_ORG_URL
const USER_URL = import.meta.env.VITE_API_USER_URL

type Org = {
  tenant_id: string
  descripcion: string
  correo: string
  dominio: string
  detalle?: string
}

export default function Register() {
  const [rol, setRol] = useState<'alumno'|'admin'>('alumno')
  const [orgs, setOrgs] = useState<Org[]>([])
  const [org, setOrg] = useState<Org>({
    tenant_id: '',
    descripcion: '',
    correo: '',
    dominio: '',
    detalle: ''
  })
  const [tenantId, setTenantId] = useState('')
  const [dni, setDni] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${ORG_URL}/listar`)
      .then(r => r.json())
      .then(data => {
        const b = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
        setOrgs(b.organizaciones || [])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (rol === 'admin') {
      // Crear organización (sin puerto)
      const resOrg = await fetch(`${ORG_URL}/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: org.tenant_id,
          descripcion: org.descripcion,
          correo: org.correo,
          dominio: org.dominio,
          detalle: org.detalle
        })
      })
      if (!resOrg.ok) { 
        setLoading(false)
        alert('Error creando organización')
        return 
      }
      // Crear admin
      const resUser = await fetch(`${USER_URL}/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          full_name: fullName,
          password,
          rol: 'admin',
          tenant_id: org.tenant_id
        })
      })
      setLoading(false)
      if (!resUser.ok) {
        alert('Error creando admin')
        return
      }
      alert('Organización y Admin creados. Ya puedes iniciar sesión.')
      navigate('/login')
    } else {
      // Registrar alumno
      await fetch(`${USER_URL}/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          dni,
          full_name: fullName,
          password,
          rol: 'alumno'
        })
      })
      setLoading(false)
      navigate('/login')
    }
  }

  const renderAdminForm = () => (
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
          <label>Detalle (opcional)</label>
          <input value={org.detalle || ''} onChange={e => setOrg({ ...org, detalle: e.target.value })} />
        </div>
        <h3>Datos de Admin Principal</h3>
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
        <div className="register-footer">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="register-link" onClick={() => navigate('/login')} tabIndex={-1}>
            Inicia sesión aquí
          </button>
        </div>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Organización y Admin'}
        </button>
      </form>
    </div>
  )

  const renderAlumnoForm = () => (
    <div className="register-card">
      <h2>Registro de Alumno</h2>
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
        <div className="register-footer">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="register-link" onClick={() => navigate('/login')} tabIndex={-1}>
            Inicia sesión aquí
          </button>
        </div>
        <button type="submit" className="register-button" disabled={loading}>
          Registrar
        </button>
      </form>
    </div>
  )

  return (
    <div className="register-container">
      <div className="register-card" style={{ marginBottom: 16 }}>
        <h2>Registro</h2>
        <div className="form-group">
          <label>Tipo de cuenta</label>
          <select value={rol} onChange={e => setRol(e.target.value as any)}>
            <option value="alumno">Alumno</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
      {rol === 'admin' ? renderAdminForm() : renderAlumnoForm()}
    </div>
  )
}
