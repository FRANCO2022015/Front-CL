import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Hello from './Hello';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState<string | null>(null);

  return (
    <div>
      {user ? (
        <h1>Bienvenido, {user}</h1>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;