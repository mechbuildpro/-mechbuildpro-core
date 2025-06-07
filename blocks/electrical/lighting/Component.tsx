import React from 'react';
import { useLightingCalculations } from './logic';

interface LightingComponentProps {
  // Buraya gerekli prop tipleri eklenecek
}

const LightingComponent: React.FC<LightingComponentProps> = (props) => {
  const { state, updateInput, calculateLighting } = useLightingCalculations();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Basit tip dönüşümü, daha sağlam validation gerekebilir
    updateInput({
      [name]: name === 'requiredIlluminance' || name === 'luminaireLumenOutput' ? parseFloat(value) : value,
    });
  };

   const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateInput({
      roomDimensions: {
        ...state.input.roomDimensions,
        [name]: parseFloat(value),
      }
    });
  };

   const handleReflectanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateInput({
      reflectance: {
        ...state.input.reflectance,
        [name]: parseFloat(value),
      }
    });
  };

  const handleCalculateClick = () => {
    calculateLighting(state.input);
  };

  return (
    <div className="lighting-component container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Aydınlatma Hesaplaması</h1>

      {/* Giriş Alanları */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Giriş Parametreleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Oda Boyutları */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Oda Uzunluğu (m)</label>
            <input type="number" name="length" value={state.input.roomDimensions.length} onChange={handleDimensionChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Oda Genişliği (m)</label>
            <input type="number" name="width" value={state.input.roomDimensions.width} onChange={handleDimensionChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Oda Yüksekliği (m)</label>
            <input type="number" name="height" value={state.input.roomDimensions.height} onChange={handleDimensionChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          {/* Çalışma Düzlemi ve Bakım Faktörü */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Çalışma Düzlemi Yüksekliği (m)</label>
            <input type="number" name="workingPlaneHeight" value={state.input.workingPlaneHeight} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bakım Faktörü</label>
            <input type="number" name="maintenanceFactor" value={state.input.maintenanceFactor} onChange={handleInputChange} step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          {/* Yansıtma Faktörleri */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Tavan Yansıtma Faktörü (%)</label>
            <input type="number" name="ceiling" value={state.input.reflectance.ceiling * 100} onChange={handleReflectanceChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Duvar Yansıtma Faktörü (%)</label>
            <input type="number" name="walls" value={state.input.reflectance.walls * 100} onChange={handleReflectanceChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Zemin Yansıtma Faktörü (%)</label>
            <input type="number" name="floor" value={state.input.reflectance.floor * 100} onChange={handleReflectanceChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          {/* Gerekli Aydınlık Düzeyi ve Armatür Bilgisi */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Gerekli Aydınlık Düzeyi (Lux)</label>
            <input type="number" name="requiredIlluminance" value={state.input.requiredIlluminance} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Armatür Tipi</label>
            <input type="text" name="luminaireType" value={state.input.luminaireType} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Armatür Lümen Çıkışı (lm)</label>
            <input type="number" name="luminaireLumenOutput" value={state.input.luminaireLumenOutput} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>

        {/* Hesapla Butonu */}
        <div className="mt-6">
          <button onClick={handleCalculateClick} disabled={state.loading} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50">
            {state.loading ? 'Hesaplanıyor...' : 'Hesapla'}
          </button>
        </div>
      </div>

      {/* Sonuç Alanı */}
      {state.result && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Hesaplama Sonuçları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Hesaplanan Aydınlık Düzeyi:</span>
              <span className="ml-2 text-gray-900">{state.result.calculatedIlluminance.toFixed(2)} Lux</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Gerekli Armatür Sayısı:</span>
              <span className="ml-2 text-gray-900">{state.result.numberOfLuminaires} Adet</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Toplam Güç Tüketimi:</span>
              <span className="ml-2 text-gray-900">{state.result.totalPowerConsumption.toFixed(2)} W</span>
            </div>
             <div>
              <span className="text-sm font-medium text-gray-700">Enerji Verimliliği:</span>
              <span className="ml-2 text-gray-900">{state.result.energyEfficiency.toFixed(2)} lm/W</span>
            </div>
            {/* Diğer sonuçlar buraya eklenebilir */}
          </div>
        </div>
      )}

      {/* Hata Mesajı */}
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
          <strong className="font-bold">Hata:</strong>
          <span className="block sm:inline"> {state.error}</span>
        </div>
      )}
    </div>
  );
};

export default LightingComponent; 