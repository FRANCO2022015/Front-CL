import React, { useState, useEffect } from 'react'
import { useApi } from '../components/useApi'
import LogoutButton from './LogoutButton'

interface Curso {
  curso_id: string
  nombre: string
  descripcion: string
  inicio: string
  fin: string
}

interface Horario {
  horario_id: string
  dias: string[]
  inicio_hora: string
  fin_hora: string
}

export default function Alumno() {
  const orgId = localStorage.getItem('orgId') || ''
  const alumnoDni = localStorage.getItem('user') || ''
  const { apiFetch } = useApi()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [horarios, setHorarios] = useState<Record<string, Horario[]>>({})
  const [compras, setCompras] = useState<any[]>([])
  const [showCarrito, setShowCarrito] = useState(false)
  const alumnoToken = localStorage.getItem('authToken') || ''

  // Listar cursos
  useEffect(() => {
    apiFetch(`https://1dma7jwvx5.execute-api.us-east-1.amazonaws.com/dev/curso/listar?tenant_id=${orgId}`)
      .then(d => {
        if (!d) return
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
      })
  }, [orgId])

  // Listar horarios para cada curso
  useEffect(() => {
    cursos.forEach(c => {
      apiFetch(`https://pu2l6zwh79.execute-api.us-east-1.amazonaws.com/dev/horario/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`)
        .then(d => {
          if (!d) return
          const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
          setHorarios(prev => ({ ...prev, [c.curso_id]: b.horarios || [] }))
        })
    })
  }, [cursos, orgId])

  // Listar compras del alumno (inscritos y reservados)
  const refreshCompras = () => {
    apiFetch(`https://e1ci7r1h9e.execute-api.us-east-1.amazonaws.com/dev/compra/listar?tenant_id=${orgId}&alumno_dni=${alumnoDni}`)
      .then(d => {
        if (!d) return
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCompras(b.compras || [])
      })
  }
  useEffect(refreshCompras, [orgId, alumnoDni])

  // Inscribirse a un curso-horario
  const inscribirse = async (curso: Curso, horario: Horario) => {
    await apiFetch('https://e1ci7r1h9e.execute-api.us-east-1.amazonaws.com/dev/compra/comprar', {
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
    refreshCompras()
  }

  // Reservar un curso-horario
  const reservar = async (curso: Curso, horario: Horario) => {
    await apiFetch('https://e1ci7r1h9e.execute-api.us-east-1.amazonaws.com/dev/compra/comprar', {
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
    setTimeout(refreshCompras, 400)
    refreshCompras()
  }

  // Compras filtradas
  const inscritos = compras.filter(c => c.estado === 'inscrito').map(c => c.curso_id + c.horario_id)
  const reservados = compras.filter(c => c.estado === 'reservado').map(c => c.curso_id + c.horario_id)

  return (
    <div className="alumno-bg">
      <div className="alumno-main">
        <LogoutButton />
        <h1 className="alumno-title">Catálogo de Cursos</h1>
        <div className="alumno-grid">
          {cursos.map(curso => (
            <div key={curso.curso_id} className="alumno-curso-card">
              <div className="alumno-curso-nombre">{curso.nombre}</div>
              <div className="alumno-curso-desc">{curso.descripcion}</div>
              <div style={{marginBottom:8}}><small>{curso.inicio} → {curso.fin}</small></div>
              <div>
                <strong>Horarios:</strong>
                <ul style={{ margin: 0,
                            paddingLeft: 18,
                            marginBottom: 10,
                            color: '#e1e2e6ff',      
                            fontWeight: 500}}>
                  {(horarios[curso.curso_id] || []).map(horario => {
                    const key = curso.curso_id + horario.horario_id
                    return (
                      <li key={horario.horario_id} style={{marginBottom:3}}>
                        {horario.dias.join(', ')} {horario.inicio_hora}-{horario.fin_hora}
                        <div style={{marginTop:4}}>
                          {inscritos.includes(key) ? (
                            <button className="alumno-inscrito-btn" disabled>Inscrito</button>
                          ) : reservados.includes(key) ? (
                            <button className="alumno-reservado-btn" disabled>Reservado</button>
                          ) : (
                            <>
                              <button
                                className="alumno-inscribirse-btn"
                                onClick={() => inscribirse(curso, horario)}
                              >Inscribirse</button>
                              <button
                                className="alumno-reservar-btn"
                                onClick={() => reservar(curso, horario)}
                              >Reservar</button>
                            </>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ))}

        </div>
        {/* Botón mostrar carrito */}
        <button className="alumno-ver-carrito-btn" onClick={() => setShowCarrito(s => !s)}>
          {showCarrito ? 'Ocultar Carrito' : 'Ver Carrito'}
        </button>
      </div>
      {/* Panel derecho fijo para el carrito */}
      {showCarrito && (
        <aside className="alumno-carrito-panel">
          <h2>Mi Carrito (Reservados)</h2>
          <button
  onClick={() => setShowCarrito(false)}
  style={{
    position: 'absolute',
    top: 18,
    right: 22,
    background: '#fff',
    color: '#e46a1e',
    border: 'none',
    borderRadius: '50%',
    fontWeight: 900,
    fontSize: '1.1rem',
    width: 28,
    height: 28,
    cursor: 'pointer',
    boxShadow: '0 1px 4px #0003'
  }}
  aria-label="Cerrar carrito"
>
  ×
</button>
          {compras.filter(c => c.estado === 'reservado').length === 0
            ? <p>No tienes cursos reservados.</p>
            : (
              <ul>
                {compras.filter(c => c.estado === 'reservado').map(res => (
                  <li key={res.curso_id + res.horario_id} style={{marginBottom:8}}>
                    <div><strong>{res.curso_nombre || res.curso_id}</strong></div>
                    <div>Días: {(Array.isArray(res.dias) ? res.dias.join(', ') : '')}</div>

                    <div>Hora: {res.inicio_hora} - {res.fin_hora}</div>
                  </li>
                ))}
              </ul>
            )
          }
        </aside>
      )}
      <style>{`

      body, .alumno-bg {
    min-height: 100vh;
    background: linear-gradient(120deg, #1992f5d7 0%, #3fa6c5ff 100%);
    /* o prueba: background: radial-gradient(circle at 30% 40%, #f8f9fdff 0%, #6366f1 100%); */
    transition: background 0.3s;
  }
        
        .alumno-main {
          flex: 1;
          padding: 2.5rem 3rem;
        }
        .alumno-title {
          font-size: 2.3rem;
          color: #fff;
          font-weight: bold;
          margin-bottom: 2.2rem;
          text-shadow: 2px 4px 24px #0005;
        }
        .alumno-grid {
          display: flex;
          gap: 2.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .alumno-curso-card {
  background: rgba(23, 74, 214, 0.68); 
  border-radius: 16px;
  box-shadow: 0 2px 12px #0e0a0aff;
  padding: 1.7rem 1.1rem 1.2rem;
  min-width: 320px;
  max-width: 380px;
  transition: background 0.2s;
}
        .alumno-curso-nombre {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #e1e2e6ff;
        }
        .alumno-curso-desc {
          color: #e1e2e6ff;
          margin-bottom: 0.7rem;
        }
        .alumno-inscribirse-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px 13px;
          font-weight: 600;
          margin-right: 8px;
          cursor: pointer;
        }
        .alumno-reservar-btn {
          background: #f59e42;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .alumno-inscrito-btn {
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px 13px;
          font-weight: 600;
        }
        .alumno-reservado-btn {
          background: #fbbf24;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px 13px;
          font-weight: 600;
        }
        .alumno-ver-carrito-btn {
          position: fixed;
          top: 2.5rem;
          right: 2.2rem;
          background: #4f46e5;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          z-index: 9;
          box-shadow: 0 2px 12px #1c1b3850;
        }
        .alumno-carrito-panel {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 340px;
          background: #e07e22ee;
          box-shadow: -2px 0 10px #312e8140;
          padding: 2.3rem 1.6rem 1.2rem;
          z-index: 15;
          overflow-y: auto;
          min-height: 100vh;
          border-top-left-radius: 22px;
        }
        .alumno-carrito-panel h2 {
          margin-top: 0;
          margin-bottom: 1.2rem;
          font-size: 1.25rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}