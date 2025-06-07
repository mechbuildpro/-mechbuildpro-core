export function setTheme(theme: 'light' | 'dark') {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  }
  return 'light';
}
