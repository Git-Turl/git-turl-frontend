import { Home, BarChart3, MessageSquare, Users, Bell } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
}

export function Sidebar({ activeTab = 'home' }: SidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'interview', icon: MessageSquare, label: 'Interview' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-sky-200 flex flex-col items-center py-8 gap-8 shadow-sm">
      {/* 로고 */}
      <div className="text-2xl mb-4">🍀</div>
      
      {/* 네비게이션 아이템 */}
      <nav className="flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              className={`p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-400 hover:text-sky-600 hover:bg-sky-50'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}