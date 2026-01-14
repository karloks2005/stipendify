import Button from './Button'
import InputField from './InputField'
import { useNavigate } from 'react-router-dom'

export default function RegistrationForm({ data, onChange, onSubmit, onSwitchToLogin, onGoogle }) {
  const navigate = useNavigate()

  const registerOrganisation = async (formData) => {
    // API call to register organisation
    const payload = {
      name: formData.orgName,
      email: formData.email,
      password: formData.password,
      oib: formData.oib || null,
      address: formData.address || null,
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/org/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('Organizacija uspješno registrirana')
        // navigate to /stipendije after successful registration
        navigate('/stipendije')
        return
      } else {
        console.error('Greška pri registraciji organizacije')
      }
    } catch (err) {
      console.error('Greška pri registraciji organizacije', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (data && data.role === 'organization') {
      await registerOrganisation(data)
      return
    }
    if (typeof onSubmit === 'function') onSubmit(e)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      {/* lijevi plavi panel */}
      <div className="w-1/3 bg-blue-400 text-white rounded-lg p-10 mr-12 shadow-md">
        <h1 className="text-4xl font-bold tracking-wide mb-6">STIPENDIFY</h1>
        <h3 className="uppercase mb-4">Pronađi prilike | Podrži talente</h3>
        <p className="text-sm leading-relaxed">
          Studenti uz Stipendify s lakoćom pretražuju dostupne stipendije i prate rokove bez muke. Stipendify
          organizacijama omogućuje brz i jednostavan način za objavu i upravljanje stipendijama. Povezujemo
          talentirane studente s pravim prilikama, olakšavajući im put do uspjeha.
        </p>
      </div>

      {/* desni form */}
      <div className="flex-1 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Registriraj se</h2>
            <p className="text-sm text-gray-500 mt-2">
              Već imaš račun?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin() }} className="text-blue-500">Prijavi se</a>
            </p>
          </div>
          
          {/* logo*/}
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white">Logo</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* role switch */}
          <div className="flex gap-8 mb-6">
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="role"
                value="student"
                checked={data.role === 'student'}
                onChange={onChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Student</div>
                <div className="text-sm text-gray-400">Pretražuj stipendije</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="role"
                value="organization"
                checked={data.role === 'organization'}
                onChange={onChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Organizacija</div>
                <div className="text-sm text-gray-400">Objavljuj stipendije</div>
              </div>
            </label>
          </div>

          {data.role === 'student' ? (
            <>
              <InputField label="Ime" name="firstName" value={data.firstName} onChange={onChange} placeholder="Unesite ime" />
              <InputField label="Prezime" name="lastName" value={data.lastName} onChange={onChange} placeholder="Unesite prezime" />
            </>
          ) : (
            <>
              <InputField label="Naziv organizacije" name="orgName" value={data.orgName} onChange={onChange} placeholder="Unesite naziv organizacije" />
              <InputField label="OIB" name="oib" value={data.oib || ''} onChange={onChange} placeholder="Unesite OIB" />
              <InputField label="Adresa" name="address" value={data.address || ''} onChange={onChange} placeholder="Unesite adresu organizacije" />
            </>
          )}

          <InputField label="E-mail" type="email" name="email" value={data.email} onChange={onChange} placeholder="Unesite e-mail" />
          <InputField label="Lozinka" type="password" name="password" value={data.password} onChange={onChange} placeholder="Unesite lozinku" />
          <InputField label="Potvrdi lozinku" type="password" name="confirm" value={data.confirm} onChange={onChange} placeholder="Potvrdite lozinku" />

          <div className="mt-8 flex flex-row justify-between items-center">            
            <div className="w-48">
              {/* Google should not submit the form directly */}
              <Button 
                type="button" 
                onClick={(e) => { e.preventDefault(); if (typeof onGoogle === 'function') onGoogle(); }}
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div>
            <div className="w-8" /> {/* spacer */}
            <div className="w-48">
              <Button type="submit">Registriraj se!</Button>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  )
}