# Kaldırılan Modüller

Bu belge, MechBuild Core projesinden kaldırılan modülleri ve bunların gelecekteki planlarını detaylandırmaktadır.

## Genel Bakış

Aşağıdaki modüller, projenin mimari yeniden yapılandırılması ve geliştirme sürecinin optimize edilmesi amacıyla kaldırılmıştır. Bu modüller, yeni mimari yapıya uygun olarak gelecekte yeniden implemente edilecektir.

## Kaldırılan Modüller

### 1. HVAC Modülü
- **Önceki Konum:** `blocks/hvac/`
- **İşlevsellik:**
  - Isıtma sistemleri yönetimi
  - Soğutma sistemleri yönetimi
  - Havalandırma sistemleri yönetimi
  - Enerji tüketimi takibi
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** Yeni mimariye uygun olarak, mikroservis yapısında yeniden implementasyon

### 2. Sprinkler Modülü
- **Önceki Konum:** `blocks/sprinkler/`
- **İşlevsellik:**
  - Yangın söndürme sistemleri yönetimi
  - Sprinkler başlıkları takibi
  - Basınç ve akış kontrolü
  - Bakım planlaması
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** IoT entegrasyonu ile birlikte yeniden implementasyon

### 3. Fire Cabinet Modülü
- **Önceki Konum:** `blocks/fire-cabinet/`
- **İşlevsellik:**
  - Yangın dolabı envanter yönetimi
  - Ekipman takibi
  - Bakım planlaması
  - Kontrol listeleri
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** QR kod entegrasyonu ile birlikte yeniden implementasyon

### 4. Rainwater Modülü
- **Önceki Konum:** `blocks/rainwater/`
- **İşlevsellik:**
  - Yağmur suyu toplama sistemleri
  - Depolama tankları yönetimi
  - Kullanım takibi
  - Bakım planlaması
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** Sensör entegrasyonu ile birlikte yeniden implementasyon

### 5. Wastewater Modülü
- **Önceki Konum:** `blocks/wastewater/`
- **İşlevsellik:**
  - Atık su sistemleri yönetimi
  - Pompa sistemleri kontrolü
  - Arıtma tesisleri takibi
  - Bakım planlaması
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** SCADA entegrasyonu ile birlikte yeniden implementasyon

### 6. Drinking Water Modülü
- **Önceki Konum:** `blocks/drinking-water/`
- **İşlevsellik:**
  - İçme suyu sistemleri yönetimi
  - Su kalitesi takibi
  - Basınç kontrolü
  - Bakım planlaması
- **Kaldırılma Nedeni:** Yeniden tasarım ve mimari değişiklikleri
- **Gelecek Planları:** IoT ve sensör entegrasyonu ile birlikte yeniden implementasyon

## Gelecek Geliştirmeler

### Kısa Vadeli (3-6 ay)
1. Yeni mimari yapının tamamlanması
2. Temel altyapının kurulması
3. Test ortamının hazırlanması

### Orta Vadeli (6-12 ay)
1. HVAC modülünün yeniden implementasyonu
2. Sprinkler modülünün yeniden implementasyonu
3. Fire Cabinet modülünün yeniden implementasyonu

### Uzun Vadeli (12+ ay)
1. Rainwater modülünün yeniden implementasyonu
2. Wastewater modülünün yeniden implementasyonu
3. Drinking Water modülünün yeniden implementasyonu

## Teknik Notlar

### Yeni Mimari Yaklaşımı
- Mikroservis mimarisi
- IoT entegrasyonu
- Gerçek zamanlı veri işleme
- Ölçeklenebilir yapı

### Entegrasyon Planları
- SCADA sistemleri
- Sensör ağları
- Enerji yönetim sistemleri
- BMS (Building Management Systems)

### Güvenlik Gereksinimleri
- Endüstriyel güvenlik standartları
- Veri şifreleme
- Erişim kontrolü
- Audit logging

## Katkıda Bulunma

Bu modüllerin yeniden implementasyonu sürecinde katkıda bulunmak isteyen geliştiriciler için:

1. Yeni mimari dokümantasyonunu inceleyin
2. İlgili modülün gelecek planlarını gözden geçirin
3. Geliştirme sürecine katılmak için iletişime geçin

## Kaynaklar

- [Mimari Dokümantasyonu](ARCHITECTURE.md)
- [Geliştirici Kılavuzu](DEVELOPMENT.md)
- [Proje Genel Bakış](README.md) 