import { useEffect, useState, type ReactNode } from 'react';
import { Monitor } from 'lucide-react';

const MOBILE_BREAKPOINT = 768;

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

export function MobileBlock({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileViewport());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#F0F9FF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#00AEEF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Monitor size={32} color="white" />
      </div>
      <p
        style={{
          color: '#0E2248',
          fontSize: 22,
          fontFamily: 'Inter',
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        PC 환경에서만 이용 가능합니다
      </p>
      <p
        style={{
          color: '#828282',
          fontSize: 15,
          fontFamily: 'Inter',
          fontWeight: 500,
          lineHeight: 1.6,
        }}
      >
        깃털은 현재 모바일 화면을 지원하지 않습니다.
        <br />
        PC로 접속해 다시 시도해주세요.
      </p>
    </div>
  );
}
