import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

type Props = {
  onLogin: (username: string) => void;
};

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('alumno');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      try {
        const response = await api.post('/usuario/login', {
          tenant_id: 'udemy',
          dni: username,
          rol: rol,
          password: password,
        });

        // El backend devuelve el token dentro de response.data.body (string JSON)
        let statusCode = response.data.statusCode;
        let body = response.data.body;

        // Si body es string, parsea; si ya es objeto, úsalo directo
        let parsedBody: any;
        if (typeof body === 'string') {
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = {};
          }
        } else {
          parsedBody = body;
        }

        if (statusCode === 200 && parsedBody.token) {
          localStorage.setItem('token', parsedBody.token);
          api.defaults.headers.common['Authorization'] = parsedBody.token;
          onLogin(username);
          navigate('/dashboard');
        } else {
          alert(parsedBody.error || 'Usuario o contraseña incorrectos');
        }
      } catch (error: any) {
        // Muestra el error real si existe
        if (error.response && error.response.data) {
          let errMsg = error.response.data.error || JSON.stringify(error.response.data);
          alert('Error: ' + errMsg);
        } else {
          alert('Error de conexión con el servidor');
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert('Ingrese usuario y contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fixed bg-center bg-cover bg-[url('https://images.unsplash.com/photo-1584697964154-b64b5ec9e6d1?auto=format&fit=crop&w=1740&q=80')] relative">
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="z-10 bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Inicio de Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su usuario"
              disabled={loading}
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
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          ¿Eres nuevo?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 hover:underline"
            disabled={loading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;