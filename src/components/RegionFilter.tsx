import { useState } from 'react';
import { regions } from '../data';
import { useApp } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function RegionFilter() {
  const { language, selectedRegion, setSelectedRegion, selectedDistrict, setSelectedDistrict } = useApp();
  const [regionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const currentRegion = regions.find(r => r.id === selectedRegion);
  const currentDistrict = currentRegion?.districts.find(d => d.id === selectedDistrict);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Область */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => {
            setRegionOpen(!regionOpen);
            setDistrictOpen(false);
          }}
          className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm"
        >
          <span>{language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
        </button>
        {regionOpen && (
          <div className="absolute left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
            {regions.map(region => (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  setSelectedRegion(region.id);
                  setSelectedDistrict(region.districts[0]?.id || '');
                  setRegionOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedRegion === region.id ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {language === 'uz' ? region.nameUz : region.nameRu}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Район */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => {
            setDistrictOpen(!districtOpen);
            setRegionOpen(false);
          }}
          className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm"
        >
          <span>{language === 'uz' ? currentDistrict?.nameUz : currentDistrict?.nameRu}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${districtOpen ? 'rotate-180' : ''}`} />
        </button>
        {districtOpen && currentRegion && (
          <div className="absolute left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
            {currentRegion.districts.map(district => (
              <button
                key={district.id}
                type="button"
                onClick={() => {
                  setSelectedDistrict(district.id);
                  setDistrictOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedDistrict === district.id ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {language === 'uz' ? district.nameUz : district.nameRu}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}