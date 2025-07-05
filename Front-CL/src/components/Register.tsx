import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      alert('Ingrese usuario y contraseña')
      return
    }
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    alert('Registro exitoso')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fixed bg-center bg-cover bg-[url('https://images.unsplash.com/photo-1584697964154-b64b5ec9e6d1?auto=format&fit=crop&w=1740&q=80')] relative">
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="z-10 bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su contraseña"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirme su contraseña"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Registrarse
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
