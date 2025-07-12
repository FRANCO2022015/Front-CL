import { useState, useEffect } from 'react'
import Login from './components/Login'
import Hello from './Hello'
import './App.css'

function App() {
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) setUser(savedUser)
  }, [])

  const handleLogin = (username: string) => {
    localStorage.setItem('user', username)
    setUser(username)
  }

  return user
    ? <Hello name={user} />
    : <Login onLogin={handleLogin} />
}

export default App
