// src/components/LogoutButton.tsx
import { useNavigate } from 'react-router-dom'

const USER_URL = import.meta.env.VITE_API_USER_URL


const LogoutButton = () => {
  const navigate = useNavigate()

  const logout = () => {
    const token = localStorage.getItem('authToken')
    const tenant_id = localStorage.getItem('orgId') || 'udemy'

    fetch(`${USER_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id, token })
    }).catch(console.error)

    localStorage.clear()
    navigate('/login')
  }

  return (
    <button
      onClick={logout}
      className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Cerrar sesión
    </button>
  )
}

export default LogoutButton
