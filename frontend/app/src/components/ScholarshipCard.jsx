import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ScholarshipCard({ 
  scholarship, 
  onReminderClick, 
  onUpdated, 
  isUserScholarship = false,
  showApprovalActions = false,
  onApprove,
  onReject
}) {
  const { user, accessToken } = useAuth()
  const {
    name,
    value,
    url,
    organisation_work,
    min_grade_average,
    field_of_study,
    min_year_of_study,
    length_of_scholarship,
    length_of_work,
    important_dates,
    id,
    user_id,
    location,
    is_allowed,
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    organization_id,
  } = scholarship;

  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const TRUNCATE_LENGTH = 150
  const isLong = description && description.length > TRUNCATE_LENGTH
  const preview = isLong ? description.slice(0, TRUNCATE_LENGTH).trimEnd() : description

  // Provjera je li korisnik vlasnik stipendije
  const isOwner = isUserScholarship || (user && user_id === user.id)

  const handleDelete = () => {
    if (!isOwner || !accessToken) return

    fetch(`${process.env.REACT_APP_BACKEND_URL}/scholarships/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => {
      if (!response.ok) throw new Error('Greška pri brisanju stipendije')
      if (typeof onUpdated === 'function') onUpdated()
      setShowDeleteConfirm(false)
    })
    .catch(err => {
      console.error('Greška:', err)
      alert('Neuspješno brisanje stipendije')
    })
  }

  const InfoBadge = ({ label, value, icon }) => {
    if (!value) return null
    return (
      <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
        {icon && <span>{icon}</span>}
        <span><strong>{label}:</strong> {value}</span>
      </div>
    )
  }

  // Helper za konvertovanje ISO perioda u mjesece
  const getPeriodInMonths = (period) => {
    if (!period) return null
    const match = period.match(/\d+/)
    return match ? `${match[0]/30} mjeseci` : period
  }

  return (
    <article className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden flex flex-col border border-gray-100`}> 
      <div className="px-6 py-5 flex-1">
        {/* Header sa nazivom i vrijednosti */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
              {isUserScholarship && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${is_allowed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {is_allowed ? '✓ Odobreno' : '⏳ Na čekanju'}
                </span>
              )}
            </div>
          </div>
          {value && (
            <div className="text-xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg whitespace-nowrap">
              {value}€
            </div>
          )}
        </div>

        {/* Organizacija ili Lokacija */}
        {(organization_id || location) && (
          <div className="mb-3 text-sm text-gray-600 font-medium">
            📍 {organization_id || location}
          </div>
        )}

        {/* Opis */}
        <div className={`${expanded ? '' : 'overflow-hidden max-h-32'} mt-4 mb-3`}> 
          <p className="text-sm text-gray-600 leading-relaxed">
            {expanded || !isLong ? description : `${preview}...`}
          </p>
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            {expanded ? '▼ Prikaži manje' : '▶ Prikaži više'}
          </button>
        )}

        {/* Info badges */}
        <div className="space-y-2">
          <InfoBadge label="Minimalna ocjena" value={min_grade_average} icon="📊" />
          <InfoBadge label="Godina studija" value={min_year_of_study} icon="📚" />
          <InfoBadge label="Područje studija" value={field_of_study} icon="🎓" />
          <InfoBadge label="Trajanje stipendije" value={getPeriodInMonths(length_of_scholarship)} icon="⏱️" />
          {organisation_work && (
            <InfoBadge label="Rad u organizaciji" value={organisation_work} icon="💼" />
          )}
          {length_of_work && (
            <InfoBadge label="Trajanje rada" value={getPeriodInMonths(length_of_work)} icon="⏰" />
          )}
        </div>

        {/* URL */}
        {url && (
          <div className="mt-4">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold group"
            >
              🔗 Saznaj više
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer sa rokom i dugmima */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-gray-600">
            {important_dates && important_dates.end_date ? (
              <div>
                <span className="text-gray-500">Krajnji rok:</span>
                <span className="ml-2 font-bold text-gray-900">
                  {new Date(important_dates.end_date).toLocaleDateString('hr-HR')}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Nema datuma</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showApprovalActions ? (
              <>
                <button
                  onClick={() => onApprove && onApprove(id)}
                  className="bg-green-500 hover:bg-green-600 hover:scale-105 duration-150 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-md"
                >
                  Odobri
                </button>
                <button
                  onClick={() => onReject && onReject(id)}
                  className="bg-red-500 hover:bg-red-600 hover:scale-105 duration-150 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-md"
                >
                  Odbij
                </button>
              </>
            ) : (
              <>
                {isOwner && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95"
                    title="Obriši stipendiju"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={() => onReminderClick && onReminderClick(id, isOwner ? scholarship : null)}
                  className={`${isOwner ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white px-5 py-1.5 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95`}
                >
                  {isOwner ? '✏️ Uredi' : '🔔 Podsjeti me'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Obriši stipendiju?</h3>
            <p className="text-sm text-gray-600 mb-6">Ova radnja se ne može poništiti. Jeste li sigurni da želite obrisati stipendiju "{name}"?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
              >
                Odustani
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all active:scale-95"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
