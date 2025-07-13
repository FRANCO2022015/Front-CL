import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CrearCurso() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [precio, setPrecio] = useState('')
  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { tenant_id: orgId, nombre, descripcion, inicio, fin, precio: parseFloat(precio) }
    const res = await fetch('https://1dma7jwvx5.execute-api.us-east-1.amazonaws.com/dev/curso/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    })
    const raw = await res.json()
    const b = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body
    navigate(`/instructor/${b.curso_id}/crear-horario`)
  }

  return (
    <div className="form-page">
      <h2>Crear Curso</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
        <input type="date" value={fin} onChange={e => setFin(e.target.value)} />
        <input placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} />
        <button type="submit">Crear</button>
      </form>
    </div>
  )
}
