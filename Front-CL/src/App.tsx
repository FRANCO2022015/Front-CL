import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import InstructorDashboard from './components/InstructorDashboard'
import CrearCurso from './components/CrearCurso'
import CrearHorario from './components/CrearHorario'
import VerAlumnos from './components/VerAlumnos'

export default function App() {
  const handleLogin = (_u: string, _r: string) => {}
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/crear-curso" element={<CrearCurso />} />
        <Route path="/instructor/:cursoId/crear-horario" element={<CrearHorario />} />
        <Route path="/instructor/:cursoId/alumnos" element={<VerAlumnos />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
