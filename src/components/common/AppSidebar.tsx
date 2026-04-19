import { Home, BarChart3, MessageSquare, Users, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface AppSidebarProps {
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ userProfile }: AppSidebarProps) {
  const location = useLocation();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'interview', icon: MessageSquare, label: 'Interview', path: '/interview' },
    { id: 'community', icon: Users, label: 'Community', path: '/community' },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
            to="/"
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
