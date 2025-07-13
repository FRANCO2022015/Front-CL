import React, { useEffect, useState } from 'react'
import LogoutButton from './LogoutButton'

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
}

type Horario = {
  horario_id: string
  curso_id: string
  dias: string[]
  inicio_hora: string
  fin_hora: string
}

type Compra = {
  curso_id: string
  horario_id: string
  estado: 'reservado' | 'inscrito'
}

export default function Alumno() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [horarios, setHorarios] = useState<Record<string, Horario[]>>({})
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(false)
  const [showCarrito, setShowCarrito] = useState(true)
  const [showMisCompras, setShowMisCompras] = useState(false)
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null)

  const orgId = localStorage.getItem('orgId') || ''
  const alumnoDni = localStorage.getItem('user') || ''
  const alumnoToken = localStorage.getItem('authToken') || ''

  // Simula precios (puedes reemplazar por precios reales del backend si los tienes)
  const getPrecio = (curso_id: string) => {
  const curso = cursos.find(c => c.curso_id === curso_id)
  return curso?.precio ?? 0
}


  // Trae cursos y horarios
  useEffect(() => {
    fetch(`${CURSO_URL}/listar?tenant_id=${orgId}`,{
      headers: { Authorization: alumnoToken }
    })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
      })
  }, [orgId])

  useEffect(() => {
    if (cursos.length === 0) return
    Promise.all(
      cursos.map(c =>
        fetch(`${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`,{
          headers: { Authorization: alumnoToken }
        })
          .then(r => r.json())
          .then(d => {
            const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
            return [c.curso_id, b.horarios || []] as [string, Horario[]]
          })
      )
    ).then(all =>
      setHorarios(Object.fromEntries(all))
    )
  }, [cursos, orgId])

  // Trae compras (reservas e inscripciones)
  

  const fetchReservados = () =>
  fetch(`${COMPRA_URL}/listar?tenant_id=${orgId}&alumno_dni=${alumnoDni}&estado=reservado`, {
    headers: { Authorization: alumnoToken }
  })
    .then(r => r.json())
    .then(d => {
      const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
      setReservados(b.compras || [])
    })

const fetchInscritos = () =>
  fetch(`${COMPRA_URL}/listar?tenant_id=${orgId}&alumno_dni=${alumnoDni}&estado=inscrito`, {
    headers: { Authorization: alumnoToken }
  })
    .then(r => r.json())
    .then(d => {
      const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
      setInscritos(b.compras || [])
    })

useEffect(() => {
  if (alumnoDni && orgId) {
    fetchReservados()
    fetchInscritos()
  }
}, [alumnoDni, orgId])


  // Reservar un curso
  const reservar = async (curso: Curso, horario: Horario) => {
    setLoading(true)
    await fetch(`${COMPRA_URL}/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: alumnoToken },
      body: JSON.stringify({
        tenant_id: orgId,
        curso_id: curso.curso_id,
        horario_id: horario.horario_id,
        alumno_dni: alumnoDni,
        estado: 'reservado'
      })
    })
    await fetchReservados()
    await fetchInscritos()
  setLoading(false)
  }

  // Inscribir un solo curso
  const inscribirse = async (curso: Curso, horario: Horario) => {
    setLoading(true)
    await fetch(`${COMPRA_URL}/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: alumnoToken },
      body: JSON.stringify({
        tenant_id: orgId,
        curso_id: curso.curso_id,
        horario_id: horario.horario_id,
        alumno_dni: alumnoDni,
        estado: 'inscrito'
      })
    })
   await fetchInscritos()
  await fetchReservados()
  setLoading(false)
  }

  // Inscribir todos los reservados
const inscribirTodosReservados = async () => {
  setLoading(true)
  if (reservados.length === 0) {
    setLoading(false)
    return
  }
  await Promise.all(
    reservados.map(c =>
      fetch(`${COMPRA_URL}/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: alumnoToken },
        body: JSON.stringify({
          tenant_id: orgId,
          curso_id: c.curso_id,
          horario_id: c.horario_id,
          alumno_dni: alumnoDni,
          estado: 'inscrito'
        })
      })
    )
  )
  await fetchReservados()
  await fetchInscritos()
  setLoading(false)
}


  // Estado de cada horario (reservado/inscrito/libre)
  const getEstado = (curso_id: string, horario_id: string) => {
    const comp = compras.find(c => c.curso_id === curso_id && c.horario_id === horario_id)
    return comp ? comp.estado : null
  }

  // Cursos reservados
  
  const [reservados, setReservados] = useState<Compra[]>([])
  const [inscritos, setInscritos] = useState<Compra[]>([])


  // Suma precios de los cursos reservados
  const totalReservado = reservados.reduce(
    (sum, c) => sum + getPrecio(c.curso_id),
    0
  )

   return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <LogoutButton />
        <h1>Catálogo de Cursos</h1>

        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 32 }}>
          {cursos.map(curso => (
            <div
              key={curso.curso_id}
              className="alumno-curso-card"
              style={{
                background: '#232a38',
                color: 'white',
                padding: 24,
                borderRadius: 16,
                boxShadow: cursoExpandido === curso.curso_id
                  ? '0 4px 16px #0005'
                  : '0 2px 8px #0002',
                minWidth: 320,
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => setCursoExpandido(
                cursoExpandido === curso.curso_id ? null : curso.curso_id
              )}
            >
              <div style={{ fontWeight: 700, fontSize: 22 }}>{curso.nombre}</div>
              <div style={{ marginBottom: 4 }}>{curso.descripcion}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 12 }}>
                {curso.inicio} → {curso.fin}
              </div>

              {/* Si está expandido, muestra horarios */}
              {cursoExpandido === curso.curso_id && (
                <div style={{
                  marginTop: 12,
                  background: '#182136',
                  padding: 12,
                  borderRadius: 10,
                  boxShadow: '0 2px 6px #0002'
                }}>
                  <strong>Horarios:</strong>
                  <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 10 }}>
                    {(horarios[curso.curso_id] || []).map(horario => {
                      const estado = getEstado(curso.curso_id, horario.horario_id)
                      return (
                        <li key={horario.horario_id} style={{ marginBottom: 4 }}>
                          <b>{horario.dias.join(', ')}</b> {horario.inicio_hora}-{horario.fin_hora}
                          <span style={{ marginLeft: 12, fontWeight: 400 }}>
                            <span style={{ color: '#ffc94c' }}>
                              Precio: S/ {curso.precio}
                            </span>
                            {estado === 'inscrito' && (
                              <span style={{ color: 'green', marginLeft: 10 }}>Inscrito</span>
                            )}
                            {estado === 'reservado' && (
                              <span style={{ color: 'orange', marginLeft: 10 }}>Reservado</span>
                            )}
                            {!estado && (
                              <>
                                <button
                                  style={{ marginLeft: 8 }}
                                  onClick={e => { e.stopPropagation(); inscribirse(curso, horario) }}
                                  disabled={loading}
                                >Inscribirse</button>
                                <button
                                  style={{ marginLeft: 8 }}
                                  onClick={e => { e.stopPropagation(); reservar(curso, horario) }}
                                  disabled={loading}
                                >Reservar</button>
                              </>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Icono para mostrar/ocultar */}
              <div style={{
                position: 'absolute', top: 18, right: 20,
                fontSize: 18, opacity: 0.6, cursor: 'pointer'
              }}>
                {cursoExpandido === curso.curso_id ? '▲' : '▼'}
              </div>
            </div>
          ))}
        </div>

         <button onClick={() => setShowCarrito(!showCarrito)}>Carrito</button>
        <button onClick={() => setShowMisCompras(!showMisCompras)}>Mis Compras</button>
      </div>
      {/* Carrito lateral */}
      {showCarrito && (
        <div style={{
          width: 340,
          background: '#d87d22',
          padding: 28,
          color: 'white',
          boxShadow: '-2px 0 18px #0002',
          height: '100vh'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: 'white' }}>Mi Carrito (Reservados)</h2>
            <button onClick={() => setShowCarrito(false)} style={{
              background: 'transparent', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer'
            }}>×</button>
          </div>
          {reservados.length === 0 && <div>No tienes cursos reservados.</div>}
          {reservados.length > 0 && (
            <>
              <ul style={{ paddingLeft: 16 }}>
                {reservados.map(c => {
                  const curso = cursos.find(cur => cur.curso_id === c.curso_id)
                  const horario = (horarios[c.curso_id] || []).find(h => h.horario_id === c.horario_id)
                  return (
                    <li key={c.curso_id + c.horario_id} style={{ marginBottom: 10 }}>
                      <b>{curso?.nombre}</b><br />
                      {horario?.dias?.join(', ')} {horario?.inicio_hora}-{horario?.fin_hora}
                      <br /><b>Precio:</b> S/ {getPrecio(c.curso_id)}
                    </li>
                  )
                })}
              </ul>
              <div style={{ marginTop: 10, fontWeight: 600 }}>
                Total: <span style={{ color: '#fff' }}>S/ {totalReservado}</span>
              </div>
              <button
                onClick={inscribirTodosReservados}
                disabled={loading}
                style={{
                  marginTop: 16, background: '#2196f3', color: 'white',
                  border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700
                }}>
                {loading ? 'Procesando...' : 'Inscribirse en todos'}
              </button>
            </>
          )}
        </div>
      )}
      {/* Mis Compras */}
      {showMisCompras && (
        <div style={{
          width: 340,
          background: '#0e3757',
          padding: 28,
          color: 'white',
          boxShadow: '-2px 0 18px #0002',
          height: '100vh'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: 'white' }}>Mis Compras</h2>
            <button onClick={() => setShowMisCompras(false)} style={{
              background: 'transparent', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer'
            }}>×</button>
          </div>
          {inscritos.length === 0 && <div>No tienes cursos inscritos.</div>}
          {inscritos.length > 0 && (
            <ul style={{ paddingLeft: 16 }}>
              {inscritos.map(c => {
                const curso = cursos.find(cur => cur.curso_id === c.curso_id)
                const horario = (horarios[c.curso_id] || []).find(h => h.horario_id === c.horario_id)
                return (
                  <li key={c.curso_id + c.horario_id} style={{ marginBottom: 10 }}>
                    <b>{curso?.nombre}</b><br />
                    {horario?.dias?.join(', ')} {horario?.inicio_hora}-{horario?.fin_hora}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
