# Test Stratejisi

Bu belge, MechBuild Core projesinin test stratejisini detaylandırmaktadır.

## Genel Bakış

Projede yazılım kalitesini ve güvenilirliğini sağlamak amacıyla kapsamlı bir test yaklaşımı benimsenmiştir. Farklı seviyelerde testler uygulanarak hem bireysel bileşenlerin hem de sistemin bütünüyle doğru çalıştığından emin olunur.

## Test Türleri

### 1. Birim Testleri (Unit Tests)
- **Amaç:** Uygulamanın en küçük bağımsız birimlerinin (fonksiyonlar, metodlar, küçük bileşenler) doğruluğunu test etmek.
- **Kapsam:** İş mantığı fonksiyonları, yardımcı fonksiyonlar, saf bileşenler.
- **Araçlar:** Jest, React Testing Library.

### 2. Entegrasyon Testleri (Integration Tests)
- **Amaç:** Farklı birimlerin veya modüllerin bir araya gelerek doğru şekilde etkileşimde bulunduğunu test etmek.
- **Kapsam:** Modüller arası iletişim, API entegrasyonları, bileşenlerin state yönetimi ile etkileşimi.
- **Araçlar:** Jest, React Testing Library, jest-fetch-mock (API mocklama için).

### 3. Uçtan Uca Testler (End-to-End Tests - Planlanan)
- **Amaç:** Kullanıcı akışlarını baştan sona test ederek tüm sistemin beklenen şekilde çalıştığını doğrulamak.
- **Kapsam:** Kullanıcı arayüzü etkileşimleri, veri akışları, backend entegrasyonları.
- **Araçlar:** Cypress, Playwright (Planlanan).

## Test Ortamı ve Araçları

- **Test Framework:** Jest
- **React Testleri:** React Testing Library (@testing-library/react, @testing-library/react-hooks - uyumluluk notlarına bakınız)
- **API Mocking:** jest-fetch-mock
- **TypeScript Desteği:** ts-jest
- **Test Ortamı:** jest-environment-jsdom

## Testlerin Çalıştırılması

Testler, projenin kök dizininde aşağıdaki komutlarla çalıştırılabilir:

- Tüm testleri çalıştırma:
  ```bash
  npm test
  ```
- Belirli bir test dosyasını çalıştırma:
  ```bash
  npm test path/to/your/test.test.ts
  ```
- Değişiklikleri izleyerek testleri otomatik çalıştırma:
  ```bash
  npm test --watch
  ```

## Test Yazma Kılavuzu

- Her yeni fonksiyon, hook veya bileşen için ilgili test dosyasını oluşturun (`__tests__` dizini altında).
- Test senaryolarını açık ve anlaşılır bir şekilde tanımlayın (`describe`, `it`).
- Farklı giriş senaryolarını (başarılı, hatalı, kenar durumlar) kapsayan testler yazın.
- Mocking tekniklerini (jest.fn, jest.spyOn, fetch mock) uygun şekilde kullanın.
- React bileşen testlerinde kullanıcı etkileşimlerini simüle etmek için React Testing Library'nin sorgu metodlarını tercih edin.

## Bilinen Sorunlar ve Zorluklar

Test altyapısının kurulması ve sürdürülmesi sırasında bazı zorluklarla karşılaşılmıştır:

- **Paket Uyumsuzlukları:** Özellikle `@testing-library/react-hooks` ve React 18 arasındaki versiyon uyumsuzlukları yaşanmıştır. Bu durum, `@testing-library/react` gibi alternatiflere yönelmemize neden olmuştur.
- **Test Ortamı Kurulumu:** `jest-environment-jsdom` gibi test ortamı bağımlılıklarının kurulumunda zaman zaman sorunlar yaşanmıştır.
- **Kompleks Mocking:** API entegrasyonları ve diğer dış bağımlılıkların mocking'i, testlerin karmaşıklığını artırabilmektedir.
- **Sistemik Sorunlar:** Genel paket yönetimi ve dosya düzenleme sorunları, test dosyalarının oluşturulması ve güncellenmesini de etkilemiştir.

## Gelecek Çalışmalar

- Uçtan Uca (E2E) test altyapısının kurulması.
- Test kapsamı raporlarının otomatik oluşturulması ve CI/CD pipeline'ına entegrasyonu.
- Daha karmaşık entegrasyon senaryoları için testlerin genişletilmesi.
- Performans testleri ve yük testleri altyapısının araştırılması.

## Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/docs/)
- [React Testing Library Dokümantasyonu](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-fetch-mock Dokümantasyonu](https://www.npmjs.com/package/jest-fetch-mock) 