import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';
import {
  getMemberProfileByNickname,
  type JobType,
  type MyProfile,
} from '../../api/member';
import defaultProfile from '../../assets/img/img_profile.svg';

// 한글 받침 유무로 이/가 선택. 받침 없으면 가.
const subjectParticle = (name: string) => {
  if (!name) return '이';
  const last = name[name.length - 1];
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '이'; // 한글이 아니면 기본 이
  return (code - 0xac00) % 28 === 0 ? '가' : '이';
};

const JOB_LABEL: Record<JobType, string> = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  AI: 'AI',
};

// ⚠️ 시연용 목업 프로필 — 백엔드 by-nickname endpoint 추가되면 제거.
// 닉네임 매칭되면 API 호출 안 하고 이 값으로 바로 표시.
// profileImage 는 GitHub 공개 아바타 URL — `https://github.com/{user}.png` 형식은
// 어떤 GitHub 사용자든 자동으로 프로필 사진을 반환.
const MOCK_PROFILES: Record<string, MyProfile> = {
  jeongkyueun: {
    nickname: 'jeongkyueun',
    profileImage: 'https://github.com/jeongkyueun.png',
    jobType: 'BACKEND',
    githubId: 'jeongkyueun',
    techStack: ['SPRING_BOOT', 'MYSQL', 'DOCKER'],
  },
  siuoo0819: {
    nickname: 'siuoo0819',
    profileImage: 'https://github.com/siuoo0819.png',
    jobType: 'FRONTEND',
    githubId: 'siuoo0819',
    techStack: ['REACT', 'TYPESCRIPT', 'NEXT_JS'],
  },
};

export function OtherProfile() {
  const { nickname: nicknameParam } = useParams<{ nickname: string }>();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!nicknameParam) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    // 시연용 목업: 매칭되는 닉네임이면 API 호출 안 함.
    const mock = MOCK_PROFILES[nicknameParam];
    if (mock) {
      setProfile(mock);
      setLoading(false);
      return;
    }

    // 라우트 path 는 이미 디코딩된 값이라 그대로 전달 → api 함수가 다시 encode.
    getMemberProfileByNickname(nicknameParam)
      .then((res) => {
        if (cancelled) return;
        if (res.isSuccess === false) {
          setLoadError(res.message || '프로필을 불러오지 못했어요.');
          return;
        }
        setProfile(res.result);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[other-profile] load error', err);
        setLoadError('프로필을 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nicknameParam]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto text-center py-12 text-gray-500">
          로딩 중...
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto text-center py-12 text-gray-500">
          {loadError ?? '프로필이 없습니다.'}
        </div>
      </div>
    );
  }

  const nickname = profile.nickname || '사용자';
  const particle = subjectParticle(nickname);
  const githubUrl = profile.githubId
    ? `https://github.com/${profile.githubId}`
    : '#';
  const avatar = profile.profileImage || defaultProfile;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-8 text-gray-900">{nickname}의 프로필</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 프로필 카드 */}
            <Card className="p-6 bg-white shadow-sm border border-sky-100">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-sky-100">
                  <img
                    src={avatar}
                    alt={nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl mb-1">{nickname}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  @{profile.githubId || 'unknown'}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-sky-100 text-sky-700 hover:bg-sky-100"
                >
                  {JOB_LABEL[profile.jobType] ?? profile.jobType}
                </Badge>
              </div>
            </Card>

            {/* 작성 글/댓글 네비 */}
            <Card className="p-4 bg-white shadow-sm border border-sky-100">
              <nav className="space-y-2">
                <Link
                  to={`/profile/${encodeURIComponent(nickname)}/posts`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span className="text-gray-700">
                    {nickname}
                    {particle} 쓴 글
                  </span>
                </Link>
                <Link
                  to={`/profile/${encodeURIComponent(nickname)}/comments`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
                >
                  <MessageCircle className="w-5 h-5 text-sky-600" />
                  <span className="text-gray-700">
                    {nickname}
                    {particle} 쓴 댓글
                  </span>
                </Link>
              </nav>
            </Card>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-6">
            {/* GitHub */}
            <GitHubCard
              githubUrl={githubUrl}
              username={profile.githubId || 'unknown'}
            />

            {/* 레포지토리 캐러셀 — 타인 레포 API 가 아직 없어 빈 상태 */}
            <SummaryCarousel summaries={[]} />

            {/* 최근 게시물 — 타인 게시물 API 미구현, 임시 placeholder */}
            <Card className="p-6 bg-white shadow-sm border border-sky-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-sky-600" />
                {nickname}의 최근 게시물
              </h3>
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-between p-4 rounded-lg border border-sky-100 bg-sky-50/50 text-left opacity-60 cursor-not-allowed"
              >
                <div>
                  <div className="text-gray-900 font-medium mb-1">
                    최근 게시물 (준비 중)
                  </div>
                  <div className="text-sm text-gray-500">
                    백엔드 API 연결 후 노출됩니다.
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
