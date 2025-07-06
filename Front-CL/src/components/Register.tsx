import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('alumno'); // O 'admin', 'instructor'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/usuario/crear', {
        tenant_id: 'udemy',
        dni,
        full_name: fullName,
        password,
        rol,
      });
      alert('Usuario registrado correctamente');
      navigate('/'); // Redirige al login
    } catch (error: any) {
      alert('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="DNI"
              value={dni}
              onChange={e => setDni(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="alumno">Alumno</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
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
  );
};

export default Register;