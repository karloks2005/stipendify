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
  const [organisationScholarships, setOrgScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { accessToken, initializing, logout, user } = useAuth()
  const navigate = useNavigate()
  const [showFilter, setShowFilter] = useState(false)
  const [originalScholarships, setOriginalScholarships] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(null)
  const [dashboardDate, setDashboardDate] = useState(new Date())
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingScholarship, setEditingScholarship] = useState(null)

  const [reminders, setReminders] = useState([])

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/email-reminders`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('Neuspješno dohvaćanje podsjetnika')
      const remindersData = await response.json()

      const enrichedReminders = await Promise.all(
        remindersData.map(async (rem) => {
          const scholarship = await fetchScholarshipById(rem.scholarship_id)
          return {
            ...rem,
            scholarshipName : scholarship.name
          }
        })
      )

      setReminders(enrichedReminders)
    } catch (err) {
      console.error("Greška kod podsjetnika:", err)
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
      const reversed = data.reverse()
      setScholarships(reversed)
      setOriginalScholarships(reversed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrgScholarships = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/org/scholarships/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('Neuspješno dohvaćanje organizacijskih stipendija')
      const data = await response.json()
      setOrgScholarships(data.reverse())
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
      setError('Korisnik nije prijavljen. Preusmjevanje...');
      setTimeout(() => { navigate('/') }, 2000);
      return;
    }
    
    if (user && user.is_superuser === true) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    fetchScholarships()
    fetchReminders()
    
    if (user && user.organisation_id != null) {
      fetchOrgScholarships()
    }
    
    console.log(user)
  }, [initializing, accessToken, navigate, user])

  const isOrganization = Boolean(user && user.organisation_id != null)

  const stripDiacritics = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const norm = (v) => stripDiacritics(v).toLowerCase().trim()

  const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const scholarshipText = (s) => {
    const parts = [
      s?.name,
      s?.title,
      s?.description,
      s?.field_of_study,
      s?.type_of_study,
      s?.organisation?.address,
      s?.organisation_address,
      s?.url
    ].filter(Boolean)
    return norm(parts.join(' '))
  }

  const normalizeSesValue = (v) => {
    const s = norm(v)
    if (s.startsWith('niz') || s.startsWith('nis')) return 'nizak'
    if (s.startsWith('sre')) return 'srednji'
    if (s.startsWith('vis')) return 'visok'
    return s
  }

  const normalizeSportsValue = (v) => {
    const s = norm(v)
    if (s.includes('vrhun')) return 'vrhunski'
    if (s.includes('kateg')) return 'kategorizirani'
    if (s.includes('amat')) return 'amaterski'
    if (s.includes('nista') || s.includes('ništa')) return 'nista'
    return s
  }

  const matchesTypeOfStudy = (schType, selectedType) => {
    const st = norm(schType)
    const want = norm(selectedType)
    if (!want) return true
    if (!st) return true
    if (want.includes('preddiplomski')) return st.includes('preddiplomski') || st.includes('prijediplomski') || st.includes('prijediplom')
    if (want.includes('diplomski')) return st.includes('diplomski')
    if (want.includes('integrirani')) return st.includes('integrirani')
    if (want.includes('poslijediplomski')) return st.includes('poslijediplomski')
    return st.includes(want)
  }

  const baseCities = [
    'zagreb','split','rijeka','osijek','zadar','slavonski brod','pula','karlovac',
    'varazdin','sibenik','sisak','velika gorica','vinkovci','vukovar','dubrovnik',
    'bjelovar','koprivnica','pozega','cakovec','trogir'
  ]

  const cityList = () => {
    const fromData = (originalScholarships || []).flatMap(s => {
      const t = scholarshipText(s)
      return baseCities.filter(c => new RegExp(`\\b${escapeRegExp(c)}\\w*\\b`, 'i').test(t))
    })
    return Array.from(new Set([...baseCities, ...fromData])).filter(Boolean)
  }

  const cityRegex = (city) => new RegExp(`\\b${escapeRegExp(norm(city))}\\w*\\b`, 'i')

  const cityStatus = (text, selectedCity, cities) => {
    const sel = norm(selectedCity)
    if (!sel) return 'none'

    const selRe = cityRegex(sel)
    const matchesSelected = selRe.test(text) || new RegExp(`\\bgrad\\s+${escapeRegExp(sel)}\\w*\\b`, 'i').test(text) || text.includes(`${sel}.hr`)
    if (matchesSelected) return 'selected'

    const other = (cities || []).some(c => {
      const cc = norm(c)
      if (!cc || cc === sel) return false
      return cityRegex(cc).test(text) || text.includes(`${cc}.hr`)
    })
    if (other) return 'other'

    return 'unbound'
  }

  const detectSesInText = (t) => {
    const x = t || ''
    if (x.includes('nizak') || x.includes('niska')) return 'nizak'
    if (x.includes('srednji') || x.includes('srednja')) return 'srednji'
    if (x.includes('visok') || x.includes('visoka')) return 'visok'
    return null
  }

  const detectSportsInText = (t) => {
    const x = t || ''
    if (x.includes('vrhunski')) return 'vrhunski'
    if (x.includes('kategoriz')) return 'kategorizirani'
    if (x.includes('amatersk') || x.includes('amater')) return 'amaterski'
    return null
  }

  const hasMinorityInText = (t) => (t || '').includes('manjin')

  const hasDisabilityInText = (t) => {
    const x = t || ''
    return x.includes('invaliditet') || x.includes('posebne potrebe')
  }

  const passesFilters = (s, criteria, cities) => {
    const t = scholarshipText(s)

    const prosjek = criteria?.prosjek !== '' && criteria?.prosjek != null ? parseFloat(criteria.prosjek) : NaN
    if (!Number.isNaN(prosjek) && s?.min_grade_average != null) {
      const minG = parseFloat(s.min_grade_average)
      if (!Number.isNaN(minG) && prosjek < minG) return false
    }

    const godina = criteria?.godinaStudija !== '' && criteria?.godinaStudija != null ? parseInt(criteria.godinaStudija, 10) : NaN
    if (!Number.isNaN(godina) && s?.min_year_of_study != null) {
      const minY = parseInt(s.min_year_of_study, 10)
      if (!Number.isNaN(minY) && godina < minY) return false
    }

    if (criteria?.podrucjeStudiranja) {
      const want = norm(criteria.podrucjeStudiranja)
      if (s?.field_of_study) {
        if (!norm(s.field_of_study).includes(want)) return false
      }
    }

    if (criteria?.vrstaStudija) {
      if (s?.type_of_study) {
        if (!matchesTypeOfStudy(s.type_of_study, criteria.vrstaStudija)) return false
      }
    }

    if (criteria?.socioEkonStatus) {
      const wanted = normalizeSesValue(criteria.socioEkonStatus)
      const ses = detectSesInText(t)
      if (ses && ses !== wanted) return false
    }

    if (criteria?.kategorijaSportasa) {
      const wanted = normalizeSportsValue(criteria.kategorijaSportasa)
      const sp = detectSportsInText(t)
      if (wanted === 'nista') {
        if (sp) return false
      } else {
        if (sp && sp !== wanted) return false
      }
    }

    if (criteria?.nacionalnaManjina) {
      const wanted = norm(criteria.nacionalnaManjina)
      const has = hasMinorityInText(t)
      if (wanted === 'da' && !has) return false
      if (wanted === 'ne' && has) return false
    }

    if (Array.isArray(criteria?.zdravstveniStatus)) {
      const wantsDis = criteria.zdravstveniStatus.includes('student') || criteria.zdravstveniStatus.includes('clan')
      const hasDis = hasDisabilityInText(t)
      if (wantsDis && !hasDis) return false
      if (!wantsDis && criteria.zdravstveniStatus.length === 0 && hasDis) return false
    }

    if (criteria?.grad) {
      const st = cityStatus(t, criteria.grad, cities)
      if (st === 'other') return false
    }

    return true
  }

  const matchCount = (s, criteria, cities) => {
    const t = scholarshipText(s)
    let cnt = 0

    if (criteria?.grad) {
      if (cityStatus(t, criteria.grad, cities) === 'selected') cnt += 1
    }

    if (criteria?.podrucjeStudiranja) {
      const want = norm(criteria.podrucjeStudiranja)
      if (s?.field_of_study && norm(s.field_of_study).includes(want)) cnt += 1
    }

    if (criteria?.vrstaStudija) {
      if (s?.type_of_study && matchesTypeOfStudy(s.type_of_study, criteria.vrstaStudija)) cnt += 1
    }

    if (criteria?.socioEkonStatus) {
      const wanted = normalizeSesValue(criteria.socioEkonStatus)
      const ses = detectSesInText(t)
      if (ses && ses === wanted) cnt += 1
    }

    if (criteria?.kategorijaSportasa) {
      const wanted = normalizeSportsValue(criteria.kategorijaSportasa)
      const sp = detectSportsInText(t)
      if (wanted === 'nista') {
        if (!sp) cnt += 1
      } else if (sp && sp === wanted) {
        cnt += 1
      }
    }

    if (criteria?.nacionalnaManjina) {
      const wanted = norm(criteria.nacionalnaManjina)
      const has = hasMinorityInText(t)
      if (wanted === 'da' && has) cnt += 1
      if (wanted === 'ne' && !has) cnt += 1
    }

    const prosjek = criteria?.prosjek !== '' && criteria?.prosjek != null ? parseFloat(criteria.prosjek) : NaN
    if (!Number.isNaN(prosjek)) {
      const minG = s?.min_grade_average != null ? parseFloat(s.min_grade_average) : NaN
      if (Number.isNaN(minG) || prosjek >= minG) cnt += 1
    }

    const godina = criteria?.godinaStudija !== '' && criteria?.godinaStudija != null ? parseInt(criteria.godinaStudija, 10) : NaN
    if (!Number.isNaN(godina)) {
      const minY = s?.min_year_of_study != null ? parseInt(s.min_year_of_study, 10) : NaN
      if (Number.isNaN(minY) || godina >= minY) cnt += 1
    }

    return cnt
  }

  const applyFilter = (criteria) => {
    if (!criteria) return

    const cities = cityList()
    const filtered = originalScholarships.filter(s => passesFilters(s, criteria, cities))

    const ranked = filtered.map((s, idx) => {
      const t = scholarshipText(s)
      const st = criteria?.grad ? cityStatus(t, criteria.grad, cities) : 'none'
      const cityRank = st === 'selected' ? 2 : (st === 'unbound' ? 1 : 0)
      const cnt = matchCount(s, criteria, cities)
      return { s, idx, cityRank, cnt }
    })

    ranked.sort((a, b) => {
      if (b.cityRank !== a.cityRank) return b.cityRank - a.cityRank
      if (b.cnt !== a.cnt) return b.cnt - a.cnt
      return a.idx - b.idx
    })

    setScholarships(ranked.map(x => x.s))
    setActiveFilter(criteria)
    setShowFilter(false)
  }

  const resetFilter = () => {
    setScholarships(originalScholarships)
    setActiveFilter(null)
  }

  const getAvailableCities = () => {
    const cities = cityList().map(c => c.charAt(0).toUpperCase() + c.slice(1))
    return Array.from(new Set(cities))
  }

  const handleReminderClick = (scholarshipId, scholarshipData = null) => {
    if (scholarshipData) {
      setEditingScholarship(scholarshipData)
    } else {
      setSelectedScholarshipId(scholarshipId)
    }
  }
  const handleReminderClose = () => setSelectedScholarshipId(null)

  const handleDeleteReminder = (reminderId) => {
    console.log('Brisanje podsjetnika s ID-jem:', reminderId)
    const payload = {
      "id": reminderId
    };

    fetch(`${process.env.REACT_APP_BACKEND_URL}/email-reminders`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then((resp) => {
      if (!resp.ok) throw new Error('Neuspješno brisanje podsjetnika')
      setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    })
    .catch((err) => {
      console.error('Greška kod brisanja podsjetnika:', err)
    })
  }

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
            {!isOrganization && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilter(true)} className="px-4 py-2.5 text-white font-bold bg-blue-400 rounded-xl shadow-md hover:bg-blue-500 transition-all active:scale-95">Filtriraj</button>
                {activeFilter && (
                  <button onClick={resetFilter} className="px-3 py-2.5 text-gray-700 font-medium bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 transition-all">Očisti filter</button>
                )}
              </div>
            )}
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
          
          <aside className="order-1 lg:order-2 flex flex-col gap-6 lg:h-full lg:overflow-hidden lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 shrink-0">
              <Calendar selectedDate={dashboardDate} onDateSelect={setDashboardDate} reminders={reminders} />
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
                        onClick={() => handleDeleteReminder(rem.id)}
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

          <section className="order-2 lg:order-1 lg:col-span-2 lg:overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
            {isOrganization ? (
              <>
                <h3 className="font-bold text-gray-900 text-xl">Moje stipendije</h3>
                {organisationScholarships.length > 0 ? (
                  organisationScholarships.map((s) => (
                    <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} onUpdated={() => { fetchScholarships(); fetchOrgScholarships(); }} isUserScholarship={true} />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    Još niste kreirali nijednu stipendiju.
                  </div>
                )}

                <h3 className="font-bold text-gray-900 text-xl mt-6">Sve stipendije</h3>
                {scholarships
                  .filter(s => !organisationScholarships.some(org => org.id === s.id))
                  .map((s) => (
                    <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} onUpdated={() => { fetchScholarships(); fetchOrgScholarships(); }} isUserScholarship={false} />
                  ))
                }
              </>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 text-xl lg:hidden mb-2">Dostupne Stipendije</h3>
                {scholarships.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} onReminderClick={handleReminderClick} onUpdated={() => fetchScholarships()} isUserScholarship={false} />
                ))}
              </>
            )}
          </section>

        </div>
      </main>

      <AnimatePresence>
        {showFilter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="w-full max-w-4xl">
              <ScholarshipFilterForm onClose={() => setShowFilter(false)} onApply={applyFilter} onCalculateClick={() => {}} availableCities={getAvailableCities()} />
            </motion.div>
          </motion.div>
        )}
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
        {editingScholarship && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="w-full max-w-4xl">
              <ScholarshipPostForm scholarship={editingScholarship} onClose={() => setEditingScholarship(null)} onCreated={async () => { await fetchScholarships(); await fetchOrgScholarships(); }} />
            </motion.div>
          </motion.div>
        )}
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="w-full max-w-4xl">
              <ScholarshipPostForm onClose={() => setShowPostForm(false)} onCreated={async () => { await fetchScholarships(); await fetchOrgScholarships(); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage
