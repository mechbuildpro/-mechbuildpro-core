# MechBuild Core

Bu belge, MechBuild Core projesinin genel yapısını, modüllerini ve mevcut durumunu özetlemektedir.

## Proje Genel Bakış

MechBuild Core, bina yönetim sistemleri için geliştirilmiş modüler bir yazılım çözümüdür. Sistem, çeşitli bina sistemlerinin yönetimi, izlenmesi ve kontrolü için gerekli temel modülleri içermektedir.

## Modüller

### 1. Entegrasyon Modülü (`blocks/project-management/integration/`)
- İş akışı yönetimi
- Bildirim sistemi
- Veri senkronizasyonu
- Durum: Kısmen tamamlanmış, temel işlevsellik mevcut

### 2. Bakım Yönetimi (`blocks/maintenance/`)
- Bakım görevleri yönetimi
- Ekipman entegrasyonu
- Bakım geçmişi takibi
- Analitik özellikleri
- Durum: Temel yapı kurulmuş, UI/UX iyileştirmeleri yapılmış

### 3. Raporlama (`blocks/reporting/`)
- Veri dışa aktarma (PDF, Excel)
- Rapor oluşturma
- Durum: Temel yapı mevcut, harici kütüphane sorunları nedeniyle sınırlı

### 4. Aydınlatma (`blocks/lighting/`)
- Aydınlatma sistemleri yönetimi
- Durum: Planlama aşamasında

### 5. Envanter (`blocks/inventory/`)
- Ekipman ve malzeme takibi
- Stok yönetimi
- Durum: Planlama aşamasında

### 6. Çekirdek Sistemler (`blocks/core-systems/`)
- Kimlik doğrulama
- Kullanıcı yönetimi
- Yapılandırma yönetimi
- Durum: Planlama aşamasında

### 7. Yardımcı Fonksiyonlar (`blocks/utils/`)
- Genel amaçlı yardımcı fonksiyonlar
- Durum: Temel yapı mevcut

### 8. Ortak Bileşenler (`blocks/common/`)
- Paylaşılan UI bileşenleri
- Ortak hook'lar
- Durum: Temel yapı mevcut

## Kaldırılan Modüller

Projeden kaldırılan modüller ve bunların gelecek planları hakkında detaylı bilgi için [Kaldırılan Modüller](REMOVED_MODULES.md) dokümantasyonunu inceleyebilirsiniz.

## Bilinen Sorunlar

### Sistemik Sorunlar
1. **Dosya Okuma ve Düzenleme:** Bazı dosyalarda okuma zaman aşımı ve karmaşık düzenlemelerin uygulanmasında sorunlar yaşanmaktadır.
2. **Paket Yönetimi:** Harici kütüphanelerin kurulumu ve bağımlılıklarıyla ilgili sorunlar mevcuttur.
3. **Test Kapsamı:** Test kütüphanelerinin kurulumu ve test dosyalarının düzenlenmesi konusunda zorluklar vardır.

### Modül Spesifik Sorunlar
1. **Güvenlik:** Kimlik doğrulama ve yetkilendirme sistemleri yer tutucu durumdadır.
2. **Dışa Aktırma:** Harici kütüphane sorunları nedeniyle tam işlevsel değildir.
3. **API Entegrasyonu:** Harici sistemlerle entegrasyon için API bağlantıları gerekmektedir.

## Gelecek Çalışmalar

### Öncelikli Görevler
1. Sistemik sorunların çözülmesi
2. Güvenlik sisteminin implementasyonu
3. Dışa aktarma fonksiyonelliğinin tamamlanması
4. Test kapsamının genişletilmesi

### Modül Geliştirmeleri
1. Aydınlatma modülünün implementasyonu
2. Envanter modülünün geliştirilmesi
3. Çekirdek sistemlerin tamamlanması
4. Raporlama özelliklerinin genişletilmesi
5. Kaldırılan modüllerin yeni mimariye uygun olarak yeniden implementasyonu

## Dokümantasyon

- [Teknik Mimari](ARCHITECTURE.md)
- [Geliştirici Kılavuzu](DEVELOPMENT.md)
- [Kaldırılan Modüller](REMOVED_MODULES.md)

## Kurulum

_(Bu bölüm, sistemik sorunlar çözüldükten sonra detaylandırılacaktır.)_

## Katkıda Bulunma

_(Bu bölüm, projenin katkıda bulunma kuralları ve süreçleri netleştikçe detaylandırılacaktır.)_

## Lisans

_(Bu bölüm, projenin lisans bilgileri eklendikçe detaylandırılacaktır.)_
