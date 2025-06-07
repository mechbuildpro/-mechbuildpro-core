'use client';

import ReportForm from './Form';

export default function ReportComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-700 mb-6">Raporlama</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rapor Oluşturma</h2>
          <p className="text-gray-600 mb-4">
            Bu modül, projenizin farklı bölümlerinden veri toplayarak kapsamlı raporlar oluşturmanızı sağlar.
            Aşağıdaki özellikleri içerir:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Farklı rapor tipleri (Teknik, Ticari, Özet, Detaylı)</li>
            <li>Çoklu modül desteği (HVAC, Yangın Pompası, Zonlama, BOQ, Sözleşme)</li>
            <li>Hesaplama detayları ve grafikler</li>
            <li>Maliyet analizleri ve öneriler</li>
            <li>Çoklu dil desteği (Türkçe, İngilizce)</li>
            <li>Farklı format seçenekleri (PDF, Excel, Word)</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <ReportForm />
        </div>
      </div>
    </div>
  );
} 