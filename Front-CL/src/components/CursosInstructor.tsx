import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL

export default function CursosInstructor() {
  const { instructorDni } = useParams<{ instructorDni: string }>()
  const [cursos, setCursos] = useState<any[]>([])
  const orgId = localStorage.getItem('orgId') || ''
  const token = localStorage.getItem('authToken') || ''

  useEffect(() => {
    fetch(`${CURSO_URL}/listar?tenant_id=${orgId}&instructor_dni=${instructorDni}`, {
      headers: { Authorization: token }
    })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === "string" ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
      })
  }, [orgId, instructorDni, token])

  return (
    <div style={{ padding: 40 }}>
      <h2>Cursos de Instructor {instructorDni}</h2>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 24 }}>
        {cursos.map(curso => (
          <div
            key={curso.curso_id}
            style={{
              background: "#232a38", color: "white", padding: 28, borderRadius: 18,
              minWidth: 320, minHeight: 110, boxShadow: "0 2px 8px #0003"
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 22 }}>{curso.nombre}</div>
            <div>{curso.descripcion}</div>
            <div style={{ marginTop: 3 }}>{curso.inicio} → {curso.fin}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
