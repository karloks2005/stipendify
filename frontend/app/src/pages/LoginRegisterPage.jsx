import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InputField from '../components/InputField'
import RegistrationForm from '../components/RegistrationForm'
import { useAuth } from '../context/AuthContext'

function LoginAndRegisterPage() {
  const [mode, setMode] = useState('register') // register ili login
  const { login, user } = useAuth();
  const navigate = useNavigate();

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

  const handleLoginSubmit = (e) => {
  e.preventDefault();

  const payload = new URLSearchParams();
  payload.append("username", loginData.email);
  payload.append("password", loginData.password);

  fetch("http://localhost:8888/auth/jwt/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  }).then((response) => {
    // Successful login
    if (response.ok) {
      response.json().then((data) => {
        // after successful fetch and login(context)
        login(data);             // set context
        navigate('/', { replace:true }); // SPA navigation
      });
    } else {
      console.log("Login failed");
    }
  });
};


  const handleRegChange = (e) => {
    const { name, value } = e.target
    setRegData(prev => ({ ...prev, [name]: value }))
  }

  const handleGoogleLogin = (e) => {
    e?.preventDefault?.();
    // Fetch the authorization link from the backend, then navigate the browser to it.
    // Backend may expose an endpoint that returns JSON { authorization_url: '...' }
    // or similar. If that fails we fall back to navigating directly to the oauth route.
    (async () => {
      try {
        const resp = await fetch('http://localhost:8888/auth/google/authorize', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (resp.ok) {
          // Try to parse JSON body which may contain the authorization URL
          const data = await resp.json().catch(() => null);
          const url = data?.authorization_url;
          if (url) {
            try {
              window.location.href = decodeURIComponent(url);
              console.log("Redirecting to Google OAuth...");
              return;
            } catch (err) {
              window.location.href = url;
              console.log("Redirecting to Google OAuth... Error caught but proceeding.");
              return;
            } 
          }
        }

        
      } catch (err) {
        console.error('Failed to fetch authorization url, falling back to direct redirect', err);
      }
    })();
  };

  const handleRegSubmit = (e) => {
    e.preventDefault()
    let payload = {
      "email": regData.email,
      "password": regData.password,
      "first": regData.firstName,
      "last": regData.lastName,
      "company_name": regData.orgName,
      "is_orga": regData.role === 'organization'
    }
    fetch("http://localhost:8888/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  // login view
  if (mode === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white w-[360px] max-w-full rounded-lg shadow-xl relative flex items-center justify-center">
          <form onSubmit={handleLoginSubmit}  className="p-8 w-full">
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

            <Button type="button" onClick={handleLoginSubmit}>Prijavi se!</Button>
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
      onGoogle={handleGoogleLogin}
    />
  )
}

export default LoginAndRegisterPage;