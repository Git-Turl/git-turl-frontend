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
      title: '쇼핑몰 클론코딩',
      repository: 'github.com/developer_kim/ecommerce',
      date: '2026.03.15',
      description: 'Node.js와 Express 기반의 쇼핑몰 형태 프로젝트로 보입니다. 로그인, 상품 조회, 장바구니 기능이 구현되어 있는 것으로 추정됩니다.',
      tags: ['Node.js', 'Express', 'PostgreSQL'],
    },
    {
      id: '2',
      title: '작업 관리 API',
      repository: 'github.com/developer_kim/task-api',
      date: '2026.02.20',
      description: 'JWT 인증을 사용하는 Todo 관리 API로 보입니다. 기본적인 CRUD 기능과 인증 흐름이 구현된 것으로 확인됩니다.',
      tags: ['REST API', 'JWT', 'Node.js'],
    },
    {
      id: '3',
      title: 'Docker 배포 연습',
      repository: 'github.com/developer_kim/microservices',
      date: '2026.01.10',
      description: 'Docker를 활용한 서버 배포 연습용 프로젝트로 보입니다. EC2 환경에서 실행을 시도한 흔적이 확인됩니다.',
      tags: ['Docker', 'EC2'],
    },
    {
      id: '4',
      title: 'GraphQL 서버',
      repository: 'github.com/developer_kim/graphql-server',
      date: '2025.12.05',
      description: 'Apollo Server 기반의 GraphQL API 프로젝트로 추정됩니다. 기본적인 Query 및 Mutation 구조가 포함된 것으로 보입니다.',
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
