// app/test/layout.tsx
export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>테스트 페이지</h1>
      {children}
    </div>
  );
}
