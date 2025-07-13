import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USER_URL = import.meta.env.VITE_API_USER_URL

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dni, setDni] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [rolListar, setRolListar] = useState<'alumno' | 'instructor'>('alumno')
  const [listLoading, setListLoading] = useState(false)

  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''

  // Logout handler
  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  // Crear instructor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`${USER_URL}/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        dni,
        full_name: fullName,
        password,
        rol: 'instructor',
        tenant_id: orgId
      })
    })
    setLoading(false)
    if (res.ok) {
      alert('Instructor creado correctamente')
      setDni('')
      setFullName('')
      setPassword('')
    } else {
      alert('Error al crear instructor')
    }
  }

  // Listar usuarios
  const listarUsuarios = async () => {
    setListLoading(true)
    const res = await fetch(`${USER_URL}/listar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        tenant_id: orgId,
        rol: rolListar,
        last_dni: ''
      })
    })
    const data = await res.json()
    const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
    setUsuarios(body.usuarios || [])
    setListLoading(false)
  }

  useEffect(() => {
    listarUsuarios()
    // eslint-disable-next-line
  }, [rolListar])

  return (
    <div className="admin-dashboard-container" style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <button onClick={logout} className="logout-btn" style={{ float: 'right', marginBottom: 16 }}>
        Cerrar sesión
      </button>
      <h1>Panel de Administrador</h1>

      {/* CREAR INSTRUCTOR */}
      <section style={{ margin: '32px 0' }}>
        <h2>Crear Instructor</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={dni}
            onChange={e => setDni(e.target.value)}
            placeholder="DNI"
            required
            style={{ padding: 6 }}
          />
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Nombre completo"
            required
            style={{ padding: 6 }}
          />
          <input
            value={password}
            type="password"
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            style={{ padding: 6 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Instructor'}
          </button>
        </form>
      </section>

      {/* LISTAR USUARIOS */}
      <section>
        <h2>Usuarios registrados</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Ver:&nbsp;</label>
          <select value={rolListar} onChange={e => setRolListar(e.target.value as any)}>
            <option value="alumno">Alumnos</option>
            <option value="instructor">Instructores</option>
          </select>
          <button onClick={listarUsuarios} style={{ marginLeft: 12 }}>Actualizar</button>
        </div>
        {listLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>DNI</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Nombre Completo</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>No hay usuarios</td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.dni}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.dni}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.full_name}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.rol}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
