export function getRole(): 'admin' | 'user' | 'guest' {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('userRole') as 'admin' | 'user' | 'guest') || 'guest';
  }
  return 'guest';
}
