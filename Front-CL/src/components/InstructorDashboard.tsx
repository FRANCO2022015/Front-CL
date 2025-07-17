import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL
const COMPRA_URL = import.meta.env.VITE_API_COMPRA_URL
const LIMIT = 4

export default function InstructorDashboard() {
  const [cursos, setCursos] = useState<any[]>([])
  const [horarios, setHorarios] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAlumnos, setShowAlumnos] = useState<string | null>(null)
  const [alumnos, setAlumnos] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginado
  const [lastCursoId, setLastCursoId] = useState<string | null>(null)
  const [prevPaginas, setPrevPaginas] = useState<string[]>([])
  const [isLastPage, setIsLastPage] = useState(false)

  const navigate = useNavigate()
  const orgId = localStorage.getItem('orgId') || ''
  const instructorDni = localStorage.getItem('user') || ''
  const token = localStorage.getItem('authToken') || ''

  // Cargar cursos del instructor (con paginado)
  const fetchCursos = (lastIdParam?: string) => {
    setLoading(true)
    setError(null)
    let url = `${CURSO_URL}/listar?tenant_id=${orgId}&instructor_dni=${instructorDni}&limit=${LIMIT}`
    if (lastIdParam) url += `&lastCursoId=${lastIdParam}`
    fetch(url, { headers: { Authorization: token } })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
        setLastCursoId(b.paginacion?.ultimoCursoId || null)
        setIsLastPage((b.cursos || []).length < LIMIT)
        setLoading(false)
        if (!b.cursos || b.cursos.length === 0) setError('No tienes cursos creados aún.')
      })
      .catch(() => {
        setError('No se pudo conectar al servidor. Intenta de nuevo.')
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!orgId || !instructorDni || !token) {
      setLoading(true)
      setError('Cargando datos de sesión...')
      setCursos([])
      return
    }
    fetchCursos()
    setPrevPaginas([])
  }, [orgId, instructorDni, token])

  // Cargar horarios de cada curso al cambiar la página
  useEffect(() => {
    if (cursos.length === 0) return
    Promise.all(
      cursos.map(c =>
        fetch(`${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`, {
          headers: { Authorization: token }
        })
          .then(r => r.json())
          .then(d => {
            const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
            return [c.curso_id, b.horarios || []] as [string, any[]]
          })
      )
    ).then(all => setHorarios(Object.fromEntries(all)))
  }, [cursos, orgId, token])

  // Eliminar curso
  const handleDelete = async (cursoId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return
    await fetch(`${CURSO_URL}/eliminar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ tenant_id: orgId, curso_id: cursoId })
    })
    // Vuelve a recargar la página para que el paginado siga consistente
    fetchCursos(prevPaginas[prevPaginas.length - 1])
  }

  // Editar curso
  const handleEdit = (cursoId: string) => {
    navigate(`/instructor/editar-curso/${cursoId}`)
  }

  // Ver alumnos de un curso
  const verAlumnos = async (cursoId: string) => {
    if (alumnos[cursoId]) {
      setShowAlumnos(showAlumnos === cursoId ? null : cursoId)
      return
    }
    const res = await fetch(`${COMPRA_URL}/listar?tenant_id=${orgId}&curso_id=${cursoId}&estado=inscrito`, {
      headers: { Authorization: token }
    })
    const d = await res.json()
    const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
    setAlumnos(a => ({ ...a, [cursoId]: b.compras || [] }))
    setShowAlumnos(cursoId)
  }

  // Siguiente página
  const nextPage = () => {
    if (isLastPage || cursos.length === 0) return
    const lastId = cursos[cursos.length - 1].curso_id
    setPrevPaginas(prev => [...prev, lastId])
    fetchCursos(lastId)
  }
  // Página anterior
  const backPage = () => {
    if (prevPaginas.length === 0) return
    const prevLastCursoId = prevPaginas.length > 1 ? prevPaginas[prevPaginas.length - 2] : undefined
    setPrevPaginas(prev => prev.slice(0, -1))
    fetchCursos(prevLastCursoId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#151c28' }}>
      <div style={{ padding: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 32 }}>Panel de Instructor</h1>
        <div>
          <button
            onClick={backPage}
            disabled={prevPaginas.length === 0}
            style={{ marginRight: 6, opacity: prevPaginas.length === 0 ? 0.6 : 1 }}>Anterior</button>
          <button
            onClick={nextPage}
            disabled={isLastPage}
            style={{ marginRight: 20, opacity: isLastPage ? 0.6 : 1 }}>Siguiente</button>
          <button
            onClick={() => navigate('/instructor/crear-curso')}
            style={{
              background: '#1976d2', color: 'white', border: 'none', padding: '12px 22px',
              fontWeight: 700, fontSize: 16, borderRadius: 8, marginRight: 16
            }}
          >Crear Curso</button>
          <button
            onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{
              background: '#1e293b', color: 'white', border: 'none', padding: '12px 22px',
              fontWeight: 700, fontSize: 16, borderRadius: 8
            }}
          >Cerrar sesión</button>
        </div>
      </div>

      {/* Loading/Error mensajes */}
      {loading && (
        <div style={{ color: "#fff", fontSize: 22, padding: 60, textAlign: "center" }}>
          Cargando tus cursos...
        </div>
      )}
      {error && !loading && (
        <div style={{ color: "#ffb300", fontSize: 22, padding: 60, textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* Lista de cursos */}
      {!loading && !error && (
        <div style={{
          display: 'flex', gap: 32, flexWrap: 'wrap', padding: 30, alignItems: 'flex-start'
        }}>
          {cursos.map(curso => (
            <div
              key={curso.curso_id}
              style={{
                background: '#232a38',
                color: 'white',
                padding: 28,
                borderRadius: 18,
                minWidth: 330,
                minHeight: 170,
                boxShadow: expanded === curso.curso_id ? '0 4px 18px #0008' : '0 2px 8px #0002',
                cursor: 'pointer',
                position: 'relative',
                transition: 'box-shadow .2s'
              }}
              onClick={() => setExpanded(expanded === curso.curso_id ? null : curso.curso_id)}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{curso.nombre}</div>
              <div style={{ opacity: 0.93, fontSize: 15, marginBottom: 8 }}>{curso.descripcion}</div>
              <div style={{ fontSize: 14, marginBottom: 12 }}>
                {curso.inicio} → {curso.fin}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  style={{ background: '#1976d2', color: 'white', border: 'none', padding: '6px 18px', borderRadius: 8, fontWeight: 600 }}
                  onClick={e => { e.stopPropagation(); verAlumnos(curso.curso_id) }}
                >Ver Alumnos</button>
                <button
                  style={{ background: '#0a7b36', color: 'white', border: 'none', padding: '6px 18px', borderRadius: 8, fontWeight: 600 }}
                  onClick={e => { e.stopPropagation(); navigate(`/instructor/${curso.curso_id}/crear-horario`) }}
                >Crear Horario</button>
                <button
                  style={{ background: '#ffc300', color: '#222', border: 'none', padding: '6px 18px', borderRadius: 8, fontWeight: 600 }}
                  onClick={e => { e.stopPropagation(); handleEdit(curso.curso_id) }}
                >Modificar</button>
                <button
                  style={{ background: '#de2d2d', color: 'white', border: 'none', padding: '6px 18px', borderRadius: 8, fontWeight: 600 }}
                  onClick={e => { e.stopPropagation(); handleDelete(curso.curso_id) }}
                >Eliminar</button>
              </div>

              {/* Ver alumnos inscritos */}
              {showAlumnos === curso.curso_id && (
                <div style={{
                  marginTop: 8,
                  background: '#19203a',
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: '0 2px 8px #0002',
                  maxHeight: 220, overflowY: 'auto'
                }}>
                  <strong>Alumnos inscritos:</strong>
                  {alumnos[curso.curso_id]?.length === 0 && (
                    <div style={{ color: '#ccc', marginTop: 5 }}>No hay alumnos inscritos.</div>
                  )}
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {alumnos[curso.curso_id]?.map(a => (
                      <li key={a.alumno_dni + a.horario_id}>
                        DNI: {a.alumno_dni} - Horario: {a.dias?.join(', ')} {a.inicio_hora}-{a.fin_hora}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Horarios */}
              {expanded === curso.curso_id && (
                <div style={{
                  marginTop: 14,
                  background: '#182136',
                  padding: 12,
                  borderRadius: 10,
                  boxShadow: '0 2px 6px #0002'
                }}>
                  <strong>Horarios:</strong>
                  <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 10 }}>
                    {(horarios[curso.curso_id] || []).map(horario => (
                      <li key={horario.horario_id} style={{ marginBottom: 4 }}>
                        <b>Días:</b> {horario.dias.join(', ')} &nbsp;
                        <b>Hora:</b> {horario.inicio_hora} - {horario.fin_hora} &nbsp;
                        <b>Precio:</b> S/ {curso.precio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{
                position: 'absolute', top: 18, right: 20,
                fontSize: 18, opacity: 0.5, cursor: 'pointer'
              }}>
                {expanded === curso.curso_id ? '▲' : '▼'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
