import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
// Cambia el import de Register a import por defecto

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLogin={() => {}} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);