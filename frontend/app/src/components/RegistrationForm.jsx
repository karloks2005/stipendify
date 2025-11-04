import Button from './Button'
import InputField from './InputField'

export default function RegistrationForm({ data, onChange, onSubmit, onSwitchToLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      {/* lijevi plavi panel */}
      <div className="w-1/3 bg-blue-400 text-white rounded-lg p-10 mr-12 shadow-md">
        <h1 className="text-4xl font-bold tracking-wide mb-6">STIPENDIFY</h1>
        <h3 className="uppercase mb-4">Pronađi prilike.<br />Podrži talente.</h3>
        <p className="text-sm leading-relaxed">
          Studenti uz Stipendify pretražuju relevantne stipendije, spremaju favorite i prate rokove bez buke. 
          Organizacijama nudi brz unos natječaja, vidljivost prema pravim kandidatima, upravljanje prijavama 
          i preglednu analitiku — sve na jednom mjestu.
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

        <form onSubmit={onSubmit}>
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
            <InputField label="Naziv organizacije" name="orgName" value={data.orgName} onChange={onChange} placeholder="Unesite naziv organizacije" />
          )}

          <InputField label="E-mail" type="email" name="email" value={data.email} onChange={onChange} placeholder="Unesite e-mail" />
          <InputField label="Lozinka" type="password" name="password" value={data.password} onChange={onChange} placeholder="Unesite lozinku" />
          <InputField label="Potvrdi lozinku" type="password" name="confirm" value={data.confirm} onChange={onChange} placeholder="Potvrdite lozinku" />

          <div className="mt-8 flex flex-row justify-end">
            <div className="w-48">
              {/* Google should not submit the form directly */}
              <Button type="button" onClick={(e) => { e.preventDefault(); if (typeof onGoogle === 'function') onGoogle(); }}>Sign in with Google</Button>
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