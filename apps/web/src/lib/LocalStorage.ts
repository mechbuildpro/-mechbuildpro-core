export const languages = {
  tr: {
    logout: 'Çıkış Yap',
    login: 'Giriş Yap',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    loginFailed: 'Geçersiz kullanıcı adı veya şifre.',
  },
  en: {
    logout: 'Logout',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginFailed: 'Invalid username or password.',
  }
};

export function t(key: keyof typeof languages['tr'], locale: 'tr' | 'en' = 'tr') {
  return languages[locale][key];
}
