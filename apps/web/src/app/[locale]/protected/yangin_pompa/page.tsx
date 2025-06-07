'use client';

import Protected from '@/components/Protected';
import PageHeader from '@/components/PageHeader';
import AIAciklama from '@/components/AIAciklama';

export default function YanginPompaPage({ params }: { params: { locale: string } }) {
  return (
    <Protected locale={params.locale}>
      <div style={{ padding: 24 }}>
        <PageHeader title="💧 Modül: Yangın Pompası Seçimi" />
        <AIAciklama content="Yangın pompası modülü, basınç ve debi ihtiyaçlarına göre pompa seçimi yapar. AI, yedekleme senaryoları önerir." />
      </div>
    </Protected>
  );
}
