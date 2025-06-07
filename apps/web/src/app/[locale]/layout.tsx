import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

// Get locale config
import i18nConfig from '@/i18n';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'MechBuild Pro',
    description: 'AI destekli mekanik tasarım platformu',
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
