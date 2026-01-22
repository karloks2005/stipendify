import React, { useState } from 'react';
import logo from '../logo.svg';

const ScholarshipFilterForm = ({ onClose, onCalculateClick, onApply, availableCities = [] }) => {
  const [formData, setFormData] = useState({
    socioEkonStatus: '',
    prosjek: '',
    godinaStudija: '',
    vrstaStudija: '',
    podrucjeStudiranja: '',
    grad: '',
    zdravstveniStatus: [],
    nacionalnaManjina: '',
    kategorijaSportasa: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value) => {
    setFormData(prev => {
      const current = prev.zdravstveniStatus;
      return {
        ...prev,
        zdravstveniStatus: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans text-gray-800">
      <div className="px-8 py-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stipendijski Obrazac</h2>
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
      </div>

      <div className="px-8 pb-8 space-y-6 overflow-y-auto max-h-[80vh] text-left custom-scrollbar">
        
        <section>
          <h3 className="text-base font-bold mb-1">Socioekonomski status</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm text-gray-600 sm:w-1/4">Odaberite status:</label>
            <select 
              name="socioEkonStatus"
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none bg-white text-sm italic text-gray-400"
              value={formData.socioEkonStatus}
              onChange={handleInputChange}
            >
              <option value="">*niska/srednja/visoka razina</option>
              <option value="niska">Niska razina</option>
              <option value="srednja">Srednja razina</option>
              <option value="visoka">Visoka razina</option>
            </select>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-600">Ne znaš svoj status?</span>
              <button 
                onClick={onCalculateClick}
                className="bg-[#5D92EB] text-white text-[10px] px-3 py-1.5 rounded shadow-sm hover:bg-[#4A7DCE] transition-all"
              >
                Izračunaj socioekonomski status
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Prosjek ocjena</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Unesite prosjek:</label>
            <input 
              name="prosjek"
              value={formData.prosjek}
              onChange={handleInputChange}
              className="w-24 border border-gray-300 rounded px-2 py-1 outline-none text-sm text-center"
              placeholder="npr 4.20"
            />
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Godina studiranja</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Unesite broj:</label>
            <select 
              name="godinaStudija"
              className="w-24 border border-gray-300 rounded px-2 py-1 outline-none bg-white text-sm"
              value={formData.godinaStudija}
              onChange={handleInputChange}
            >
              <option value="">*odaberi</option>
              {[1,2,3,4,5].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Vrsta studija</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex flex-wrap gap-4">
            {['Preddiplomski', 'Diplomski', 'Integrirani', 'Poslijediplomski'].map(vrsta => (
              <Radio 
                key={vrsta}
                label={vrsta} 
                name="vrstaStudija" 
                value={vrsta} 
                checked={formData.vrstaStudija === vrsta} 
                onChange={handleInputChange} 
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Područje studiranja</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <select 
            name="podrucjeStudiranja"
            className="w-1/2 border border-gray-300 rounded px-3 py-1.5 outline-none bg-white text-sm text-gray-500"
            value={formData.podrucjeStudiranja}
            onChange={handleInputChange}
          >
            <option value="">Odaberite područje</option>
            <option>Tehničke znanosti</option>
            <option>Društvene znanosti</option>
            <option>Humanističke znanosti</option>
          </select>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Lokacija</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex gap-4">
            <select 
              name="grad"
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 outline-none bg-white text-sm text-gray-500"
              value={formData.grad}
              onChange={handleInputChange}
            >
              <option value="">Odaberite grad</option>
              {Array.isArray(availableCities) && availableCities.length > 0 ? (
                availableCities.map((c) => <option key={c} value={c}>{c}</option>)
              ) : (
                [
                  'Zagreb','Split','Rijeka','Osijek','Zadar','Slavonski Brod','Pula','Karlovac',
                  'Varaždin','Šibenik','Sisak','Velika Gorica','Vinkovci','Vukovar','Dubrovnik',
                  'Bjelovar','Koprivnica','Požega','Čakovec','Trogir'
                ].map(c => <option key={c} value={c}>{c}</option>)
              )}
            </select>
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Zdravstveni status</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex flex-wrap gap-6">
            <Checkbox 
              label="Student s invaliditetom" 
              checked={formData.zdravstveniStatus.includes('student')}
              onChange={() => handleCheckboxChange('student')}
            />
            <Checkbox 
              label="Član obitelji s invaliditetom" 
              checked={formData.zdravstveniStatus.includes('clan')}
              onChange={() => handleCheckboxChange('clan')}
            />
            <Checkbox 
              label="Ništa od navedenog" 
              checked={formData.zdravstveniStatus.length === 0}
              onChange={() => setFormData(prev => ({...prev, zdravstveniStatus: []}))}
            />
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Pripadnost nacionalnoj manjini</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex gap-6">
            <Radio label="Da" name="nacionalnaManjina" value="Da" checked={formData.nacionalnaManjina === 'Da'} onChange={handleInputChange} />
            <Radio label="Ne" name="nacionalnaManjina" value="Ne" checked={formData.nacionalnaManjina === 'Ne'} onChange={handleInputChange} />
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold mb-1">Kategorija sportaša</h3>
          <hr className="border-[#D4E3F9] mb-4" />
          <div className="flex flex-wrap gap-6">
            {['Vrhunski', 'Kategorizirani', 'Amaterski', 'Ništa od navedenog'].map(kat => (
              <Radio 
                key={kat}
                label={kat} 
                name="kategorijaSportasa" 
                value={kat} 
                checked={formData.kategorijaSportasa === kat} 
                onChange={handleInputChange} 
              />
            ))}
          </div>
        </section>

        <div className="pt-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => onClose && onClose()}
              className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              Zatvori
            </button>
          </div>
          <div>
            <button 
              onClick={() => { if (onApply) onApply(formData); }}
              className="bg-[#2D3339] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-black transition-all active:scale-95"
            >
              Pretraži stipendije!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Radio = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm cursor-pointer group">
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${checked ? 'border-[#5D92EB]' : 'border-gray-300'}`}>
      {checked && <div className="w-2 h-2 rounded-full bg-[#5D92EB]" />}
    </div>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
    <span className="text-gray-700">{label}</span>
  </label>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="w-4 h-4 rounded border-gray-300 accent-[#5D92EB]" 
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

export default ScholarshipFilterForm;
