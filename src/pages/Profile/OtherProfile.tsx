import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { FileText, MessageCircle, ChevronRight, Heart } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { GitHubCard } from '../../components/common/GitHubCard';
import { SummaryCarousel } from '../../components/common/SummaryCarousel';
import {
  getMemberBoards,
  getMemberComments,
  getMemberProfile,
  getMemberReports,
  getMyBoards,
  getMyComments,
  getMyProfile,
  type JobType,
  type MemberBoardItem,
  type MemberCommentItem,
  type MemberReportItem,
  type MyProfile,
} from '../../api/member';
import defaultProfile from '../../assets/img/img_profile.svg';

const JOB_LABEL: Record<JobType, string> = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  AI : 'AI',
  ETC : '기타'
};

// "2026-04-08T01:40:00" → "2026.04.08"
const formatDate = (iso: string) =>
  iso ? iso.slice(0, 10).replace(/-/g, '.') : '';

export function OtherProfile() {
  const { memberId: memberIdParam } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [myBoards, setMyBoards] = useState<MemberBoardItem[]>([]);
  const [myComments, setMyComments] = useState<MemberCommentItem[]>([]);
  const [publicReports, setPublicReports] = useState<MemberReportItem[]>([]);

  // URL 의 memberId 와 내 memberId 비교 → 본인 여부 판별.
  const memberIdNum = memberIdParam ? Number(memberIdParam) : NaN;
  const myMemberIdRaw = localStorage.getItem('myMemberId');
  const myMemberId = myMemberIdRaw ? Number(myMemberIdRaw) : null;
  const isSelf =
    Number.isFinite(memberIdNum) && myMemberId === memberIdNum;

  useEffect(() => {
    if (!Number.isFinite(memberIdNum)) {
      setLoadError('잘못된 프로필입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setMyBoards([]);
    setMyComments([]);
    setPublicReports([]);

    if (isSelf) {
      // 본인 — /me 엔드포인트 사용
      Promise.all([
        getMyProfile(),
        getMyBoards({ sort: 'latest', page: 0, size: 2 }),
        getMyComments({ sort: 'latest', page: 0, size: 2 }),
      ])
        .then(([profRes, boardsRes, commentsRes]) => {
          if (cancelled) return;
          if (profRes.isSuccess && profRes.result) setProfile(profRes.result);
          else setLoadError(profRes.message || '프로필을 불러오지 못했어요.');

          if (boardsRes.isSuccess && boardsRes.result?.boardList) {
            setMyBoards(boardsRes.result.boardList);
          }
          if (commentsRes.isSuccess && commentsRes.result?.commentList) {
            setMyComments(commentsRes.result.commentList);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('[self-profile] load error', err);
          setLoadError('프로필을 불러오지 못했어요.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    // 타인 — memberId 기반 엔드포인트
    Promise.all([
      getMemberProfile(memberIdNum),
      getMemberBoards(memberIdNum, { sort: 'latest', page: 0, size: 2 }),
      getMemberComments(memberIdNum, { sort: 'latest', page: 0, size: 2 }),
      // 공개 요약본 — 빈 결과는 result 없이 정상 응답(REPORT200_8)이라 catch 없이 처리
      getMemberReports(memberIdNum, { pageSize: 10 }),
    ])
      .then(([profRes, boardsRes, commentsRes, reportsRes]) => {
        if (cancelled) return;
        if (profRes.isSuccess && profRes.result) {
          setProfile(profRes.result);
        } else {
          setLoadError(profRes.message || '프로필을 불러오지 못했어요.');
        }
        if (boardsRes.isSuccess && boardsRes.result?.boardList) {
          setMyBoards(boardsRes.result.boardList);
        }
        if (commentsRes.isSuccess && commentsRes.result?.commentList) {
          setMyComments(commentsRes.result.commentList);
        }
        if (reportsRes.isSuccess && reportsRes.result?.data) {
          // 목록 API 가 PRIVATE 도 섞어서 주는 케이스 방어 — status 필드가 있으면 PUBLIC 만 통과.
          // 필드 없으면(구버전) 전부 통과.
          const publicOnly = reportsRes.result.data.filter(
            (r) => r.status === undefined || r.status === 'PUBLIC'
          );
          setPublicReports(publicOnly);
        }
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
  }, [memberIdNum, isSelf]);

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
  const githubUrl = profile.githubId
    ? `https://github.com/${profile.githubId}`
    : '#';
  const avatar = profile.profileImage || defaultProfile;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl mb-8 text-gray-900">
          {isSelf ? '내 프로필' : `${nickname}의 프로필`}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="lg:col-span-1 space-y-4">
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

            <Card className="p-4 bg-white shadow-sm border border-sky-100">
              <nav className="space-y-2">
                <Link
                  to={`/profile/${memberIdNum}/posts`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span className="text-gray-700">
                    게시글{' '}
                    <span className="text-sky-600">({myBoards.length})</span>
                  </span>
                </Link>
                <Link
                  to={`/profile/${memberIdNum}/comments`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
                >
                  <MessageCircle className="w-5 h-5 text-sky-600" />
                  <span className="text-gray-700">
                    댓글{' '}
                    <span className="text-sky-600">({myComments.length})</span>
                  </span>
                </Link>
              </nav>
            </Card>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="lg:col-span-2 space-y-6">
            <GitHubCard
              githubUrl={githubUrl}
              username={profile.githubId || 'unknown'}
            />

            <SummaryCarousel
              summaries={publicReports.map((r) => ({
                id: String(r.reportId),
                title: r.reportTitle || r.repoName,
                repository: r.repoName,
                date: formatDate(r.createdAt),
                description: r.description ?? '',
                tags:
                  r.questionCount > 0 ? [`질문 ${r.questionCount}개`] : [],
              }))}
              onCardClick={(id) => navigate(`/analytics/detail/${id}`)}
            />

            {/* 최근 게시글 */}
            <Card className="p-6 bg-white shadow-sm border border-sky-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                최근 게시글
              </h3>
              {myBoards.length > 0 ? (
                <ul className="space-y-2">
                  {myBoards.slice(0, 2).map((b) => (
                    <li key={b.boardId}>
                      <button
                        type="button"
                        onClick={() => navigate(`/community/${b.boardId}`)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-sky-100 hover:bg-sky-50 transition-colors text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-gray-900 font-medium truncate">
                            {b.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                            <span>{formatDate(b.createdAt)}</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {b.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />{' '}
                              {b.commentCount ?? 0}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  아직 작성한 게시글이 없어요.
                </div>
              )}
            </Card>

            {/* 최근 댓글 */}
            <Card className="p-6 bg-white shadow-sm border border-sky-100">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-sky-600" />
                최근 댓글
              </h3>
              {myComments.length > 0 ? (
                <ul className="space-y-2">
                  {myComments.slice(0, 2).map((c) => (
                    <li key={c.commentId}>
                      <button
                        type="button"
                        onClick={() => navigate(`/community/${c.boardId}`)}
                        className="w-full p-3 rounded-lg border border-sky-100 hover:bg-sky-50 transition-colors text-left"
                      >
                        <div className="text-sm text-gray-500 mb-1 truncate">
                          {c.boardTitle}
                        </div>
                        <div className="text-gray-900 truncate">{c.content}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          <span>{formatDate(c.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {c.likeCount}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  아직 작성한 댓글이 없어요.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
