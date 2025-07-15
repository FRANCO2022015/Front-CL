import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL
const COMPRA_URL = import.meta.env.VITE_API_COMPRA_URL
const USER_URL = import.meta.env.VITE_API_USER_URL
const LIMIT = 2
export default function InstructorDashboard() {
  const [cursos, setCursos] = useState<any[]>([])
  const [horarios, setHorarios] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAlumnos, setShowAlumnos] = useState<string | null>(null)
  const [alumnos, setAlumnos] = useState<Record<string, any[]>>({})
  const [isLastPage, setIsLastPage] = useState(false)
const [prevPaginas, setPrevPaginas] = useState<string[]>([])
const [loading, setLoading] = useState(false)

   const [ultimoCursoId, setUltimoCursoId] = useState<string | null>(null)

  const navigate = useNavigate()

  const orgId = localStorage.getItem('orgId') || ''
  const instructorDni = localStorage.getItem('user') || ''
  const token = localStorage.getItem('authToken') || ''

  useEffect(() => {
  fetch(`${CURSO_URL}/listar?tenant_id=${orgId}`, {
    headers: { Authorization: token }
  })
    .then(r => r.json())
    .then(d => {
      const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
      // Filtra SOLO los cursos del instructor logueado (dni)
      const soloMisCursos = (b.cursos || []).filter(
        (c: any) => c.instructor_dni === instructorDni // O c.tenant_instructor === instructorDni si es el caso
      )
      setCursos(soloMisCursos)
    })
}, [orgId, instructorDni, token])

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

  const handleDelete = async (cursoId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este curso?')) return
    await fetch(`${CURSO_URL}/eliminar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ tenant_id: orgId, curso_id: cursoId })
    })
    setCursos(cursos.filter(c => c.curso_id !== cursoId))
  }

  const handleEdit = (cursoId: string) => {
    // Puedes navegar a una página para editar o mostrar un modal
    navigate(`/instructor/editar-curso/${cursoId}`)
  }

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
const fetchCursos = async (lastCursoId = '') => {
  setLoading(true)
  let url = `${CURSO_URL}/listar?tenant_id=${orgId}&limit=2&dni_instructor=${instructorDni}`
  if (lastCursoId) url += `&lastCursoId=${lastCursoId}`

  const res = await fetch(url, { headers: { Authorization: token } })
  const d = await res.json()
  const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
  setCursos(b.cursos || [])
  setIsLastPage(!b.paginacion || !b.paginacion.ultimoCursoId || (b.cursos && b.cursos.length < 2))
  setLoading(false)
}

useEffect(() => {
  fetchCursos()
  setPrevPaginas([])
}, [orgId, instructorDni])

// Siguiente página
const nextPage = () => {
  if (isLastPage || cursos.length === 0) return
  // OJO: El último curso de la página actual
  const lastCursoId = cursos[cursos.length - 1].curso_id
  setPrevPaginas(prev => [...prev, lastCursoId])
  fetchCursos(lastCursoId)
}

// Página anterior
const backPage = () => {
  if (prevPaginas.length === 0) return
  const prevLastCursoId = prevPaginas[prevPaginas.length - 2] || ''
  setPrevPaginas(prev => prev.slice(0, -1))
  fetchCursos(prevLastCursoId)
}


  return (
    <div style={{ minHeight: '100vh', background: '#151c28' }}>
      <div style={{ padding: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontWeight: 800, fontSize: 32 }}>Panel de Instructor</h1>
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      <button onClick={backPage} disabled={prevPaginas.length ==0 || loading}>Anterior</button>
      <button onClick={nextPage} disabled={isLastPage || loading}>Siguiente</button>
    </div>
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
                      <b>Hora:</b> {horario.inicio_hora} - {horario.fin_hora}&nbsp;
                      <b>Precio:</b> S/ {curso.precio}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Icono para expandir/colapsar */}
            <div style={{
              position: 'absolute', top: 18, right: 20,
              fontSize: 18, opacity: 0.5, cursor: 'pointer'
            }}>
              {expanded === curso.curso_id ? '▲' : '▼'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
