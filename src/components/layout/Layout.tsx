import { Outlet } from 'react-router';
import { AppSidebar } from '../common/AppSidebar';

export function Layout() {
  const userProfile = {
    name: '김개발',
    email: 'dev@example.com',
    avatar: 'https://images.unsplash.com/photo-1737575655055-e3967cbefd03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzU0OTU1OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <AppSidebar userProfile={userProfile} />
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
}
