import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import InputField from '../components/InputField'
import RegistrationForm from '../components/RegistrationForm'
import { useAuth } from '../context/AuthContext'

function LoginAndRegisterPage() {
  const [mode, setMode] = useState('register') // register ili login
  const { login } = useAuth();
  const navigate = useNavigate();

  // login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [loginPending, setLoginPending] = useState(false)

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginPending) return;
    setLoginPending(true);

    const payload = new URLSearchParams();
    payload.append("username", loginData.email);
    payload.append("password", loginData.password);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/jwt/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });

      if (!response.ok) {
        console.log("Login failed");
        setLoginPending(false);
        return;
      }

      // Try parse JSON body (may contain tokens or redirect info)
      const data = await response.json().catch(() => null);

      // Await auth provider rehydration so HomePage won't race
      try {
        await login(data || {});
      } catch (err) {
        console.warn('login rehydration failed', err);
      }

      // Navigate after login is fully applied
      navigate('/stipendije');
    } catch (err) {
      console.error('Network error during login', err);
    } finally {
      setLoginPending(false);
    }
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
        const resp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/google/authorize`, {
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

  const handleRegSubmit = async (e) => {
  e.preventDefault();
  
  const payload = {
    "email": regData.email,
    "password": regData.password,
    "first_name": regData.firstName,
    "last_name": regData.lastName,
    "is_active": true,
    "is_superuser": false,
    "is_verified": false
  };

  try {
    // 1. Prvo izvrši registraciju
    const regResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!regResponse.ok) {
      const errorData = await regResponse.json();
      console.error("Registracija nije uspjela:", errorData);
      return;
    }

    console.log("Registracija uspješna, pokrećem login...");

    // 2. Automatski pokreni login proces
    // Koristimo URLSearchParams jer tvoj backend (FastAPI/Djoser) vjerojatno očekuje OAuth2 format
    const loginPayload = new URLSearchParams();
    loginPayload.append("username", regData.email);
    loginPayload.append("password", regData.password);

    const loginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/jwt/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: loginPayload.toString(),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      
      // 3. Ažuriraj auth context i navigiraj
      await login(data);
      navigate("/stipendije", { replace: true });
    } else {
      // Ako login ne uspije, prebaci ga na login ekran da pokuša ručno
      setMode('login');
    }
  } catch (err) {
    console.error("Greška tijekom procesa registracije/prijave:", err);
  }
};

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

            <Button type="submit" onClick={handleLoginSubmit} disabled={loginPending}>{loginPending ? 'Prijavljivanje...' : 'Prijavi se!'}</Button>
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
