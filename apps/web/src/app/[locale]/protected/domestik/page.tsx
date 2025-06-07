'use client';

import Protected from '@/components/Protected';
import PageHeader from '@/components/PageHeader';
import AIAciklama from '@/components/AIAciklama';

export default function TemizsuPage({ params }: { params: { locale: string } }) {
  return (
    <Protected locale={params.locale}>
      <div style={{ padding: 24 }}>
        <PageHeader title="🚰 Modül: Temiz Su Tesisatı" />
        <AIAciklama content="Temiz su modülü, kullanım suyu debileri, boru çapları ve cihazlara göre hat planlamasını yapar. AI, konfor ve verim dengesine göre öneride bulunur." />
      </div>
    </Protected>
  );
}
