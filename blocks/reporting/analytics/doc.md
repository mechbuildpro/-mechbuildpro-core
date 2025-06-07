# Raporlama Modülü

Bu modül, projenin farklı bölümlerinden veri toplayarak kapsamlı raporlar oluşturmak için kullanılır.

## Özellikler

- Farklı rapor tipleri (Teknik, Ticari, Özet, Detaylı)
- Çoklu modül desteği
- Hesaplama detayları ve grafikler
- Maliyet analizleri ve öneriler
- Çoklu dil desteği
- Farklı format seçenekleri

## Rapor Tipleri

### Teknik Rapor
- Özet
- Hesaplamalar
- Teknik Özellikler
- Çizimler
- Öneriler

### Ticari Rapor
- Özet
- Maliyetler
- Zaman Çizelgesi
- Öneriler

### Özet Rapor
- Özet
- Temel Bulgular
- Öneriler

### Detaylı Rapor
- Özet
- Hesaplamalar
- Teknik Özellikler
- Çizimler
- Maliyetler
- Zaman Çizelgesi
- Öneriler

## Modül Entegrasyonu

Modül, aşağıdaki modüllerden veri toplayabilir:
- HVAC Modülü
- Yangın Pompası Modülü
- Zonlama Modülü
- BOQ Modülü
- Sözleşme Modülü

Her modül için veri toplama işlemi asenkron olarak gerçekleştirilir ve hata durumları yönetilir.

## Rapor Oluşturma Süreci

1. Kullanıcı rapor parametrelerini belirler
2. Seçilen modüllerden veri toplanır
3. Rapor şablonu seçilir
4. İçerik oluşturulur
5. Seçilen formatta dışa aktarılır

## Kullanım Örneği

```typescript
import { generateReport } from './logic';

const input = {
  reportTitle: 'Proje Raporu',
  reportType: 'technical',
  modules: ['hvac', 'fire-pump', 'zoning'],
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  includeCalculations: true,
  includeGraphs: true,
  includeCosts: true,
  includeRecommendations: true,
  language: 'tr',
  format: 'pdf',
  notes: 'Özel notlar buraya eklenebilir'
};

const result = await generateReport(input);
console.log(result);
```

## Çıktı Formatları

### PDF
- Sayfa düzeni ve formatlaması
- Grafik ve tablolar
- İçindekiler tablosu
- Sayfa numaralandırma

### Excel
- Çoklu sayfa desteği
- Formüller ve hesaplamalar
- Grafikler
- Filtreleme ve sıralama

### Word
- Zengin metin formatı
- Tablolar ve grafikler
- Stil ve şablonlar
- İçindekiler tablosu

## Hata Yönetimi

- Modül veri toplama hataları
- Format dönüştürme hataları
- Dosya oluşturma hataları
- Bellek yetersizliği durumları

## Performans Optimizasyonu

- Asenkron veri toplama
- Önbelleğe alma
- Bellek yönetimi
- Dosya boyutu optimizasyonu 