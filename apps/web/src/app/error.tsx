'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <h2>Bir hata oluştu: {error.message}</h2>
      <button onClick={() => reset()}>Yeniden Dene</button>
    </>
  );
}
