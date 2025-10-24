import { useState } from 'react'
import './App.css'
import Button from './components/Button'
import InputField from './components/InputField'
import RegistrationForm from './components/RegistrationForm'

function App() {
  const [mode, setMode] = useState('register') // register ili login

  // login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // registration state
  const [regData, setRegData] = useState({
    role: 'student', // student je default
    firstName: '',
    lastName: '',
    orgName: '',
    email: '',
    password: '',
    confirm: ''
  })

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegChange = (e) => {
    const { name, value } = e.target
    setRegData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    console.log('LOGIN submit:', loginData) //poslat na backend nekako
  }

  const handleRegSubmit = (e) => {
    e.preventDefault()
    console.log('REGISTER submit:', regData) //isto, poslat na backend
  }

  // login view
  if (mode === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white w-[360px] max-w-full rounded-lg shadow-xl relative flex items-center justify-center">
          <form onSubmit={handleLoginSubmit} className="p-8 w-full">
            <h2 className="text-2xl font-bold mb-1">Prijavi se</h2>
            <p className="text-sm text-gray-500 mb-6 text-left">
              Nemaš račun?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setMode('register') }}
                className="text-blue-500"
              >
                Registriraj se
              </a>
            </p>

            <InputField
              label="Email"
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              placeholder="Unesite email"
            />

            <InputField
              label="Lozinka"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Unesite lozinku"
            />

            <Button type="submit">Prijavi se!</Button>
          </form>
        </div>
      </div>
    )
  }

  // register view
  return (
    <RegistrationForm
      data={regData}
      onChange={handleRegChange}
      onSubmit={handleRegSubmit}
      onSwitchToLogin={() => setMode('login')}
    />
  )
}

export default App