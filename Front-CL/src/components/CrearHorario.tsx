import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
    await fetch('https://pu2l6zwh79.execute-api.us-east-1.amazonaws.com/dev/horario/crear', {
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
        <input type="time" value={inicioHora} onChange={e => setInicioHora(e.target.value)} />
        <input type="time" value={finHora} onChange={e => setFinHora(e.target.value)} />
        <button type="submit">Crear Horario</button>
      </form>
    </div>
  )
}
