interface PageHeaderProps {
  title: string;
  subtitle?: string; // Opsiyonel alt başlık desteği
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
