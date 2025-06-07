'use client';

export default function Topbar() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      backgroundColor: '#f4f4f4',
      borderBottom: '1px solid #ddd'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 18 }}>🧠 MechBuild Pro</div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select style={{ padding: '4px 8px' }} defaultValue="en">
          <option value="tr">🇹🇷 Türkçe</option>
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 عربي</option>
          <option value="ru">🇷🇺 Русский</option>
        </select>
        <button style={{
          border: 'none',
          background: '#eee',
          padding: '6px 12px',
          borderRadius: 6,
          cursor: 'pointer'
        }}>
          🌙 Theme
        </button>
        <div style={{
          background: '#ddd',
          padding: '6px 10px',
          borderRadius: '50%',
          fontWeight: 'bold',
          fontSize: 14
        }}>
          T
        </div>
      </div>
    </header>
  );
}
