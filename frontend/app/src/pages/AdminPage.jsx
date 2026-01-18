import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ScholarshipCard from '../components/ScholarshipCard'

function AdminPage() {
  const [scholarships, setScholarships] = useState([])
  const [stats, setStats] = useState({
    registeredStudents: 0,
    registeredOrgs: 0,
    activeScholarships: 0,
    pendingScholarships: 0
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

    const payload = { 
      is_allowed: true
     }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/scholarships/${scholarshipId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Greška pri odobravanju stipendije')
      if (response.ok) {
        setScholarships(prev => prev.filter(s => s.id !== scholarshipId))
      }
    })
    .catch(err => {
      console.error('Greška:', err)
      alert('Neuspješno odobravanje stipendije')
    })
  }

  const handleReject = async (scholarshipId) => {
    // TODO: Connect to API endpoint for rejection
    console.log('Rejecting scholarship:', scholarshipId)
    setScholarships(prev => prev.filter(s => s.id !== scholarshipId))

    fetch (`${process.env.REACT_APP_BACKEND_URL}/scholarships/${scholarshipId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Greška pri odbijanju stipendije')
      // Optionally refresh stats or scholarships list here
    })
    .catch(err => {
      console.error('Greška:', err)
      alert('Neuspješno odbijanje stipendije')
    })
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
                <ScholarshipCard 
                  key={scholarship.id}
                  scholarship={scholarship}
                  showApprovalActions={true}
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

export default AdminPage