import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['tr', 'en', 'ar', 'ru'],

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'tr',

  // Disable automatic locale detection
  localeDetection: false
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 