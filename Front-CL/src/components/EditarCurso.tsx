import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL

type InfoField = { key: string; value: string }

export default function EditarCurso() {
  const { cursoId } = useParams()
  const [curso, setCurso] = useState<any>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [precio, setPrecio] = useState('')
  // info dinámica
  const [infoExtra, setInfoExtra] = useState<InfoField[]>([{ key: '', value: '' }])
  const navigate = useNavigate()
  const orgId = localStorage.getItem('orgId') || ''
  const token = localStorage.getItem('authToken') || ''

  useEffect(() => {
    if (!cursoId || !orgId) return
    fetch(`${CURSO_URL}/buscar?curso_id=${cursoId}&tenant_id=${orgId}`, {
      headers: { Authorization: token }
    })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        if (!b || !b.curso_id) {
          alert('Curso no encontrado')
          navigate(-1)
          return
        }
        setCurso(b)
        setNombre(b.nombre)
        setDescripcion(b.descripcion)
        setInicio(b.inicio)
        setFin(b.fin)
        setPrecio(b.precio || '')
        // Cargar info dinámica
        if (b.informacion && typeof b.informacion === 'object') {
          const infoFields = Object.entries(b.informacion)
            .map(([key, value]) => ({ key, value: String(value ?? '') }))
          setInfoExtra(infoFields.length ? infoFields : [{ key: '', value: '' }])
        }
      })
  }, [cursoId, orgId, token, navigate])

  // Agregar campo info
  const addInfoField = () =>
    setInfoExtra([...infoExtra, { key: '', value: '' }])

  // Eliminar campo info
  const removeInfoField = (idx: number) =>
    setInfoExtra(infoExtra.filter((_item, i) => i !== idx))

  // Cambiar valor campo info
  const handleInfoChange = (idx: number, field: 'key' | 'value', value: string) => {
    setInfoExtra(infoExtra.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ))
  }

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Objeto información dinámica
    const informacion: { [key: string]: string } = {}
    infoExtra.forEach(({ key, value }) => {
      if (key) informacion[key] = value
    })

    const res = await fetch(`${CURSO_URL}/modificar?tenant_id=${orgId}&curso_id=${cursoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({
        nombre,
        descripcion,
        inicio,
        fin,
        precio: parseFloat(precio),
        informacion,
      })
    })
    if (res.ok) {
      alert('Curso actualizado')
      navigate('/instructor/dashboard?updated=1')
    } else {
      alert('Error actualizando curso')
    }
  }

  if (!curso) return <div style={{ color: 'white', padding: 30 }}>Cargando...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#151c28', color: 'white', padding: 30 }}>
      <h2>Editar Curso</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, marginTop: 24 }}>
        <div style={{ marginBottom: 14 }}>
          <label>Nombre<br />
            <input value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Descripción<br />
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Inicio<br />
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Fin<br />
            <input type="date" value={fin} onChange={e => setFin(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Precio<br />
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 14 }}>
          <b>Información adicional:</b>
          {infoExtra.map((field, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                placeholder="Título del campo (ej: silabo, materiales, nota, etc)"
                value={field.key}
                onChange={e => handleInfoChange(idx, 'key', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Valor"
                value={field.value}
                onChange={e => handleInfoChange(idx, 'value', e.target.value)}
                style={{ flex: 2 }}
              />
              <button type="button" style={{ background: '#de2d2d', color: 'white', borderRadius: 5 }} onClick={() => removeInfoField(idx)}>
                ×
              </button>
            </div>
          ))}
          <button type="button" style={{ background: '#1976d2', color: 'white', borderRadius: 5, marginTop: 4 }} onClick={addInfoField}>
            + Agregar campo
          </button>
        </div>
        <button type="submit" style={{ background: '#1976d2', color: 'white', border: 'none', padding: '12px 22px', borderRadius: 8, fontWeight: 700 }}>
          Guardar Cambios
        </button>
        <button type="button" style={{ marginLeft: 16, background: '#a9a9a9', color: 'white', border: 'none', padding: '12px 22px', borderRadius: 8 }} onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </form>
    </div>
  )
}
