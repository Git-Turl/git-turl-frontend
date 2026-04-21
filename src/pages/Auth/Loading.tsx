import { useEffect } from 'react';
import githubIcon from '../../assets/img/github.svg';

export function Loading() {
  useEffect(() => {
    // URL에서 route와 token 추출
    // 예: /login/loading?route=signup&token=xxx
    const urlParams = new URLSearchParams(window.location.search);
    const route = urlParams.get('route');
    const token = urlParams.get('token');

    console.log('=== Loading 페이지 진입 ===');
    console.log('route:', route);
    console.log('token:', token ? '받음' : '없음');

    // 토큰이 없으면 랜딩으로
    if (!token) {
      console.error('토큰이 없습니다!');
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
      window.location.href = '/onboarding';
      return;
    }

    // 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', token);
    console.log('토큰 저장 완료!');

    // "연동 중..." 화면 1.5초 보여준 후 이동
    const timer = setTimeout(() => {
      if (route === 'signup') {
        console.log('신규 유저 → /signup 이동');
        window.location.href = '/signup';
      } else if (route === 'home') {
        console.log('기존 유저 → /home 이동');
        window.location.href = '/home';
      } else {
        console.warn('알 수 없는 route:', route);
        window.location.href = '/home';
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#F0F9FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        gap: 100,
      }}
    >
      {/* 왼쪽 GitHub 원 */}
      <div
        style={{ width: 500, height: 500, position: 'relative', flexShrink: 0 }}
      >
        {/* 점선 테두리 (제일 바깥) */}
        <div
          style={{
            width: 500,
            height: 500,
            position: 'absolute',
            borderRadius: '50%',
            border: '3px #B8E6FE dashed',
          }}
        />
        {/* 연한 파란 원 (중간) */}
        <div
          style={{
            width: 440,
            height: 440,
            left: 30,
            top: 30,
            position: 'absolute',
            background: '#D6E9FF',
            borderRadius: '50%',
          }}
        />
        {/* 진한 파란 원 + GitHub 아이콘 (제일 안) */}
        <div
          style={{
            width: 380,
            height: 380,
            left: 60,
            top: 60,
            position: 'absolute',
            background: '#00AEEF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={githubIcon}
            alt="GitHub"
            style={{
              width: 240,
              height: 240,
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
      </div>

      {/* 오른쪽 텍스트 */}
      <div style={{ width: 600, textAlign: 'center' }}>
        <div
          style={{
            color: '#9C9C9C',
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: 600,
            marginBottom: 30,
          }}
        >
          깃허브 연동 중 · · ·
        </div>
        <div
          style={{
            color: '#9C9C9C',
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 420,
          }}
        >
          잠시만 기다려주세요
        </div>
      </div>
    </div>
  );
}