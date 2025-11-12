import { useState, useEffect } from 'react'
import ScholarshipCard from '../components/ScholarshipCard'

function HomePage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch data from your backend API
    const fetchScholarships = async () => {
      try {
        const response = await fetch('http://localhost:8888/scholarships') // adjust to your backend URL
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
  }, []) // empty dependency array → runs once when mounted

  if (loading) return <div className="p-6">Loading scholarships...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-5xl font-bold text-blue-400">Stipendify</h1>
          <p className="text-md text-gray-600 font-bold mt-1">
            Pronađi stipendiju s lakoćom!
          </p>
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
