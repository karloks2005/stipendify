import { useState } from 'react'

function Calendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const monthNames = [
    'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
    'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
  ]
  const dayNames = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED']

  const changeMonth = (delta) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 lg:h-10"></div>)
    }

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
          onClick={() => onDateSelect && onDateSelect(date)}
          className={`h-9 lg:h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button type="button" onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-blue-600 font-bold">‹</button>
          <button type="button" onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-blue-600 font-bold">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  )
}

export default Calendar