import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parse, end, toSeconds } from "iso8601-duration";

const ScholarshipPostForm = ({ onClose, onCreated, scholarship = null }) => {

  const {accessToken} = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    iznos: '200',
    period: 'mjesečno',
    opis: '',
    podrucje: '',
    mjesto: '',
    godina: '',
    prosjek: '',
    obvezaRada: 'ne',
    trajanjeRada: '0',
    trajanje: '9',
    link: '',
    rokPrijave: '',
    pocetakStipendije: ''
  });

  useEffect(() => {
    if (scholarship) {
      // Parsiranje polja za editanje
      const arbejdLength = toSeconds(parse(scholarship.length_of_scholarship))/2592000;
      const arbetLength = toSeconds(parse(scholarship.length_of_work))/2592000;
      
      // Mapiranje godine u format koji koristi select
      let godinaValue = '';
      if (scholarship.min_year_of_study) {
        const yearNum = scholarship.min_year_of_study.toString();
        godinaValue = `${yearNum}. godina`;
      }
      
      setFormData({
        name: scholarship.name || '',
        iznos: scholarship.value?.toString() || '200',
        period: scholarship.is_monthly ? 'mjesečno' : 'jednokratno',
        opis: scholarship.description || '',
        podrucje: scholarship.field_of_study || '',
        mjesto: scholarship.location || '',
        godina: godinaValue,
        prosjek: scholarship.min_grade_average?.toString() || '',
        obvezaRada: scholarship.organisation_work ? 'da' : 'ne',
        trajanjeRada: arbetLength,
        trajanje: arbejdLength,
        link: scholarship.url || '',
        rokPrijave: scholarship.important_dates?.end_date?.split('T')[0] || '',
        pocetakStipendije: scholarship.important_dates?.start_date?.split('T')[0] || ''
      });
    }
  }, [scholarship]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'obvezaRada') {
      setFormData(prev => ({
        ...prev,
        obvezaRada: value,
        trajanjeRada: value === 'ne' ? '0' : (prev.trajanjeRada === '0' ? '1' : prev.trajanjeRada)
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ekstraktuj broj iz "1. godina" formata
    const godinaNum = parseInt(formData.godina.match(/\d+/)?.[0]) || 1;
    
    const payload = {
      "name": formData.name,
      "value": parseFloat(formData.iznos) || 0,
      "url": formData.link,
      "is_allowed": false,
      "organisation_work": formData.obvezaRada === 'da',
      "min_grade_average": parseFloat(formData.prosjek) || 0,
      "field_of_study": formData.podrucje,
      "type_of_study": "Prijediplomski",
      "min_year_of_study": godinaNum,
      "length_of_scholarship": `P${formData.trajanje}M`,
      "length_of_work": `P${formData.trajanjeRada}M`,
      "important_dates": {
        "end_date": formData.rokPrijave,
        "start_date": formData.pocetakStipendije
      },
      "description": formData.opis,
      "location": formData.mjesto,
      "is_monthly": formData.period === 'mjesečno'
    }

    const method = scholarship ? 'PUT' : 'POST';
    const url = scholarship 
      ? `${process.env.REACT_APP_BACKEND_URL}/scholarships/${scholarship.id}`
      : `${process.env.REACT_APP_BACKEND_URL}/scholarships`;

    fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('FAILURE:', response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('SUCCESS', data);
      if (typeof onCreated === 'function') {
        onCreated();
      }
      if (typeof onClose === 'function') {
        onClose();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    console.log('Submitting scholarship post:', formData);
  }

  const isEditing = scholarship !== null;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 max-w-xl mx-auto relative border border-gray-100">
      <button
        onClick={() => { if (typeof onClose === 'function') onClose() }}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Zatvori"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Uredi stipendiju' : 'Objava novog natječaja za stipendiju'}</h2>
      </div>

      {/* Form Content */}
      <div className="px-8 pb-8 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar text-left">
        
        {/* Osnovne informacije */}
        <section>
          <h3 className="text-lg font-bold mb-1">Osnovne informacije</h3>
          <hr className="border-blue-200 mb-4" />
          <div className="space-y-4">
            <FormRow label="Naziv natječaja">
              <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-400" />
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
              <textarea name="opis" value={formData.opis} onChange={handleInputChange} placeholder="Unesite detaljan opis stipendije" className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none outline-none focus:ring-1 focus:ring-blue-400 text-sm italic" />
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
                <option>Zadar</option>
                <option>Slavonski Brod</option>
                <option>Pula</option>
                <option>Karlovac</option>
                <option>Varaždin</option>
                <option>Šibenik</option>
                <option>Sisak</option>
                <option>Velika Gorica</option>
                <option>Vinkovci</option>
                <option>Vukovar</option>
                <option>Dubrovnik</option>
                <option>Bjelovar</option>
                <option>Koprivnica</option>
                <option>Požega</option>
                <option>Čakovec</option>
                <option>Trogir</option>
              </select>
            </FormRow>
            <FormRow label="Minimalna godina studija">
              <select name="godina" value={formData.godina} onChange={handleInputChange} className="w-32 border border-gray-300 rounded px-3 py-1.5 outline-none bg-white">
                <option>1. godina</option>
                <option>2. godina</option>
                <option>3. godina</option>
                <option>4. godina</option>
                <option>5. godina</option>
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
            {formData.obvezaRada === 'da' && (
              <FormRow label="Trajanje rada u tvrtki (u mjesecima)">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="trajanjeRada"
                    min="1"
                    value={formData.trajanjeRada}
                    onChange={handleInputChange}
                    className="w-16 border border-gray-300 rounded px-3 py-1.5 outline-none"
                  />
                </div>
              </FormRow>
            )}
            <FormRow label="Trajanje stipendije (u mjesecima)">
              <div className="flex items-center gap-3">
                <input type="number" name="trajanje" min="1" value={formData.trajanje} onChange={handleInputChange} className="w-16 border border-gray-300 rounded px-3 py-1.5 outline-none" />
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
              <input name="link" value={formData.link} onChange={handleInputChange} placeholder="https://www..." className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none" />
            </FormRow>
            <FormRow label="Rok prijave">
              <div className="relative">
                <input
                  type="date"
                  name="rokPrijave"
                  value={formData.rokPrijave}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none pr-10"
                />
                <span className="absolute right-3 top-2 text-gray-400"></span>
              </div>
            </FormRow>
            <FormRow label="Početak stipendiranja">
              <div className="relative">
                <input
                  type="date"
                  name="pocetakStipendije"
                  value={formData.pocetakStipendije}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none pr-10"
                />
                <span className="absolute right-3 top-2 text-gray-400"></span>
              </div>
            </FormRow>
          </div>
        </section>

        {/* Footer Button */}
        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSubmit}
            className="bg-[#2D3339] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-black transition-all active:scale-95"
          >
            {isEditing ? 'Spremi izmjene' : 'Objavi natječaj'}
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