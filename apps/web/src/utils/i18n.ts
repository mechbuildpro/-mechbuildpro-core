import {notFound} from 'next/navigation';
import i18nConfig from '@/lib/i18n';

export async function getMessages(locale: string) {
  if (!i18nConfig.locales.includes(locale)) notFound();

  return import(`../messages/${locale}.json`).then(module => module.default);
} 