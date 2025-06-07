'use client';

type AIAciklamaProps = {
  content: string;
};

export default function AIAciklama({ content }: AIAciklamaProps) {
  return (
    <div
      style={{
        backgroundColor: '#f0f8ff',
        borderLeft: '4px solid #0070f3',
        padding: '12px 16px',
        borderRadius: 6,
        marginTop: 12,
        fontSize: '14px',
        lineHeight: 1.6,
      }}
    >
      <strong>🧠 AI Açıklaması:</strong> {content}
    </div>
  );
}
