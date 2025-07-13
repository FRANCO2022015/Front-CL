import { useNavigate } from 'react-router-dom'

export function useApi() {
  const navigate = useNavigate()

  async function apiFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken')
    const orgId = localStorage.getItem('orgId') || ''
    // Por defecto agrega el Authorization
    const headers = {
      ...(options.headers || {}),
      Authorization: token || '',
      'Content-Type': 'application/json',
    }
    const opts = { ...options, headers }

    const res = await fetch(url, opts)

    if (res.status === 401 || res.status === 403) {
      // Logout automático
      localStorage.clear()
      navigate('/login')
      return null
    }

    // Intenta siempre retornar JSON parseado
    let data
    try {
      data = await res.json()
    } catch {
      data = null
    }
    return data
  }

  return { apiFetch }
}
