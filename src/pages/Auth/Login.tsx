import githubIcon from '../../assets/img/github.svg';

export function Login() {
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
      {/* 왼쪽 GitHub 원 (3겹 구조) */}
      <div
        style={{ width: 500, height: 500, position: 'relative', flexShrink: 0 }}
      >
        {/* 1. 바깥쪽 점선 원 */}
        <div
          style={{
            width: 500,
            height: 500,
            position: 'absolute',
            borderRadius: '50%',
            border: '3px #B8E6FE dashed',
          }}
        />
        {/* 2. 중간 연한 파란색 원 (투명도 76%) */}
        <div
          style={{
            width: 440,
            height: 440,
            left: 30,
            top: 30,
            position: 'absolute',
            background: '#B8E6FE',
            borderRadius: '50%',
          }}
        />
        {/* 3. 안쪽 진한 파란 원 */}
        <div
          style={{
            width: 380,
            height: 380,
            left: 60,
            top: 60,
            position: 'absolute',
            background: '#00AEEF',
            borderRadius: '50%',
          }}
        />
        {/* 4. GitHub 아이콘 */}
        <img
          src={githubIcon}
          alt="GitHub"
          style={{
            width: 240,
            height: 240,
            left: 130,
            top: 130,
            position: 'absolute',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* 오른쪽 로그인 영역 */}
      <div style={{ width: 600, position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            color: '#0E2248',
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: 600,
            marginBottom: 40,
          }}
        >
          깃털에 로그인
        </div>
        <button
          onClick={() => {
            window.location.href = import.meta.env.VITE_GITHUB_OAUTH_URL;
          }}
          style={{
            width: '100%',
            height: 121,
            background: '#00AEEF',
            border: 'none',
            color: 'white',
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 600,
            letterSpacing: 0.32,
            cursor: 'pointer',
            marginBottom: 28,
            borderRadius: 14,
          }}
        >
          Github로 로그인
        </button>
        <div
          style={{
            width: '100%',
            height: 1,
            background: '#A6A6A6',
            marginBottom: 24,
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              color: '#9C9C9C',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 420,
            }}
          >
            GitHub에 처음이신가요?&nbsp;&nbsp;
          </span>
          <span
            style={{
              color: '#00AEEF',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}
