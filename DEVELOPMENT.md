# Geliştirici Kılavuzu

Bu belge, MechBuild Core projesinde geliştirme yapmak isteyenler için bir başlangıç kılavuzudur.

## Başlangıç

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Git
- Modern bir IDE (VS Code önerilir)

### Kurulum
1. Projeyi klonlayın:
   ```bash
   git clone [repo-url]
   cd mechbuild-core
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Geliştirme İş Akışı

### 1. Yeni Modül Oluşturma

1. `blocks/` dizini altında yeni bir modül dizini oluşturun:
   ```bash
   mkdir blocks/new-module
   ```

2. Temel dosya yapısını oluşturun:
   ```bash
   touch blocks/new-module/{Component.tsx,logic.ts,types.ts,README.md}
   mkdir blocks/new-module/__tests__
   ```

3. README.md dosyasını düzenleyin ve modülün amacını, özelliklerini ve kullanımını belgeleyin.

### 2. Kod Yazma Standartları

#### TypeScript
- Kesin tip tanımlamaları kullanın
- Interface'leri tercih edin
- Generic tipleri uygun şekilde kullanın
- Tip güvenliğini koruyun

#### React Bileşenleri
- Fonksiyonel bileşenler kullanın
- Props için interface tanımlayın
- Hooks'ları uygun şekilde kullanın
- Performans optimizasyonlarını göz önünde bulundurun

#### Stil
- CSS Modules kullanın
- BEM metodolojisini takip edin
- Responsive tasarım prensiplerini uygulayın
- Erişilebilirlik standartlarını gözetin

### 3. Test Yazma

1. Birim testleri için:
   ```typescript
   // __tests__/logic.test.ts
   import { renderHook } from '@testing-library/react-hooks';
   import { useYourHook } from '../logic';

   describe('useYourHook', () => {
     it('should work as expected', () => {
       const { result } = renderHook(() => useYourHook());
       expect(result.current).toBeDefined();
     });
   });
   ```

2. Bileşen testleri için:
   ```typescript
   // __tests__/Component.test.tsx
   import { render, screen } from '@testing-library/react';
   import Component from '../Component';

   describe('Component', () => {
     it('should render correctly', () => {
       render(<Component />);
       expect(screen.getByText('Expected Text')).toBeInTheDocument();
     });
   });
   ```

### 4. Hata Ayıklama

1. Konsol loglarını kullanın:
   ```typescript
   console.log('Debug:', { variable });
   ```

2. React Developer Tools kullanın
3. Network isteklerini izleyin
4. State değişikliklerini takip edin

## Modül Geliştirme İpuçları

### 1. State Yönetimi
- Local state için `useState`
- Complex state için `useReducer`
- Global state için Context API
- Side effects için `useEffect`

### 2. Form Yönetimi
- React Hook Form kullanın
- Form validasyonu için Zod veya Yup
- Error handling için try-catch
- Loading states için flags

### 3. API İletişimi
- Axios veya fetch kullanın
- Error boundaries implement edin
- Loading states yönetin
- Retry logic ekleyin

### 4. Performans Optimizasyonu
- `useMemo` ve `useCallback` kullanın
- Gereksiz render'ları önleyin
- Code splitting uygulayın
- Bundle size'ı optimize edin

## Yaygın Sorunlar ve Çözümleri

### 1. Paket Yönetimi Sorunları
- `node_modules` klasörünü silip yeniden yükleyin
- `package-lock.json` dosyasını güncelleyin
- Versiyon uyumsuzluklarını kontrol edin

### 2. TypeScript Hataları
- Tip tanımlamalarını kontrol edin
- Generic tipleri doğru kullanın
- Strict mode'u aktif tutun

### 3. Test Sorunları
- Mock'ları doğru yapılandırın
- Async testleri düzgün handle edin
- Test coverage'ı artırın

## Katkıda Bulunma

1. Yeni bir branch oluşturun:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Değişikliklerinizi commit edin:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Branch'inizi push edin:
   ```bash
   git push origin feature/your-feature
   ```

4. Pull request oluşturun

## Kaynaklar

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) 