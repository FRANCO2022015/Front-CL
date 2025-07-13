import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
const ORG_URL = import.meta.env.VITE_API_ORG_URL
const USER_URL = import.meta.env.VITE_API_USER_URL
const CURSO_URL = import.meta.env.VITE_API_CURSO_URL
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL
const COMPRA_URL = import.meta.env.VITE_API_COMPRA_URL
export default function VerAlumnos() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const [alumnos, setAlumnos] = useState<{ dni: string; nombre: string }[]>([])
  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''

  useEffect(() => {
    fetch(
      `${COMPRA_URL}/listar?tenant=${orgId}&cursoId=${cursoId}`,
      { headers: { Authorization: token } }
    )
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setAlumnos(b.compras || [])
      })
  }, [cursoId, orgId, token])

  return (
    <div className="list-page">
      <h2>Alumnos Matriculados</h2>
      <ul>
        {alumnos.map(a => (
          <li key={a.dni}>{a.dni} – {a.nombre}</li>
        ))}
      </ul>
    </div>
  )
}
