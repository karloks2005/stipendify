import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ScholarshipCard from '../components/ScholarshipCard'
import ReminderForm from '../components/ReminderForm'
import Calendar from '../components/Calendar'
import { useAuth } from '../context/AuthContext'
import SocioEconomicCalculator from '../components/SocioEconomicCalculatorForm'
import ScholarshipPostForm from '../components/ScholarshipPostForm'
import ScholarshipFilterForm from '../components/ScholarshipFilterForm'

function HomePage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { accessToken, initializing, logout, user } = useAuth()
  const navigate = useNavigate()
  
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(null)
  const [dashboardDate, setDashboardDate] = useState(new Date())
  const [showPostForm, setShowPostForm] = useState(false)

  // Placeholder reminders
  const [reminders, setReminders] = useState([])

  const fetchReminders = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/email-reminders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    if (!response.ok) throw new Error('Neuspješno dohvaćanje podsjetnika')
    const remindersData = await response.json()

    // Mapiramo podsjetnike i za svaki dohvaćamo stipendiju
    const enrichedReminders = await Promise.all(
      remindersData.map(async (rem) => {
        const scholarship = await fetchScholarshipById(rem.scholarship_id)
        return {
          ...rem,
          scholarshipName : scholarship.name
          // Napomena: provjeri zove li se polje na tvom backendu 'title', 'naziv' ili sl.
        }
      })
    )

    setReminders(enrichedReminders)
  } catch (err) {
    console.error("Greška kod podsjetnika:", err)
    // Ovdje ne želimo nužno setError(err.message) jer ne želimo blokirati cijelu stranicu
    // ako samo podsjetnici zakažu.
  }
}


  const fetchScholarships = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/scholarships/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('Neuspješno dohvaćanje stipendija')
      const data = await response.json()
      setScholarships(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchScholarshipById = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/scholarships/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('Neuspješno dohvaćanje stipendije')
      const data = await response.json()
      return data
    }
    catch (err) {
      setError(err.message)
      return null
    }
  }

  useEffect(() => {
    if (initializing) return;
    if (!accessToken) {
      setLoading(false);
      setError('Korisnik nije prijavljen. Preusmjeravanje...');
      setTimeout(() => { navigate('/') }, 2000);
      return;
    }
    fetchScholarships()
    fetchReminders()
    console.log(user)
  }, [initializing, accessToken, navigate])

  const isOrganization = Boolean(user && user.organisation_id != null)

  // Placeholder for organization's own scholarships (replace with API fetch later)
  const orgScholarships = isOrganization ? [
    {
      id: 'org-placeholder-1',
      title: `Moja stipendija - ${user?.first_name || user?.email || 'Organizacija'}`,
      description: 'Ovo je placeholder stipendija koju je kreirala ova organizacija.',
      owner: user?.id || null,
    }
  ] : []

  const handleReminderClick = (scholarshipId) => setSelectedScholarshipId(scholarshipId)
  const handleReminderClose = () => setSelectedScholarshipId(null)

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-400">Učitavanje...</div>
  if (error) return <div className="flex h-screen items-center justify-center p-6 text-red-500">{error}</div>

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-gray-50 lg:overflow-hidden font-sans text-gray-900">
      
      <header className="w-full bg-white border-b border-gray-200 z-10 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-blue-400 tracking-tight">Stipendify</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {user?.first_name ? `Bok, ${user.first_name}!` : 'Dobrodošli nazad!'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isOrganization && (
              <button onClick={() => setShowPostForm(true)} className="px-5 py-2.5 text-white font-bold bg-blue-400 rounded-xl shadow-md hover:bg-blue-500 transition-all active:scale-95">Kreiraj stipendiju</button>
            )}
            <button onClick={() => { logout(); navigate('/'); }} className="px-5 py-2.5 text-white font-bold bg-black rounded-xl shadow-md hover:bg-gray-800 transition-all active:scale-95">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 lg:overflow-hidden max-w-7xl mx-auto w-full px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-10 h-full">
          
          {/* SIDEBAR: Kalendar prvi na mobitelu (order-1) */}
          <aside className="order-1 lg:order-2 flex flex-col gap-6 lg:h-full lg:overflow-hidden lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 shrink-0">
              <Calendar selectedDate={dashboardDate} onDateSelect={setDashboardDate} />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col lg:overflow-hidden lg:flex-1 min-h-[350px] lg:min-h-0">
              <h3 className="font-bold text-gray-900 mb-4 text-lg px-1">Moji Podsjetnici</h3>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {
                  reminders.map((rem) => (
                    <div key={rem.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group relative hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                      <h4 className="font-bold text-sm text-gray-800 pr-8">{rem.scholarshipName}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium italic">
                        📅 {new Date(rem.remind_at).toLocaleDateString('hr-HR')}
                      </p>
                      
                      <button 
                        // Pretpostavka funkcije za brisanje
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                        title="Obriši podsjetnik"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={1.8}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: Stipendije zadnje na mobitelu (order-2) */}
          <section className="order-2 lg:order-1 lg:col-span-2 lg:overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
            {isOrganization ? (
              <>
                <h3 className="font-bold text-gray-900 text-lg">Moje stipendije</h3>
                {orgScholarships.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} />
                ))}

                <h3 className="font-bold text-gray-900 text-xl mt-6">Sve stipendije</h3>
                {scholarships.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} />
                ))}
              </>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 text-xl lg:hidden mb-2">Dostupne Stipendije</h3>
                {scholarships.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} />
                ))}
              </>
            )}
          </section>

        </div>
      </main>

      <AnimatePresence>
        {selectedScholarshipId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
              <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <ReminderForm scholarshipId={selectedScholarshipId} onClose={handleReminderClose} onCreated={fetchReminders} />
            </motion.div>
          </motion.div>
        )}
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="w-full max-w-4xl">
              <ScholarshipPostForm onClose={() => setShowPostForm(false)} onCreated={async () => { await fetchScholarships(); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage