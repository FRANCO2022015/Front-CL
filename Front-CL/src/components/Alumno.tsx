// src/components/Alumno.tsx
import LogoutButton from './LogoutButton'

const Alumno = () => {
  const user = localStorage.getItem('user')
  return (
    <div className="p-6">
      <h1>Bienvenido Alumno, {user}</h1>
      <LogoutButton />
    </div>
  )
}

export default Alumno
