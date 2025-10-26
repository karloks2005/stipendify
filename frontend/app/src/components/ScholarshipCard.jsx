import { useState } from 'react'

export default function ScholarshipCard({ scholarship }) {
  const {
    title,
    organization,
    amount,
    deadline,
    tags = [],
    description = '',
    link = '#'
  } = scholarship;

  const [expanded, setExpanded] = useState(false)
  // Shorter default so sample descriptions show the toggle during development
  const TRUNCATE_LENGTH = 250
  const isLong = description && description.length > TRUNCATE_LENGTH
  const preview = isLong ? description.slice(0, TRUNCATE_LENGTH).trimEnd() : description

  return (
    <article className={`bg-white rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-150 overflow-hidden flex flex-col`}> 
      <div className="p-6 flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{organization} • <span className="font-medium">{amount}</span></p>

        {/* Description container: constrained when collapsed so only text scroll/clip is applied here */}
        <div className={`${expanded ? '' : 'overflow-hidden max-h-36'} mt-3`}> 
          <p className="text-sm text-gray-500">
            {expanded || !isLong ? description : `${preview}...`}
          </p>
        </div>

        {/* Tags + toggle live outside the clipped area so the toggle is always visible */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="text-xs bg-blue-200 text-gray-700 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>

          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="ml-4 text-sm text-blue-600 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>Deadline: <span className="font-medium text-gray-800">{deadline}</span></div>
          <a
            href={link}
            className="inline-block bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-2xl hover:opacity-95"
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        </div>
      </div>
    </article>
  );
}
