import { useState } from 'react';

const ScholarshipPostForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    naziv: 'Stipendija tvrtke ABC za IT studente',
    iznos: '800',
    valuta: 'EUR',
    period: 'mjesečno',
    opis: '',
    podrucje: 'Tehničke znanosti',
    mjesto: 'Zagreb',
    godina: '2. godina',
    prosjek: '4,00',
    obvezaRada: 'da',
    trajanje: '12',
    link: '',
    rokPrijave: '',
    pocetakStipendije: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans text-gray-800">
      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Objava novog natječaja za stipendiju</h2>
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          Logo
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 pb-8 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar text-left">
        
        {/* Osnovne informacije */}
        <section>
          <h3 className="text-lg font-bold mb-1">Osnovne informacije</h3>
          <hr className="border-blue-200 mb-4" />
          <div className="space-y-4">
            <FormRow label="Naziv natječaja">
              <input name="naziv" value={formData.naziv} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-400" />
            </FormRow>
            <FormRow label="Iznos stipendije">
              <div className="flex gap-2">
                <input name="iznos" value={formData.iznos} onChange={handleInputChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 outline-none" />
                <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded text-sm font-medium">EUR</div>
                <select name="period" value={formData.period} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-1.5 outline-none bg-white">
                  <option>mjesečno</option>
                  <option>jednokratno</option>
                </select>
              </div>
            </FormRow>
            <FormRow label="Opis stipendije">
              <textarea name="opis" placeholder="Unesite detaljan opis stipendije" className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none outline-none focus:ring-1 focus:ring-blue-400 text-sm italic" />
            </FormRow>
          </div>
        </section>

        {/* Kriteriji za studente */}
        <section>
          <h3 className="text-lg font-bold mb-1">Kriteriji za studente</h3>
          <hr className="border-blue-200 mb-4" />
          <div className="space-y-4">
            <FormRow label="Područje studiranja">
              <select name="podrucje" value={formData.podrucje} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none bg-white">
                <option>Tehničke znanosti</option>
                <option>Društvene znanosti</option>
                <option>Humanističke znanosti</option>
              </select>
            </FormRow>
            <FormRow label="Mjesto stipendiranja">
              <select name="mjesto" value={formData.mjesto} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none bg-white">
                <option>Zagreb</option>
                <option>Split</option>
                <option>Rijeka</option>
                <option>Osijek</option>
              </select>
            </FormRow>
            <FormRow label="Minimalna godina studija">
              <select name="godina" value={formData.godina} onChange={handleInputChange} className="w-32 border border-gray-300 rounded px-3 py-1.5 outline-none bg-white">
                <option>2. godina</option>
                <option>3. godina</option>
              </select>
            </FormRow>
            <FormRow label="Minimalni prosjek ocjena">
              <input name="prosjek" value={formData.prosjek} onChange={handleInputChange} className="w-20 border border-gray-300 rounded px-3 py-1.5 outline-none" />
            </FormRow>
          </div>
        </section>

        {/* Obveze i trajanje */}
        <section>
          <h3 className="text-lg font-bold mb-1">Obveze i trajanje</h3>
          <hr className="border-blue-200 mb-4" />
          <div className="space-y-4">
            <FormRow label="Obveza rada u tvrtki">
              <div className="flex gap-4">
                <Radio label="Da" name="obvezaRada" value="da" checked={formData.obvezaRada === 'da'} onChange={handleInputChange} />
                <Radio label="Ne" name="obvezaRada" value="ne" checked={formData.obvezaRada === 'ne'} onChange={handleInputChange} />
              </div>
            </FormRow>
            <FormRow label="Trajanje stipendije">
              <div className="flex items-center gap-3">
                <input name="trajanje" value={formData.trajanje} onChange={handleInputChange} className="w-16 border border-gray-300 rounded px-3 py-1.5 outline-none" />
                <span className="text-sm">mjeseca</span>
              </div>
            </FormRow>
          </div>
        </section>

        {/* Prijava i rokovi */}
        <section>
          <h3 className="text-lg font-bold mb-1">Prijava i rokovi</h3>
          <hr className="border-blue-200 mb-4" />
          <div className="space-y-4 text-sm font-medium">
            <FormRow label="Poveznica na prijavni obrazac">
              <input name="link" placeholder="https://www..." className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none" />
            </FormRow>
            <FormRow label="Rok prijave">
              <div className="relative">
                <input type="text" placeholder="Odaberite datum" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none pr-10" />
                <span className="absolute right-3 top-2 text-gray-400">📅</span>
              </div>
            </FormRow>
            <FormRow label="Početak stipendiranja">
              <div className="relative">
                <input type="text" placeholder="Odaberite datum" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none pr-10" />
                <span className="absolute right-3 top-2 text-gray-400">📅</span>
              </div>
            </FormRow>
          </div>
        </section>

        {/* Footer Button */}
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => console.log(formData)}
            className="bg-[#2D3339] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-black transition-all active:scale-95"
          >
            Objavi natječaj
          </button>
        </div>
      </div>
    </div>
  );
};

// Pomoćne komponente za čišći kod
const FormRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <label className="sm:w-1/3 text-sm font-medium text-gray-700">{label}</label>
    <div className="sm:w-2/3">{children}</div>
  </div>
);

const Radio = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="w-4 h-4 accent-blue-500" />
    {label}
  </label>
);

export default ScholarshipPostForm;