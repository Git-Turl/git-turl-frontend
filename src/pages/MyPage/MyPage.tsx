import { ProfileCard } from '../../components/common/ProfileCard';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';

export function MyPage() {
  // 프로필 데이터
  const profileData = {
    profileImage: 'https://images.unsplash.com/photo-1737575655055-e3967cbefd03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzU0OTU1OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    nickname: '김개발',
    githubId: 'developer_kim',
    techStack: 'backend' as const,
  };

  const githubData = {
    username: 'developer_kim',
    githubUrl: 'https://github.com/developer_kim',
  };

  const summaries = [
    {
      id: '1',
      title: 'E-Commerce Platform',
      repository: 'github.com/developer_kim/ecommerce',
      date: '2026.03.15',
      description: 'Full-stack e-commerce solution built with Node.js, Express, and PostgreSQL. Features include user authentication, payment integration, and admin dashboard.',
      tags: ['Node.js', 'Express', 'PostgreSQL'],
    },
    {
      id: '2',
      title: 'Task Management API',
      repository: 'github.com/developer_kim/task-api',
      date: '2026.02.20',
      description: 'RESTful API for task management with JWT authentication, real-time updates using WebSocket, and comprehensive test coverage.',
      tags: ['REST API', 'WebSocket', 'JWT'],
    },
    {
      id: '3',
      title: 'Microservices Architecture',
      repository: 'github.com/developer_kim/microservices',
      date: '2026.01.10',
      description: 'Scalable microservices architecture using Docker, Kubernetes, and message queues for inter-service communication.',
      tags: ['Docker', 'Kubernetes', 'RabbitMQ'],
    },
    {
      id: '4',
      title: 'GraphQL Server',
      repository: 'github.com/developer_kim/graphql-server',
      date: '2025.12.05',
      description: 'GraphQL API server with type-safe schema, data loaders for optimization, and comprehensive mutation handling.',
      tags: ['GraphQL', 'Apollo', 'TypeScript'],
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-8 text-gray-900">My Page</h1>
        
        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 - 프로필 */}
          <div className="lg:col-span-1">
            <ProfileCard
              profileImage={profileData.profileImage}
              nickname={profileData.nickname}
              githubId={profileData.githubId}
              techStack={profileData.techStack}
            />
          </div>
          
          {/* 오른쪽 컬럼 - GitHub & Summaries */}
          <div className="lg:col-span-2 space-y-6">
            {/* GitHub 통합 */}
            <GitHubCard
              githubUrl={githubData.githubUrl}
              username={githubData.username}
            />
            
            {/* 공개 요약 */}
            <SummaryCarousel summaries={summaries} />
          </div>
        </div>
      </div>
    </div>
  );
}
