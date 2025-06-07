# Common Modülü

Bu modül, projenin genelinde kullanılan ortak bileşenleri ve fonksiyonları içerir.

## İçerik

- `Component.tsx`: Temel UI bileşenleri
- `Form.tsx`: Form yönetimi ve validasyon
- `logic.ts`: Ortak hesaplama ve işlem fonksiyonları
- `export.ts`: Modül dışa aktarımları

## Kullanım

Bu modül, diğer tüm modüller tarafından kullanılabilir. Örnek:

```typescript
import { Component, Form, calculate } from '@blocks/common';
```
