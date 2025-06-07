import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['tr', 'en', 'ar', 'ru'];

export default getRequestConfig(async ({locale}) => {
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    locale: locale
  };
}); 