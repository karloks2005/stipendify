import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminPage() {
  const [scholarships, setScholarships] = useState([])
  const [stats, setStats] = useState({
    registeredStudents: 1500,
    registeredOrgs: 60,
    activeScholarships: 160,
    pendingScholarships: 12
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { accessToken, initializing, logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (initializing) return

    if (!accessToken) {
      setLoading(false)
      setError('User not logged in. Please log in to access this page.')
      setTimeout(() => { window.location.href = '/' }, 2000)
      return
    }

    console.log('Current user is superuser:', user.is_superuser)

    if(user.is_superuser !== true) {
        setLoading(false)
        setError('Access denied. Admins only.')
        setTimeout(() => { window.location.href = '/' }, 10000)
        return
    }

    fetchStats()
    fetchPendingScholarships()
  }, [initializing, accessToken])

  const fetchStats = async () => {
    try {
        const headers = {}
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/stats`, {
          method: 'GET',
          credentials: 'include',
          headers,
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        setStats({
          registeredStudents: data.users,
          registeredOrgs: data.orgs,
          activeScholarships: data.active_scholarships,
          pendingScholarships: data.inactive_scholarships
        })
      } catch (err) {
        console.error(err)
        setError(err.message)
    }

  }

  const fetchPendingScholarships = async () => {
      try {
        const headers = {}
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/scholarships`, {
          method: 'GET',
          credentials: 'include',
          headers,
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships')
        }
        
        const data = await response.json()
        // Filter only pending scholarships for approval (you can adjust this logic)
        setScholarships(data.slice(0, 5)) // Mock: showing first 5 as pending
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

  const handleApprove = async (scholarshipId) => {
    // TODO: Connect to API endpoint for approval
    console.log('Approving scholarship:', scholarshipId)
    setScholarships(prev => prev.filter(s => s.id !== scholarshipId))
  }

  const handleReject = async (scholarshipId) => {
    // TODO: Connect to API endpoint for rejection
    console.log('Rejecting scholarship:', scholarshipId)
    setScholarships(prev => prev.filter(s => s.id !== scholarshipId))
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-blue-400">STIPENDIFY</h1>
            <p className="text-md text-gray-600 font-bold mt-1">
              Upravljaj stipendijama!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { logout(); navigate('/'); }} className="px-5 py-2.5 text-white font-bold bg-black rounded-xl shadow-md hover:bg-gray-800 transition-all active:scale-95">
              Logout
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            number={stats.registeredStudents} 
            label="Registriranih studenata" 
          />
          <StatCard 
            number={stats.registeredOrgs} 
            label="Registriranih organizacija" 
          />
          <StatCard 
            number={stats.activeScholarships} 
            label="Aktivnih stipendija" 
          />
          <StatCard 
            number={stats.pendingScholarships} 
            label="Stipendija na čekanju" 
          />
        </section>

        {/* Pending Approvals Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Zahtjevi za odobrenje</h2>
          <div className="space-y-4">
            {scholarships.length > 0 ? (
              scholarships.map((scholarship) => (
                <ApprovalCard 
                  key={scholarship.id}
                  scholarship={scholarship}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Nema zahtjeva za odobrenje
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ number, label }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-150">
      <div className="text-4xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  )
}

// Approval Card Component
function ApprovalCard({ scholarship, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const TRUNCATE_LENGTH = 150
  const description = scholarship.description || 'Nema opisa dostupnog.'
  const isLong = description.length > TRUNCATE_LENGTH
  const preview = isLong ? description.slice(0, TRUNCATE_LENGTH).trimEnd() : description

  return (
    <article className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-150 overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">{scholarship.name}</h3>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm bg-blue-200 p-2 text-blue-400 font-semibold rounded-md">
            Grad Šibenik
          </div>
          <div className="text-sm text-gray-600 bg-gray-300 p-2 font-semibold rounded-md">
            {scholarship.value ? `${scholarship.value}€` : '520€'}
          </div>
        </div>

        <div className={`${expanded ? '' : 'overflow-hidden max-h-36'} mt-3`}>
          <p className="text-sm text-gray-500">
            {expanded || !isLong ? description : `${preview}...`}
          </p>
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Krajnji rok: <span className="font-medium text-gray-800">14.11.2025.</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(scholarship.id)}
            className="bg-green-500 hover:bg-green-600 hover:scale-105 duration-150 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-md"
          >
            Odobri
          </button>
          <button
            onClick={() => onReject(scholarship.id)}
            className="bg-red-500 hover:bg-red-600 hover:scale-105 duration-150 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-md"
          >
            Odbij
          </button>
        </div>
      </div>
    </article>
  )
}

export default AdminPage