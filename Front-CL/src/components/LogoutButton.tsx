// src/components/LogoutButton.tsx
import { useNavigate } from 'react-router-dom'

const LogoutButton = () => {
  const navigate = useNavigate()

  const logout = () => {
    const token = localStorage.getItem('token')
    const tenant_id = 'udemy'

    fetch('https://os8e4l68fh.execute-api.us-east-1.amazonaws.com/dev/usuario/logout', {
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
