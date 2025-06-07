import createMiddleware from 'next-intl/middleware';

const locales = ['tr', 'en', 'ar', 'ru'] as const;
const defaultLocale = 'en';

export default createMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  matcher: ['/', '/(tr|en|ar|ru)/:path*'],
};
