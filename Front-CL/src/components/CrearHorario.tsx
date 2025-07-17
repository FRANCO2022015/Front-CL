import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL

export default function CrearHorario() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const [dias, setDias] = useState<string[]>([])
  const [inicioHora, setInicioHora] = useState('')
  const [finHora, setFinHora] = useState('')
  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''
  const navigate = useNavigate()

  const toggleDia = (d: string) => {
    setDias(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { tenant_id: orgId, curso_id: cursoId, dias, inicio_hora: inicioHora, fin_hora: finHora }
    await fetch(`${HORARIO_URL}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(body)
    })
    navigate('/instructor/dashboard')
  }

  return (
    <div className="form-page">
      <h2>Crear Horario</h2>
      <form onSubmit={handleSubmit}>
        <label><input type="checkbox" onChange={() => toggleDia('lunes')} /> lunes</label>
        <label><input type="checkbox" onChange={() => toggleDia('martes')} /> martes</label>
        <label><input type="checkbox" onChange={() => toggleDia('miercoles')} /> miércoles</label>
        <label><input type="checkbox" onChange={() => toggleDia('jueves')} /> jueves</label>
        <label><input type="checkbox" onChange={() => toggleDia('viernes')} /> viernes</label>
        <input type="time" value={inicioHora} onChange={e => setInicioHora(e.target.value)} required />
        <input type="time" value={finHora} onChange={e => setFinHora(e.target.value)} required />
        <button type="submit">Crear Horario</button>
        <button type="button" style={{ marginLeft: 8, background: '#a9a9a9', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '2px 16px' }} onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </form>
    </div>
  )
}
