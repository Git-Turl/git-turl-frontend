import { Home, BarChart3, MessageSquare, Users, Bell, Mic, Type, ChevronRight, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { logout as logoutApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import gitturlLogo from '../../assets/logo/gitturl-logo.svg';

interface AppSidebarProps {
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
  };
  isNotificationOpen?: boolean;
  onNotificationClick?: () => void;
}

export function AppSidebar({
  userProfile,
  isNotificationOpen = false,
  onNotificationClick,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInterviewPopup, setShowInterviewPopup] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const storeLogout = useAuthStore((s) => s.logout);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loggingOut) return;
    if (!confirm('로그아웃하시겠습니까?')) return;
    setLoggingOut(true);
    try {
      // 1) 서버: refresh token 삭제 + 쿠키 만료
      await logoutApi().catch((err: unknown) => {
        const e = err as { response?: { data?: { code?: string } } };
        const code = e?.response?.data?.code;
        // AUTH404_1: 리프레시 토큰이 이미 없음 = 사실상 이미 로그아웃 상태이므로 정상 처리
        if (code === 'AUTH404_1') return;
        // 그 외 (네트워크 에러 등) 만 경고 — 클라이언트 정리는 어차피 진행
        console.warn('[AppSidebar] 로그아웃 API 실패, 클라이언트 정리만 진행', err);
      });
    } finally {
      // 2) 클라이언트: accessToken 등 메모리 + localStorage 정리
      storeLogout();
      localStorage.removeItem('userInfo');
      setLoggingOut(false);
      navigate('/login');
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'interview', icon: MessageSquare, label: 'Interview', path: '/interview', hasPopup: true },
    { id: 'community', icon: Users, label: 'Community', path: '/community' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/notifications', isDrawer: true },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    if (path === '/interview') {
      return location.pathname.startsWith('/interview') || location.pathname.startsWith('/voice-interview');
    }
    if (path === '/notifications') {
      return isNotificationOpen;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowInterviewPopup(false);
      }
    }
    if (showInterviewPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInterviewPopup]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-sky-200 flex flex-col shadow-sm z-50 print:hidden">
      {/* 로고 섹션 */}
      <div className="p-6 border-b border-sky-100">
        <div className="flex items-center gap-3">
          <img
            src={gitturlLogo}
            alt="깃털"
            className="w-14 h-14 object-contain"
          />
          <div>
            <h1 className="text-xl text-sky-600">깃털</h1>
            <p className="text-xs text-gray-500">Git-turl</p>
          </div>
        </div>
      </div>
      
      {/* 네비게이션 아이템 */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.isDrawer) {
            return (
              <button
                key={item.id}
                onClick={onNotificationClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm flex-1 text-left">{item.label}</span>
              </button>
            );
          }

          if (item.hasPopup) {
            return (
              <div key={item.id} className="relative" ref={popupRef}>
                <button
                  onClick={() => setShowInterviewPopup((prev) => !prev)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showInterviewPopup ? 'rotate-90' : ''}`} />
                </button>

                {showInterviewPopup && (
                  <div className="absolute left-full top-0 ml-2 w-52 bg-white border border-sky-100 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { navigate('/interview'); setShowInterviewPopup(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 text-gray-700 hover:text-sky-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                          <Type className="w-4 h-4 text-sky-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">텍스트 면접</p>
                          <p className="text-xs text-gray-400">답변을 직접 입력</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { navigate('/voice-interview'); setShowInterviewPopup(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 text-gray-700 hover:text-sky-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-sky-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">음성 면접</p>
                          <p className="text-xs text-gray-400">목소리로 답변 녹음</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 사용자 프로필 + 로그아웃 */}
      {userProfile && (
        <div className="p-4 border-t border-sky-100">
          <div className="flex items-center gap-2">
            <Link
              to="/mypage"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors flex-1 min-w-0"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-10 h-10 rounded-full ring-2 ring-sky-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{userProfile.name}</p>
                <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="로그아웃"
              aria-label="로그아웃"
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                loggingOut
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
