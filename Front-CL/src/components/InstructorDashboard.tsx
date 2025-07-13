import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../components/useApi'
import LogoutButton from './LogoutButton'
import './InstructorDashboard.css'

export default function InstructorDashboard() {
  const [cursos, setCursos] = useState<any[]>([])
  const [horarios, setHorarios] = useState<Record<string, any[]>>({})
  const orgId = localStorage.getItem('orgId') || ''
  const instructor = localStorage.getItem('user') || ''
  const navigate = useNavigate()
  const { apiFetch } = useApi()

  useEffect(() => {
    apiFetch(`https://1dma7jwvx5.execute-api.us-east-1.amazonaws.com/dev/curso/listar?tenant_id=${orgId}&instructor_dni=${instructor}`)
      .then(d => {
        if (!d) return // ya hizo logout automático
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
      })
  }, [orgId, instructor])

  useEffect(() => {
    cursos.forEach(c => {
      apiFetch(`https://pu2l6zwh79.execute-api.us-east-1.amazonaws.com/dev/horario/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`)
        .then(d => {
          if (!d) return
          const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
          setHorarios(p => ({ ...p, [c.curso_id]: b.horarios || [] }))
        })
    })
  }, [cursos, orgId])
  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Panel de Instructor</h1>
        <button onClick={() => navigate('/instructor/crear-curso')}>Crear Curso</button>
        <LogoutButton />
      </header>

      {cursos.length === 0 ? (
        <p>No hay cursos.</p>
      ) : (
        <div className="courses-grid">
          {cursos.map(c => (
            <div key={c.curso_id} className="course-card">
              <h2>{c.nombre}</h2>
              <p>{c.descripcion}</p>
              <small>{c.inicio} → {c.fin}</small>
              <div className="actions">
                <button onClick={() => navigate(`/instructor/${c.curso_id}/alumnos`)}>Ver Alumnos</button>
                <button onClick={() => navigate(`/instructor/${c.curso_id}/crear-horario`)}>Crear Horario</button>
              </div>
              <div className="horarios-list">
                {horarios[c.curso_id]?.length > 0 ? (
                  horarios[c.curso_id].map(h => (
                    <div key={h.horario_id} className="horario-item">
                      <strong>Días:</strong> {h.dias.join(', ')}<br/>
                      <strong>Hora:</strong> {h.inicio_hora} - {h.fin_hora}
                    </div>
                  ))
                ) : (
                  <p>No hay horarios.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
