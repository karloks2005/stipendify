import { useState } from 'react'

export default function ScholarshipCard({ scholarship, onReminderClick }) {
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
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    organization_id = "Grad Šibenik",
  } = scholarship;

  const [expanded, setExpanded] = useState(false)
  // Shorter default so sample descriptions show the toggle during development
  const TRUNCATE_LENGTH = 150
  const isLong = description && description.length > TRUNCATE_LENGTH
  const preview = isLong ? description.slice(0, TRUNCATE_LENGTH).trimEnd() : description

  return (
    <article className={`bg-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-150 overflow-hidden flex flex-col`}> 
      <div className="px-6 py-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className='flex justify-between items-center mt-2'>
          <div className='text-sm bg-blue-200 p-2 text-blue-400 font-semibold rounded-md'>
            Grad Šibenik
          </div>
          <div className="text-sm text-gray-600 bg-gray-300 p-2 font-semibold rounded-md">
            {
              value ? `${value}€` : 'N/A'
            }
          </div>
        </div>
        {/* Description container: constrained when collapsed so only text scroll/clip is applied here */}
        <div className={`${expanded ? '' : 'overflow-hidden max-h-36'} mt-3`}> 
          <p className="text-sm text-gray-500">
            {expanded || !isLong ? description : `${preview}...`}
          </p>
        </div>
        {/* Tags + toggle live outside the clipped area so the toggle is always visible */}
        <div className="mt-3 flex items-center justify-between">
          {/*
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="text-xs bg-blue-200 text-gray-700 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>*/}

          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mr-0 text-sm text-blue-600 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          {important_dates && important_dates.end_date ? (
            <div>Krajnji rok: <span className="font-medium text-gray-800">
              {new Date(important_dates.end_date).toLocaleDateString('hr-HR')}
            </span></div>
          ) : (
            <div></div>
          )}
          <div>
          <button
              onClick={() => onReminderClick && onReminderClick(id)}
              className="inline-block bg-gray-900 hover:scale-105 duration-150 text-gray-100 px-4 py-1.5 rounded-xl text-sm font-bold shadow-2xl hover:opacity-95"
            >
              Podsjeti me
          </button>
          </div>
        </div>
      </div>
    </article>
  );
}
