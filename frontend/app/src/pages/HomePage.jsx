import { useState } from 'react'
import ScholarshipCard from '../components/ScholarshipCard'

function HomePage() {
  const [count] = useState(0)

  // Sample data — replace with real API data when available
  const scholarships = [
    {
      id: 1,
      title: 'Excellence Scholarship',
      organization: 'City Foundation',
      amount: '€1,000',
      deadline: 'Nov 30, 2025',
      tags: ['Undergraduate', 'Merit', 'Europe'],
      description:
        'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
      link: '#'
    },
    {
      id: 2,
      title: 'Women in Tech Grant',
      organization: 'TechForward',
      amount: '€2,500',
      deadline: 'Dec 15, 2025',
      tags: ['STEM', 'Graduate', 'Diversity'],
      description:
        'Supports women pursuing degrees in technology and engineering. Applicants should submit a project summary and transcript.',
      link: '#'
    },
    {
      id: 3,
      title: 'Local Artist Award',
      organization: 'Arts Council',
      amount: '€750',
      deadline: 'Jan 10, 2026',
      tags: ['Arts', 'Portfolio'],
      description:
        'Small grant for local emerging artists to support the creation of new work. Portfolio and artist statement required.',
      link: '#'
    }
  ]

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-5xl font-bold text-blue-400">Stipendify</h1>
          <p className="text-md text-gray-600 font-bold mt-1">Pronađi stipendiju s lakoćom!</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left area: cards (span 2 on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            {scholarships.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>

          {/* Right area: reserved for calendar */}
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