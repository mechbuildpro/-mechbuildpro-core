# Entegrasyon Modülü

Bu belge, Entegrasyon modülünün mevcut durumunu, özelliklerini, bileşenlerini ve bilinen sorunlarını özetlemektedir.

## Genel Bakış

Entegrasyon modülü, sistem genelindeki çeşitli süreçlerin ve veri akışlarının yönetilmesinden sorumludur. İş akışı yönetimi, bildirim sistemi ve veri senkronizasyonu gibi temel işlevleri içerir.

## Özellikler

- **İş Akışı Yönetimi Enhancements:** İş akışı geçmişi takibi, yorum ekleme ve durum güncellemeleri gibi özellikler eklenerek iş akışı yönetimi yetenekleri geliştirilmiştir.
- **Bildirim Sistemi Enhancements:** Bildirim öncelikleri, bildirim gruplama ve iyileştirilmiş bildirim yönetimi için yeni yapılar eklenmiştir.
- **Veri Senkronizasyon Katmanı:** Çevrimdışı destek, çakışma çözümü ve yeniden deneme mantığı ile daha sağlam bir veri senkronizasyon katmanı uygulanmıştır. Değişiklikler yerel depolama kullanılarak sıralanmaktadır.

## Bileşenler

- `blocks/project-management/integration/Component.tsx`: Entegrasyon modülünün ana kullanıcı arayüzü bileşeni. Çeşitli entegrasyon özelliklerini (iş akışı, bildirimler, senkronizasyon durumu) bir araya getirir ve kullanıcı etkileşimlerini yönetir.
- `blocks/project-management/integration/logic.ts`: Modülün iş mantığını, veri yönetimi hook'unu (`useIntegrationManagement`), veri senkronizasyon mekanizmalarını (`syncData`, `queueChange`), iş akışı fonksiyonlarını (`getWorkflowHistory`, `addWorkflowComment`), ve temel güvenlik kontrollerini içerir.
- `blocks/project-management/integration/notifications.ts`: Bildirim nesnelerinin oluşturulması (`createNotification`) ve bildirimlerin gruplanması (`groupNotifications`) gibi bildirim sistemi ile ilgili yardımcı fonksiyonları ve tipleri barındırır.
- `blocks/project-management/integration/NotificationCenter.tsx`: Kullanıcı arayüzünde bildirimleri görüntüleyen bileşen. Gelen bildirimleri işler ve kullanıcıya sunar, ayrıca senkronizasyon durumunu da gösterebilir.
- `blocks/project-management/integration/export.ts`: Entegrasyon verilerinin farklı formatlarda (PDF, Excel, vb.) dışa aktarılması için fonksiyonları (`exportAllReports`, `formatIntegrationDataForReport`) içerir. Harici kütüphane bağımlılıkları vardır.

## Bilinen Sorunlar ve Gelecek Çalışmalar

- **Sistemik Sorunlar:** Dosya okuma ve karmaşık kod düzenlemeleri uygulama konusunda kalıcı sorunlar yaşanmaktadır. Özellikle bazı dosyalarda okuma zaman aşımına uğramakta ve büyük veya çok adımlı düzenlemeler tutarlı bir şekilde uygulanamamaktadır. Bu durum, hata giderme ve yeni özelliklerin geliştirilmesini ciddi şekilde etkilemektedir.
- **Güvenlik:** Kimlik doğrulama ve yetkilendirme için mevcut kontroller (`isAdmin` gibi) yalnızca yer tutucudur. Üretim ortamları için gerçek bir kullanıcı kimlik doğrulama ve yetkilendirme sistemi ile değiştirilmesi gerekmektedir.
- **Dışa Aktarma Fonksiyonelliği:** Temel dışa aktarma yapısı ve UI bağlantısı kurulmuş olsa da, gerekli harici kütüphanelerin (xlsx, jspdf gibi) kurulumu ve kullanımıyla ilgili kalıcı paket yönetimi sorunları ve ilgili karmaşık düzenlemeleri uygulama sınırlamaları nedeniyle tam olarak işlevsel değildir. CSV ve JSON formatları için de ek çalışma gerekmektedir.
- **Test Kapsamı:** Unit test kapsamını genişletme çabaları, devam eden paket kurulum sorunları (gerekli test kütüphanelerinin yüklenememesi) ve test dosyalarına karmaşık düzenlemeler uygulama zorlukları nedeniyle engellenmiştir. Mevcut testler temel senaryoları kapsamaktadır.

## Kurulum ve Çalıştırma

_(Bu bölüm, sistemik sorunlar çözüldükten sonra veya daha fazla bilgi toplandıktan sonra detaylandırılacaktır.)_

## Kullanım

_(Bu bölüm, modülün nasıl kullanılacağını açıklamak için daha fazla detay içerecektir.)_ 