import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function VerAlumnos() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const [alumnos, setAlumnos] = useState<{ dni: string; nombre: string }[]>([])
  const token = localStorage.getItem('authToken') || ''
  const orgId = localStorage.getItem('orgId') || ''

  useEffect(() => {
    fetch(
      `https://e1ci7r1h9e.execute-api.us-east-1.amazonaws.com/dev/compra/listar?tenant=${orgId}&cursoId=${cursoId}`,
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
