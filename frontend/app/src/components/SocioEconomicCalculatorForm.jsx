import { useState } from 'react';
import { motion } from 'framer-motion';

const SocioEconomicCalculator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    prihod: 420,
    samohraniRoditelj: 'da',
    rastavljeniRoditelji: 'da',
    roditeljskaSkrb: 'oba/jedan roditelj, skrbnik, ustanova',
    roditeljBranitelj: 'da',
    roditeljiStatus: 'nista',
    studentRoditelj: 'da'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden font-sans text-gray-800">
      {/* Header */}
      <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Kalkulator socioekonomskog statusa</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
        
        {/* Prihod po članu obitelji */}
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Prihod po članu obitelji (EUR)</label>
          <input 
            type="number" 
            name="prihod"
            value={formData.prihod}
            onChange={handleInputChange}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-center outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Radio Grupa: Samohrani roditelj */}
        <RadioGroup 
          label="Status samohranog roditelja" 
          name="samohraniRoditelj" 
          value={formData.samohraniRoditelj} 
          onChange={handleInputChange} 
        />

        {/* Radio Grupa: Rastavljeni roditelji */}
        <RadioGroup 
          label="Rastavljeni roditelji" 
          name="rastavljeniRoditelji" 
          value={formData.rastavljeniRoditelji} 
          onChange={handleInputChange} 
        />

        {/* Dropdown: Roditeljska skrb */}
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Roditeljska skrb</label>
          <select 
            name="roditeljskaSkrb"
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 bg-white outline-none focus:ring-1 focus:ring-blue-400"
            value={formData.roditeljskaSkrb}
            onChange={handleInputChange}
          >
            <option>oba/jedan roditelj, skrbnik, ustanova</option>
            <option>Ustanova socijalne skrbi</option>
            <option>Udomiteljska obitelj</option>
          </select>
        </div>

        {/* Radio Grupa: Roditelj branitelj */}
        <RadioGroup 
          label="Status roditelja branitelja" 
          name="roditeljBranitelj" 
          value={formData.roditeljBranitelj} 
          onChange={handleInputChange} 
        />

        <hr className="border-blue-200" />

        {/* Checkbox Grupa: Roditelji poginuli/nestali/umrli */}
        <div className="space-y-4">
          <p className="text-sm font-medium">Roditelji poginuli, nestali ili umrli</p>
          <div className="grid grid-cols-2 gap-y-3">
            <Checkbox label="Poginuo jedan" />
            <Checkbox label="Poginula oba" />
            <Checkbox label="Nestao jedan" />
            <Checkbox label="Nestala oba" />
            <Checkbox label="Umro jedan" />
            <Checkbox label="Umrla oba" />
            <div className="col-span-2">
              <Checkbox label="Ništa od navedenog" checked={true} />
            </div>
          </div>
        </div>

        <hr className="border-blue-200" />

        {/* Radio Grupa: Student roditelj */}
        <RadioGroup 
          label="Je li student roditelj" 
          name="studentRoditelj" 
          value={formData.studentRoditelj} 
          onChange={handleInputChange} 
        />
      </div>

      {/* Footer Button */}
      <div className="p-6 bg-white flex justify-end">
        <button 
          onClick={onClose}
          className="bg-[#2D3339] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-black transition-all active:scale-95"
        >
          Primjeni rezultat
        </button>
      </div>
    </div>
  );
};

// Pomoćna komponenta za Radio gumbe (Da izgleda isto kao na slici)
const RadioGroup = ({ label, name, value, onChange }) => (
  <div className="flex justify-between items-center">
    <label className="text-sm font-medium">{label}</label>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input 
          type="radio" 
          name={name} 
          value="da" 
          checked={value === 'da'} 
          onChange={onChange}
          className="w-4 h-4 accent-blue-500"
        /> Da
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input 
          type="radio" 
          name={name} 
          value="ne" 
          checked={value === 'ne'} 
          onChange={onChange}
          className="w-4 h-4 accent-blue-500"
        /> Ne
      </label>
    </div>
  </div>
);

// Pomoćna komponenta za Checkbox (Dizajn s slike)
const Checkbox = ({ label, checked = false }) => (
  <label className="flex items-center gap-3 text-sm cursor-pointer group">
    <input 
      type="checkbox" 
      defaultChecked={checked}
      className="w-5 h-5 border-gray-300 rounded accent-blue-500 transition-all" 
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

export default SocioEconomicCalculator;