import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScholarshipCard from '../components/ScholarshipCard'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { accessToken, initializing, logout } = useAuth()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Wait for auth rehydration to finish before deciding whether to fetch or redirect
    if (initializing) return;

    // Fetch data from your backend API
    if (!accessToken) {
      setLoading(false)
      setError('User not logged in. Please log in to access this page.')
      setTimeout(() => { window.location.href = '/' }, 2000); // Redirect to login after 2 seconds
      return
    }

    const fetchScholarships = async () => {
      try {
        const headers = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const response = await fetch('https://stipendify-backend.tk0.eu/scholarships/', {
          method: 'GET',
          credentials: 'include',
          headers,
        }) // adjust to your backend URL
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships')
        }
        const data = await response.json()
        setScholarships(data)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchScholarships()
  }, [initializing, accessToken])

  if (loading) return <div className="p-6">Loading scholarships...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between">
          <div>
            <h1 className="text-5xl font-bold text-blue-400">Stipendify</h1>
            <p className="text-md text-gray-600 font-bold mt-1">
              {
                ///Provjeravaj ako u user data ima first_name, ako nema returnaj "a"
                user?.first_name ? `Bok, ${user.first_name}! Pronađi stipendiju s lakoćom!` : 'Pronađi stipendiju s lakoćom!'
              }
              
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-white text-md font-semibold bg-blue-400 rounded-md shadow-md hover:shadow-lg shadow-gray-300 hover:scale-105 duration-150"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left area: cards */}
          <div className="lg:col-span-2 space-y-4">
            {scholarships.length > 0 ? (
              scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))
            ) : (
              <p>No scholarships found.</p>
            )}
          </div>

          {/* Right area */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="h-full min-h-[150px] rounded-lg border-2 border-dashed border-gray-200 bg-white/50 flex items-center justify-center text-gray-400">
              Calendar and mail notifications (coming soon)
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default HomePage
