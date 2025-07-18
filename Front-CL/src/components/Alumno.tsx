import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LogoutButton from './LogoutButton'

const CURSO_URL = import.meta.env.VITE_API_CURSO_URL
const HORARIO_URL = import.meta.env.VITE_API_HORARIO_URL
const COMPRA_URL = import.meta.env.VITE_API_COMPRA_URL
const LIMIT = 2
const ELASTIC_URL  = 'http://100.28.245.90:9200/cursos/_search'
const PAGE_SIZE = 5

type Curso = {
  curso_id: string
  nombre: string
  descripcion: string
  inicio: string
  fin: string
  precio: number
  instructor_dni?: string
  [k: string]: any
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
  const [showCarrito, setShowCarrito] = useState(false)
  const [showMisCompras, setShowMisCompras] = useState(false)
  const [prevPaginas, setPrevPaginas] = useState<string[]>([])
  const [isLastPage, setIsLastPage] = useState(false)
  const [allCursos, setAllCursos] = useState<Curso[]>([])
  const [allHorarios, setAllHorarios] = useState<Record<string, Horario[]>>({})
  const [reservados, setReservados] = useState<Compra[]>([])
  const [inscritos, setInscritos] = useState<Compra[]>([])
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null)
  const [error,     setError    ] = useState<string|null>(null)

  // Estados de búsqueda
  const [busqueda,  setBusqueda ] = useState<string>('')
  const [minPrecio, setMinPrecio] = useState<string>('')
  const [maxPrecio, setMaxPrecio] = useState<string>('')
  const [desde,     setDesde    ] = useState<string>('')
  const [hasta,     setHasta    ] = useState<string>('')

  // IDs y paginación
  const [cursoIds,   setCursoIds ] = useState<string[]>([])
  const [page,       setPage     ] = useState<number>(0)
  const orgId = localStorage.getItem('orgId') || ''
  const alumnoDni = localStorage.getItem('user') || ''
  const alumnoToken = localStorage.getItem('authToken') || ''
  const navigate = useNavigate()

  // Precios
  const getPrecio = (curso_id: string) => {
    const curso = cursos.find(c => c.curso_id === curso_id)
    return curso?.precio ?? 0
  }
  const buscarEnElastic = async () => {
    setLoading(true)
    setError(null)
    setPage(0)
    setCursoIds([])
    try {
      const must: any[] = []
      if (busqueda.trim()) must.push({ bool:{ should:[
        { match:{ 'descripcion.fuzzy':   { query: busqueda, fuzziness:'AUTO' } } },
        { match_phrase_prefix:{ 'descripcion.prefix':{ query: busqueda } } },
        { match:{ nombre:{ query: busqueda, fuzziness:'AUTO' } } }
      ]}})
      if (minPrecio||maxPrecio) {
        const range: any = {}
        if (minPrecio) range.gte = parseFloat(minPrecio)
        if (maxPrecio) range.lte = parseFloat(maxPrecio)
        must.push({ range:{ precio: range } })
      }
      if (desde||hasta) {
        const range: any = {}
        if (desde) range.gte = desde
        if (hasta) range.lte = hasta
        must.push({ range:{ inicio: range } })
      }

      const query = { query:{ bool:{ must } }, _source:['curso_id'], size:100 }
      const res = await fetch(ELASTIC_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(query) })
      const data = await res.json()
      const ids = (data.hits?.hits||[])
        .map((h:any)=>h._source?.curso_id)
        .filter(Boolean)
      setCursoIds(ids)
    } catch(e) {
      console.error(e)
      setError('Error al conectar con Elasticsearch.')
    } finally {
      setLoading(false)
    }
  }
  // Obtiene detalles de cursos por página de IDs
  const fetchCursosPorPagina = async (ids: string[]) => {
    setLoading(true)
    try {
      const results: Curso[] = []
      for (const id of ids) {
        const res = await fetch(`${CURSO_URL}/buscar?tenant_id=${orgId}&curso_id=${id}`, { headers:{ Authorization:alumnoToken } })
        const js  = await res.json()
        const curso = typeof js.body==='string'? JSON.parse(js.body) : js.body
        if (curso?.nombre) results.push(curso)
      }
      setCursos(results)
      // Carga horarios para esta página
      const mapHor: Record<string,Horario[]> = {}
      await Promise.all(results.map(async c=>{
        const resp = await fetch(`${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`, { headers:{Authorization:alumnoToken} })
        const json = await resp.json()
        const body = typeof json.body==='string'? JSON.parse(json.body): json.body
        mapHor[c.curso_id] = body.horarios||[]
      }))
      setHorarios(mapHor)
    } catch(e) {
      console.error(e)
      setError('Error al obtener los cursos.')
    } finally {
      setLoading(false)
    }
  }

  // Cada vez que cambian los IDs o la página
  useEffect(() => {
    const sliceIds = cursoIds.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE)
    if (sliceIds.length) fetchCursosPorPagina(sliceIds)
    else setCursos([])
  }, [cursoIds, page])

  // Búsqueda inicial al montar
  useEffect(() => { buscarEnElastic() }, [])


  // Trae cursos paginados
  const fetchCursos = (lastCursoIdParam?: string) => {
    setCursos([])
    let url = `${CURSO_URL}/listar?tenant_id=${orgId}&limit=${LIMIT}`
    if (lastCursoIdParam) url += `&lastCursoId=${lastCursoIdParam}`

    fetch(url, { headers: { Authorization: alumnoToken } })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setCursos(b.cursos || [])
        setIsLastPage((b.cursos || []).length < LIMIT)
        // Horarios SOLO para los cursos actuales en pantalla
        Promise.all(
          (b.cursos || []).map((c: Curso) =>
            fetch(`${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`, {
              headers: { Authorization: alumnoToken }
            })
              .then(r => r.json())
              .then(d => {
                const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
                return [c.curso_id, b.horarios || []] as [string, Horario[]]
              })
          )
        ).then(all => setHorarios(Object.fromEntries(all)))
      })
  }

  useEffect(() => {
    fetchCursos()
    setPrevPaginas([])
  }, [orgId])

  // Para carrito (busca todos los cursos y horarios)
  useEffect(() => {
    fetch(`${CURSO_URL}/listar?tenant_id=${orgId}&limit=1000`, {
      headers: { Authorization: alumnoToken }
    })
      .then(r => r.json())
      .then(d => {
        const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
        setAllCursos(b.cursos || [])
        Promise.all(
          (b.cursos || []).map((c: Curso) =>
            fetch(`${HORARIO_URL}/listar?tenant_id=${orgId}&curso_id=${c.curso_id}`, {
              headers: { Authorization: alumnoToken }
            })
              .then(r => r.json())
              .then(d => {
                const b = typeof d.body === 'string' ? JSON.parse(d.body) : d.body
                return [c.curso_id, b.horarios || []] as [string, Horario[]]
              })
          )
        ).then(all => setAllHorarios(Object.fromEntries(all)))
      })
  }, [orgId])

  // Estado de cada horario (reservado/inscrito/libre)
  const getEstado = (curso_id: string, horario_id: string) => {
    const comp = compras.find(c => c.curso_id === curso_id && c.horario_id === horario_id)
    return comp ? comp.estado : null
  }

  // Carrito y compras
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

  // Paginado
  const nextPage = () => {
    if (!isLastPage && cursos.length > 0) {
      const lastId = cursos[cursos.length - 1].curso_id
      setPrevPaginas(prev => [...prev, lastId])
      fetchCursos(lastId)
    }
  }
  const backPage = () => {
    if (prevPaginas.length === 0) return
    const prevLastCursoId = prevPaginas[prevPaginas.length - 2] || ''
    setPrevPaginas(prev => prev.slice(0, -1))
    fetchCursos(prevLastCursoId)
  }

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

  // Suma precios de los cursos reservados
  const totalReservado = reservados.reduce(
    (sum, c) => {
      const curso = allCursos.find(cur => cur.curso_id === c.curso_id)
      return sum + (curso?.precio ?? 0)
    }, 0
  )

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
       {/* BARRA DE BÚSQUEDA */}
      <div style={{ background:'#f5f5f5', padding:16, borderBottom:'1px solid #ccc' }}>
        <h2>Búsqueda de Cursos</h2>
        <div style={{ display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
          <input placeholder="Descripción o nombre" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <input type="number" placeholder="Precio mínimo" value={minPrecio} onChange={e=>setMinPrecio(e.target.value)} />
          <input type="number" placeholder="Precio máximo" value={maxPrecio} onChange={e=>setMaxPrecio(e.target.value)} />
          <input type="date" placeholder="Desde" value={desde} onChange={e=>setDesde(e.target.value)} />
          <input type="date" placeholder="Hasta" value={hasta} onChange={e=>setHasta(e.target.value)} />
        </div>
        <button onClick={buscarEnElastic} disabled={loading} style={{ marginTop:10 }}>
          {loading?'Buscando...':'Buscar'}
        </button>
        {error && <div style={{ color:'red', marginTop:8 }}>{error}</div>}
      </div>
        
    
  
      <div style={{ flex: 1, padding: '24px' }}>
        <LogoutButton />
        <h1>Catálogo de Cursos</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={backPage} disabled={prevPaginas.length === 0}>Anterior</button>
          <button onClick={nextPage} disabled={isLastPage}>Siguiente</button>
        </div>
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
                boxShadow: '0 2px 8px #0002',
                minWidth: 340,
                cursor: 'pointer',
                position: 'relative'
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
                  const curso = allCursos.find(cur => cur.curso_id === c.curso_id)
                  const horario = (allHorarios[c.curso_id] || []).find(h => h.horario_id === c.horario_id)
                  return (
                    <li key={c.curso_id + c.horario_id} style={{ marginBottom: 14 }}>
                      <b>{curso?.nombre || '-'}</b><br />
                      {horario?.dias?.join(', ')} {horario?.inicio_hora}-{horario?.fin_hora}
                      <br />
                      <b>Precio:</b> {curso ? <>S/ {curso.precio}</> : <span style={{ color: '#ffb' }}>No disponible</span>}
                      <br />
                      {(curso && horario) &&
                        <button
                          style={{
                            marginTop: 6,
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: loading ? 'not-allowed' : 'pointer'
                          }}
                          disabled={loading}
                          onClick={() => inscribirse(curso, horario)}
                        >Inscribirse</button>
                      }
                    </li>
                  )
                })}
              </ul>
              <div style={{ marginTop: 10, fontWeight: 600 }}>
                Total: <span style={{ color: '#fff' }}>S/ {Number(totalReservado).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button
                onClick={inscribirTodosReservados}
                disabled={loading}
                style={{
                  marginTop: 16, background: '#22b14c', color: 'white',
                  border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700,
                  fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer'
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
                const curso = allCursos.find(cur => cur.curso_id === c.curso_id)
                const horario = (allHorarios[c.curso_id] || []).find(h => h.horario_id === c.horario_id)
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
