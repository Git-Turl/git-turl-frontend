import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ProfileCard } from '../../components/common/ProfileCard';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';
import {
  getMyHistory,
  getMyProfile,
  getProfileImage,
  getReportList,
  type GitTurlHistory,
  type ReportListItem,
} from '../../api/member';
import { enumListToStacks } from '../../utils/stackMapping';
import defaultProfile from '../../assets/img/img_profile.svg';

export function MyPage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{
    profileImage: string;
    nickname: string;
    githubId: string;
    techStack: 'frontend' | 'backend' | 'AI';
    preferredStacks: string[];
  }>({
    profileImage: defaultProfile,
    nickname: '로딩 중...',
    githubId: '',
    techStack: 'backend',
    preferredStacks: [],
  });

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [history, setHistory] = useState<GitTurlHistory | null>(null);

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

        // 내 분석본 목록 조회 (공개 요약 카드용 — PUBLIC 만)
        try {
          const reportResponse = await getReportList({
            answerType: 'ALL',
            pageSize: 4,
            status: 'PUBLIC',
          });
          if (reportResponse.isSuccess && reportResponse.result) {
            // 백엔드가 status 필터를 안 지켜주는 경우 방어 — status 필드가 있으면 PUBLIC 만 통과.
            const publicOnly = reportResponse.result.data.filter(
              (r) => r.status === undefined || r.status === 'PUBLIC'
            );
            setReports(publicOnly);
          }
        } catch (reportError) {
          console.error('분석본 목록 로딩 실패:', reportError);
        }

        // 깃털 히스토리 조회
        try {
          const historyResponse = await getMyHistory();
          if (historyResponse.isSuccess && historyResponse.result) {
            setHistory(historyResponse.result);
          }
        } catch (historyError) {
          console.error('히스토리 로딩 실패:', historyError);
        }

        // jobType을 techStack으로 변환
        let techStack: 'frontend' | 'backend' | 'AI' = 'backend';
        if (profile?.jobType === 'FRONTEND') techStack = 'frontend';
        else if (profile?.jobType === 'AI') techStack = 'AI';

        setProfileData({
          profileImage: imageUrl,
          nickname: profile?.nickname || '사용자',
          githubId: profile?.githubId || '',
          techStack,
          preferredStacks: enumListToStacks(profile?.techStackList ?? []),
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
    username: profileData.githubId,
    githubUrl: `https://github.com/${profileData.githubId}`,
  };

  // 내 분석본 데이터를 SummaryCarousel 형식으로 변환
  const summaries = reports.map((report) => ({
    id: String(report.reportId),
    title: report.reportTitle ?? report.repoName ?? `분석본 #${report.reportId}`,
    repository: report.repoName ?? '',
    date: report.createdAt.replace(/-/g, '.'),
    description: report.description || '설명이 없는 분석본입니다.',
    tags: report.questionCount > 0 ? [`질문 ${report.questionCount}개`] : [],
    bookmarked: report.bookmarked ?? false,
  }));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-8 text-gray-900">My Page</h1>

        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 - 프로필 + 히스토리 */}
          <div className="lg:col-span-1 space-y-4">
            <ProfileCard
              profileImage={profileData.profileImage}
              nickname={profileData.nickname}
              githubId={profileData.githubId}
              techStack={profileData.techStack}
              preferredStacks={profileData.preferredStacks}
            />

            {/* 깃털 히스토리 */}
            {history && (
              <div className="p-6 bg-white shadow-sm border border-sky-100 rounded-xl">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  깃털 히스토리
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-sky-600">
                      {history.daysWthGitTurl}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">함께한 일수</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-600">
                      {history.githubReportCount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">분석 리포트</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-600">
                      {history.interviewQuestionCount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">인터뷰 질문</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 컬럼 - GitHub & Summaries */}
          <div className="lg:col-span-2 space-y-6">
            {/* GitHub 통합 */}
            <GitHubCard
              githubUrl={githubData.githubUrl}
              username={githubData.username}
            />

            {/* 공개 요약 */}
            <SummaryCarousel
              summaries={summaries}
              onCardClick={(id) => navigate(`/analytics/detail/${id}`)}
              bookmarkable
            />
          </div>
        </div>
      </div>
    </div>
  );
}
