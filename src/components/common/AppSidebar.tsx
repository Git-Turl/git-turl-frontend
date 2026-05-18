import { Home, BarChart3, MessageSquare, Users, Bell, Mic, Type, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';

interface AppSidebarProps {
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ userProfile }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInterviewPopup, setShowInterviewPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'interview', icon: MessageSquare, label: 'Interview', path: '/interview', hasPopup: true },
    { id: 'community', icon: Users, label: 'Community', path: '/community' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    if (path === '/interview') {
      return location.pathname.startsWith('/interview') || location.pathname.startsWith('/voice-interview');
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-sky-200 flex flex-col shadow-sm">
      {/* 로고 섹션 */}
      <div className="p-6 border-b border-sky-100">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🪶</div>
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

      {/* 사용자 프로필 */}
      {userProfile && (
        <div className="p-4 border-t border-sky-100">
          <Link
            to="/mypage"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors"
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
        </div>
      )}
    </aside>
  );
}
