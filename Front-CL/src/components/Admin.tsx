// src/components/Admin.tsx
import LogoutButton from './LogoutButton'

const Admin = () => {
  const user = localStorage.getItem('user')
  return (
    <div className="p-6">
      <h1>Bienvenido Administrador, {user}</h1>
      <LogoutButton />
    </div>
  )
}

export default Admin
