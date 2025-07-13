// src/components/Instructor.tsx
import LogoutButton from './LogoutButton'

const Instructor = () => {
  const user = localStorage.getItem('user')
  return (
    <div className="p-6">
      <h1>Bienvenido Instructor, {user}</h1>
      <LogoutButton />
    </div>
  )
}

export default Instructor
