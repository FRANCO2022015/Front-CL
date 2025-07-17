import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const CURSO_URL = import.meta.env.VITE_API_CURSO_URL

export default function CrearCurso() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [precio, setPrecio] = useState('')
  const [infoExtra, setInfoExtra] = useState([{ key: '', value: '' }])
  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''
  const navigate = useNavigate()

  const addInfoField = () => setInfoExtra([...infoExtra, { key: '', value: '' }])
  const removeInfoField = (idx: number) => setInfoExtra(infoExtra.filter((_, i) => i !== idx))
  const handleInfoChange = (idx: number, field: 'key'|'value', value: string) => {
    setInfoExtra(infoExtra.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const informacion: Record<string, string> = {}
    infoExtra.forEach(({ key, value }) => {
      if (key) informacion[key] = value
    })
    const body = {
      tenant_id: orgId,
      nombre,
      descripcion,
      inicio,
      fin,
      precio: parseFloat(precio),
      informacion,
    }
    await fetch(`${CURSO_URL}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    })
    navigate('/instructor/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#151c28', color: 'white', padding: 30 }}>
      <h2>Crear Curso</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} required />
        <input type="date" value={fin} onChange={e => setFin(e.target.value)} required />
        <input placeholder="Precio" type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />
        <div>
          <div>Información adicional:</div>
          {infoExtra.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <input
                placeholder="Título o clave (ej: silabo)"
                value={item.key}
                onChange={e => handleInfoChange(idx, 'key', e.target.value)}
                style={{ width: 110 }}
              />
              <input
                placeholder="Descripción o valor"
                value={item.value}
                onChange={e => handleInfoChange(idx, 'value', e.target.value)}
                style={{ width: 110 }}
              />
              {infoExtra.length > 1 && (
                <button type="button" onClick={() => removeInfoField(idx)} style={{ color: '#fff', background: '#de2d2d', border: 'none', borderRadius: 6, fontWeight: 700, padding: '0 8px' }}>X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInfoField} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, padding: '2px 10px', marginTop: 4 }}>
            Agregar otra
          </button>
        </div>
        <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 16px' }}>Crear</button>
        <button type="button" onClick={() => navigate(-1)} style={{ background: '#a9a9a9', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 16px' }}>Cancelar</button>
      </form>
    </div>
  )
}
