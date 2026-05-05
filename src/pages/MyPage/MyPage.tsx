import { useEffect, useState } from 'react';
import { ProfileCard } from '../../components/common/ProfileCard';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';
import { getMyProfile, getProfileImage } from '../../api/member';
import defaultProfile from '../../assets/img/img_profile.svg';

export function MyPage() {
  const [profileData, setProfileData] = useState<{
    profileImage: string;
    nickname: string;
    githubId: string;
    techStack: 'frontend' | 'backend' | 'ai';
  }>({
    profileImage: defaultProfile,
    nickname: '로딩 중...',
    githubId: '',
    techStack: 'backend',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 프로필 정보 조회
        const profileResponse = await getMyProfile();
        const profile = profileResponse.result;

        // 프로필 이미지 조회
        let imageUrl = defaultProfile;
        try {
          const imageResponse = await getProfileImage();
          if (imageResponse.result?.profileImage) {
            imageUrl = imageResponse.result.profileImage;
          }
        } catch (imageError) {
          console.log('프로필 이미지가 없습니다. 기본 이미지를 사용합니다.');
        }

        // jobType을 techStack으로 변환
        let techStack: 'frontend' | 'backend' | 'ai' = 'backend';
        if (profile?.jobType === 'FRONTEND') techStack = 'frontend';
        else if (profile?.jobType === 'AI') techStack = 'ai';

        setProfileData({
          profileImage: imageUrl,
          nickname: profile?.nickname || '사용자',
          githubId: profile?.githubId || '',
          techStack,
        });
      } catch (error) {
        console.error('프로필 정보를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

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
