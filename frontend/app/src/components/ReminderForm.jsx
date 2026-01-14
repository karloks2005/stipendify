import { useState } from 'react'
import InputField from './InputField'
import Calendar from './Calendar'
import { useAuth } from '../context/AuthContext'

function ReminderForm({ scholarshipId, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderTime: '08:00'
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [errors, setErrors] = useState({})
  const { user, accessToken } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Naslov je obavezan'
    if (!selectedDate) newErrors.date = 'Odaberite datum'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Spremamo podsjetnik:', { scholarshipId, ...formData, selectedDate })
    
    let payload = {
        "scholarship_id": scholarshipId,
        "email": user.email,
        "remind_at": `${selectedDate.toISOString().split('T')[0]}T${formData.reminderTime}:00.000Z`,
    }
    let response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/email-reminders`, {
      method: "POST",
      credentials: "include",
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
        console.log('Podsjetnik uspješno spremljen')
        } else {
        console.error('Greška pri spremanju podsjetnika')
    }
    onClose()
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-w-lg mx-auto relative border border-gray-100">
      <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-1">Novi Podsjetnik</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField 
          label="Naslov podsjetnika" 
          name="title" 
          value={formData.title} 
          onChange={handleInputChange} 
          error={errors.title} 
          placeholder="Npr. Rok za predaju"
        />

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 text-left">Odaberi datum:</label>
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          {errors.date && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.date}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700 ml-1 text-left">Vrijeme:</label>
          <input
            type="time"
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition-all"
          />
        </div>

        <button type="submit" className="w-full bg-blue-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-500 transition-all active:scale-[0.98] mt-2">
          Spremi podsjetnik
        </button>
      </form>
    </div>
  )
}

export default ReminderForm