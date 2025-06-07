'use client';

import Protected from '@/components/Protected';
import PageHeader from '@/components/PageHeader';
import AIAciklama from '@/components/AIAciklama';

export default function YagmurPage({ params }: { params: { locale: string } }) {
  return (
    <Protected locale={params.locale}>
      <div style={{ padding: 24 }}>
        <PageHeader title="🌧️ Modül: Yağmur Drenaj Sistemi" />
        <AIAciklama content="Yağmur modülü, çatı yağış yükünü analiz eder. AI, süzgeç yerleşimi ve boru çaplarını önerir." />
      </div>
    </Protected>
  );
}
