// src/components/Register.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register: React.FC = () => {
  const [dni, setDni] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('alumno')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(
        'https://9fea0kjoe5.execute-api.us-east-1.amazonaws.com/dev/usuario/crear',
        {
          tenant_id: 'udemy',
          dni,
          full_name: fullName,
          password,
          rol
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (data.dni) {
        alert('Usuario registrado correctamente')
        navigate('/')
      } else {
        alert(data.error || 'Error desconocido')
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fixed bg-center bg-cover bg-[url('https://images.unsplash.com/photo-1584697964154-b64b5ec9e6d1?auto=format&fit=crop&w=1740&q=80')] relative">
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="z-10 bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Registro</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">DNI</label>
            <input
              type="text"
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="DNI"
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
            disabled={loading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
