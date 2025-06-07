# Teknik Mimari Dokümanı

Bu belge, MechBuild Core projesinin teknik mimarisini ve tasarım kararlarını detaylandırmaktadır.

## Mimari Genel Bakış

MechBuild Core, modüler bir mimari kullanarak bina yönetim sistemlerini yönetmek için tasarlanmıştır. Sistem, her biri belirli bir işlevselliğe odaklanan bağımsız modüllerden oluşmaktadır.

## Teknoloji Yığını

### Frontend
- **Framework:** React
- **Dil:** TypeScript
- **Stil:** CSS Modules
- **State Yönetimi:** React Hooks
- **Form Yönetimi:** React Hook Form
- **UI Bileşenleri:** Özel bileşenler

### Backend (Planlanan)
- **API:** RESTful
- **Veritabanı:** PostgreSQL
- **Kimlik Doğrulama:** JWT
- **Önbellek:** Redis

## Modül Yapısı

Her modül aşağıdaki temel dosya yapısını takip eder:

```
blocks/[module-name]/
├── Component.tsx      # Ana UI bileşeni
├── logic.ts          # İş mantığı ve hooks
├── types.ts          # TypeScript tip tanımları
├── __tests__/        # Test dosyaları
└── README.md         # Modül dokümantasyonu
```

### Modül İçi İletişim

1. **Veri Akışı:**
   - UI bileşenleri (`Component.tsx`) kullanıcı etkileşimlerini yönetir
   - İş mantığı (`logic.ts`) veri işleme ve state yönetimini sağlar
   - Tip tanımları (`types.ts`) veri yapılarını ve arayüzleri tanımlar

2. **State Yönetimi:**
   - Her modül kendi state'ini yönetir
   - Modüller arası iletişim için event sistemi kullanılır
   - Global state gerektiğinde Context API kullanılır

## Mikroservis Mimarisi (Gelecek)

Projenin uzun vadeli hedefi, daha ölçeklenebilir, esnek ve bakımı kolay bir yapıya sahip olmak için mikroservis mimarisine geçmektir. Bu geçiş, mevcut modüler yapının daha bağımsız ve dağıtık servislere dönüştürülmesini içerecektir.

### Rasyonel
- **Ölçeklenebilirlik:** Modüllerin bağımsız olarak ölçeklenebilmesi.
- **Esneklik:** Teknolojilerin ve dillerin servis bazında seçilebilmesi.
- **Dayanıklılık:** Bir servisteki hatanın diğer servisleri etkileme olasılığının azalması.
- **Bakım Kolaylığı:** Küçük ve odaklanmış servislerin yönetiminin daha basit olması.

### Temel Prensipler
- **Tek Sorumluluk Prensibi:** Her mikroservis belirli bir iş alanına odaklanmalıdır.
- **Gevşek Bağlılık:** Servisler birbirinden bağımsız olarak geliştirilmeli ve dağıtılmalıdır.
- **Dağıtık Veri Yönetimi:** Her servisin kendi veri deposu olabilir.
- **API Gateway:** Mikroservislere dış erişim için tek bir giriş noktası.

### İletişim Modelleri
- **Senkron İletişim:** REST API çağrıları gibi doğrudan servisden servise iletişim (API Gateway aracılığıyla veya dahili olarak).
- **Asenkron İletişim:** Mesaj kuyrukları (örn. RabbitMQ, Kafka) kullanarak olay tabanlı iletişim.

### Geçiş Planı
- Mevcut modüllerin işlevselliklerine göre servislere ayrılması.
- Veri modellerinin servis bazında yeniden yapılandırılması.
- İletişim altyapısının (API Gateway, mesaj kuyrukları) kurulması.
- Mevcut frontend uygulamasının yeni mikroservislerle entegrasyonu.

## Güvenlik Mimarisi

### Kimlik Doğrulama (Planlanan)
- JWT tabanlı kimlik doğrulama
- Role dayalı yetkilendirme
- Oturum yönetimi
- API güvenliği

### Veri Güvenliği
- Hassas verilerin şifrelenmesi
- API isteklerinin doğrulanması
- XSS ve CSRF koruması

## Veri Senkronizasyonu

### Çevrimdışı Destek
- Yerel depolama kullanımı
- Değişiklik kuyruğu
- Çakışma çözümü
- Otomatik senkronizasyon

### Veri Tutarlılığı
- İşlem yönetimi
- Veri doğrulama
- Hata işleme
- Geri alma mekanizmaları

## Performans Optimizasyonu

### Frontend
- Kod bölme
- Lazy loading
- Önbellek stratejileri
- Bundle optimizasyonu

### Backend (Planlanan)
- Veritabanı indeksleme
- Sorgu optimizasyonu
- Önbellek kullanımı
- Yük dengeleme

## Hata Yönetimi

### Hata İzleme
- Merkezi hata yakalama
- Hata loglama
- Kullanıcı geri bildirimi
- Hata raporlama

### Kurtarma Stratejileri
- Otomatik yeniden deneme
- Fallback mekanizmaları
- Veri yedekleme
- Sistem durumu izleme

## Test Stratejisi

### Birim Testleri
- Jest test framework'ü
- React Testing Library
- Hook testleri
- Utility fonksiyon testleri

### Entegrasyon Testleri
- API entegrasyon testleri
- Modül entegrasyon testleri
- End-to-end testler

## Dağıtım ve DevOps

### CI/CD Pipeline (Planlanan)
- Otomatik test
- Kod kalite kontrolü
- Otomatik dağıtım
- Versiyon yönetimi

### Monitoring
- Performans izleme
- Hata izleme
- Kullanıcı davranışı analizi
- Sistem sağlığı kontrolü

## Gelecek Geliştirmeler

### Kısa Vadeli
1. Sistemik sorunların çözülmesi
2. Temel güvenlik implementasyonu
3. Test altyapısının güçlendirilmesi

### Orta Vadeli
1. Backend servislerinin implementasyonu
2. Veritabanı entegrasyonu
3. API gateway implementasyonu

### Uzun Vadeli
1. Mikroservis mimarisine geçiş
2. Ölçeklenebilirlik iyileştirmeleri
3. AI/ML entegrasyonu

## Bilinen Sınırlamalar

1. **Teknik Borç:**
   - Sistemik sorunlar nedeniyle bazı alanlarda teknik borç birikmiştir
   - Paket yönetimi sorunları devam etmektedir
   - Test kapsamı sınırlıdır

2. **Performans Sorunları:**
   - Büyük veri setlerinde performans sorunları olabilir
   - Çevrimdışı senkronizasyon iyileştirilmelidir

3. **Ölçeklenebilirlik:**
   - Mevcut mimari büyük ölçekli dağıtım için optimize edilmemiştir
   - Yük dengeleme stratejileri geliştirilmelidir 