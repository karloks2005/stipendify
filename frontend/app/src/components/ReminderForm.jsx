import { useState } from 'react'
import InputField from './InputField'

function ReminderForm({ scholarshipId, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '8:00'
  })
  const [errors, setErrors] = useState({})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Naslov je obavezan'
    }
    if (!selectedDate) {
      newErrors.date = 'Odaberite datum podsjetnika'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // TODO: Connect to API
    console.log('Submitting reminder:', {
      scholarshipId,
      ...formData,
      date: selectedDate
    })

    // Close form after successful submission
    if (onClose) onClose()
  }

  // Calendar logic
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
    'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
  ]

  const dayNames = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED']

  const renderCalendar = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    
    // Adjust for Monday start (0 = Sunday -> 6, 1 = Monday -> 0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

    // Empty cells before first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isSelected = selectedDate && 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => setSelectedDate(date)}
          className={`h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
            ${isSelected ? 'bg-blue-400 text-white' : ''}
            ${isToday && !isSelected ? 'text-blue-600 font-bold' : ''}
            ${!isSelected && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const changeMonth = (delta) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Stvori podsjetnik</h2>
        <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
          Logo
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <InputField
          label="Naslov podsjetnika"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          error={errors.title}
          placeholder="Value"
        />

        {/* Description Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 text-left mb-1">
            Opis (opcionalno)
          </label>
          <input
            name="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Value"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Calendar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-blue-600 font-bold"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-blue-600 font-bold"
              >
                ›
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {errors.date && (
            <p className="mt-2 text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        {/* Time Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 text-left mb-1">
            Vrijeme:
          </label>
          <input
            type="time"
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 rounded-md shadow-md hover:opacity-95 font-bold text-base"
        >
          Stvori podsjetnik!
        </button>
      </form>
    </div>
  )
}

export default ReminderForm