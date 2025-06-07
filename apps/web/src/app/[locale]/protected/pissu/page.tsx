'use client';

import Protected from '@/components/Protected';
import PageHeader from '@/components/PageHeader';
import AIAciklama from '@/components/AIAciklama';

export default function PissuPage({ params }: { params: { locale: string } }) {
  return (
    <Protected locale={params.locale}>
      <div style={{ padding: 24 }}>
        <PageHeader title="🚽 Modül: Pis Su Tahliye Sistemi" />
        <AIAciklama content="Pis su modülü, atık su tahliye sistemini hesaplar. AI, boru çapı ve eğim optimizasyonu sunar." />
      </div>
    </Protected>
  );
}
