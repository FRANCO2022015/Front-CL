import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import LogoutButton from "./LogoutButton"

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL
const COMPRA_URL = import.meta.env.VITE_API_COMPRA_URL

type Curso = {
  curso_id: string
  nombre: string
  descripcion: string
  inicio: string
  fin: string
  precio: number
  instructor_dni: string
  // asumimos que el backend devuelve esto:
  informacion?: Record<string, string>;}

type Horario = {
  horario_id: string
  curso_id: string
  dias: string[]
  inicio_hora: string
  fin_hora: string
}

export default function CursoDetalle() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const navigate = useNavigate()
  const token = localStorage.getItem("authToken") || ""
  const orgId = localStorage.getItem("orgId") || ""
  const alumnoDni = localStorage.getItem("user") || ""

  const [curso, setCurso] = useState<Curso | null>(null)
 const [infoAdicional, setInfoAdicional] = useState<Curso["informacion"]>()


  const [horarios, setHorarios] = useState<Horario[]>([])
  const [estadoCompras, setEstadoCompras] = useState<Record<string, "reservado" | "inscrito">>({})
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Carga datos del curso + info adicional
 useEffect(() => {
  fetch(`${CURSO_URL}/buscar?curso_id=${cursoId}&tenant_id=${orgId}`, { headers: { Authorization: token } })
    .then(res => res.json())
    .then(d => {
      const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body;
      setCurso(b);
    });
}, [cursoId, orgId]);
  // Carga horarios
  useEffect(() => {
    if (!cursoId) return
    fetch(
      `${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${cursoId}`,
      { headers: { Authorization: token } }
    )
      .then(res => res.json())
      .then(data => {
        const body = typeof data.body === "string" ? JSON.parse(data.body) : data.body
        setHorarios(body.horarios || [])
      })
  }, [cursoId, orgId, token])

  // Refresca estado de reservas/inscripciones
  const refreshCompras = () => {
    fetch(
      `${COMPRA_URL}/listar?tenant_id=${orgId}&alumno_dni=${alumnoDni}`,
      { headers: { Authorization: token } }
    )
      .then(res => res.json())
      .then(data => {
        const body = typeof data.body === "string" ? JSON.parse(data.body) : data.body
        const rec: Record<string, "reservado" | "inscrito"> = {}
        ;(body.compras || []).forEach((c: any) => {
          rec[c.horario_id] = c.estado
        })
        setEstadoCompras(rec)
      })
  }

  useEffect(refreshCompras, [cursoId, orgId, alumnoDni])

  const reservarHorario = (h: Horario) => {
    setLoading(true)
    fetch(`${COMPRA_URL}/comprar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        tenant_id: orgId,
        curso_id: cursoId,
        horario_id: h.horario_id,
        alumno_dni: alumnoDni,
        estado: "reservado"
      })
    }).then(() => {
      setLoading(false)
      refreshCompras()
    })
  }

  return (
    <div style={{ padding: 32 }}>
      <LogoutButton />
      <h2>{curso?.nombre}</h2>
      <p>{curso?.descripcion}</p>
      <p>
        <strong>Instructor:</strong> {curso?.instructor_dni}
      </p>
      <p>
        <strong>Fechas:</strong> {curso?.inicio} → {curso?.fin}
      </p>

      {/* Mostrar Información Adicional */}
    
        {!showInfo ? (
  <button onClick={() => setShowInfo(true)}>Mostrar Información</button>
) : (
  <div style={{ marginTop: 16 }}>
    <h3>Información adicional</h3>
    <ul>
      {curso?.informacion
        ? Object.entries(curso.informacion).map(([clave, valor]) => (
            <li key={clave}>
              <strong>{clave}:</strong> {valor}
            </li>
          ))
        : <li style={{ color: "#888" }}>No hay información adicional.</li>
      }
    </ul>
  </div>
      )}

      {/* Horarios y Reservar */}
      <div style={{ marginTop: 24 }}>
        <h3>Horarios</h3>
        <ul>
          {horarios.map(h => {
            const estado = estadoCompras[h.horario_id]
            return (
              <li key={h.horario_id} style={{ marginBottom: 8 }}>
                <b>Días:</b> {h.dias.join(", ")} &nbsp;
                <b>Hora:</b> {h.inicio_hora} - {h.fin_hora} &nbsp;
                <b>Precio:</b> S/ {curso?.precio}
                {!estado && (
                  <button
                    onClick={() => reservarHorario(h)}
                    disabled={loading}
                    style={{ marginLeft: 8 }}
                  >
                    Reservar
                  </button>
                )}
                {estado === "reservado" && (
                  <span style={{ color: "orange", marginLeft: 8 }}>Reservado</span>
                )}
                {estado === "inscrito" && (
                  <span style={{ color: "green", marginLeft: 8 }}>Inscrito</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <button
        onClick={() => navigate("/alumno/cursos")}
        style={{ marginTop: 24 }}
      >
        Volver al Catálogo
      </button>
    </div>
  )
}
