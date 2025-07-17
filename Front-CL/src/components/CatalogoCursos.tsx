import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL

export default function CatalogoCursos() {
  const [cursos, setCursos] = useState<any[]>([])
  const navigate = useNavigate()
  const orgId = localStorage.getItem('orgId') || ''
  const token = localStorage.getItem('authToken') || ''

  useEffect(() => {
    fetch(`${CURSO_URL}/listar?tenant_id=${orgId}`, {
      headers: { Authorization: token }
    })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === "string" ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
      })
  }, [orgId, token])

  return (
    <div style={{ padding: 32 }}>
      <h1>Catálogo de Cursos</h1>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 32 }}>
        {cursos.map(curso => (
          <div
            key={curso.curso_id}
            style={{
              background: "#232a38", color: "white", padding: 28, borderRadius: 18,
              minWidth: 340, minHeight: 120, boxShadow: "0 2px 8px #0003", cursor: "pointer"
            }}
            onClick={() => navigate(`/curso/${curso.curso_id}`)}
          >
            <div style={{ fontWeight: 700, fontSize: 22 }}>{curso.nombre}</div>
            <div style={{ fontSize: 16, opacity: 0.95, marginBottom: 8 }}>{curso.descripcion}</div>
            <div>
              <b
                style={{ color: "#5ecbfa", cursor: "pointer" }}
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/instructor/${curso.instructor_dni}/cursos`)
                }}
              >
                {curso.instructor_dni}
              </b>
            </div>
            <div style={{ fontSize: 15, marginTop: 3 }}>
              {curso.inicio} → {curso.fin}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
