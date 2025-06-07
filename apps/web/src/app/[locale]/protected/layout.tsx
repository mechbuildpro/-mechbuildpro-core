import { ClientLayout } from './ClientLayout';

export default async function ProtectedLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ClientLayout locale={params.locale}>
      {children}
    </ClientLayout>
  );
}
