import { useEffect, useState } from 'react';
import { ProfileCard } from '../../components/common/ProfileCard';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';
import { getMyProfile, getProfileImage, getRepositories } from '../../api/member';
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
  const [repositories, setRepositories] = useState<any[]>([]);

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

        // 레포지토리 목록 조회
        try {
          const repoResponse = await getRepositories();
          if (repoResponse.isSuccess && repoResponse.result) {
            setRepositories(repoResponse.result);
          }
        } catch (repoError) {
          console.error('레포지토리 목록 로딩 실패:', repoError);
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

        setLoading(false);
      } catch (error) {
        console.error('프로필 데이터 로딩 실패:', error);
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

  // API에서 받은 레포지토리 데이터를 SummaryCarousel 형식으로 변환
  const summaries = repositories.map((repo, index) => ({
    id: String(index + 1),
    title: repo.name,
    repository: repo.fullName,
    date: new Date(repo.updatedAt).toLocaleDateString('ko-KR'),
    description: repo.description || '설명이 없는 레포지토리입니다.',
    tags: [], // API에서 태그 정보가 없으므로 빈 배열
  }));

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
