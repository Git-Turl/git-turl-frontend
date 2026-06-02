import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Code,
  Server,
  Brain,
  Star,
  Eye,
  UserPlus,
  GitBranch,
  MessageSquare,
  Calendar,
  Bookmark,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  getMyHistory,
  getMyProfile,
  getReportList,
  type GitTurlHistory,
  type ReportListItem,
} from '../../api/member';
import gitturlLogo from '../../assets/logo/gitturl-logo.svg';

// "2026-04-08T01:40:00" → "4시간 전" 형식 상대시각.
const relativeTime = (iso: string): string => {
  const past = new Date(iso).getTime();
  if (Number.isNaN(past)) return '';
  const diffMin = Math.floor((Date.now() - past) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '하루 전';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
};

type StoredUserInfo = {
  nickname?: string;
  name?: string;
  email?: string;
  githubId?: string;
  profileImage?: string | null;
  avatar?: string;
};

export function Home() {
  const [userInfo, setUserInfo] = useState<StoredUserInfo | null>(null);
  const [history, setHistory] = useState<GitTurlHistory | null>(null);
  const [recentReports, setRecentReports] = useState<ReportListItem[]>([]);

  useEffect(() => {
    // 깃털 히스토리 조회 — 일수 / 분석 리포트 / 면접 질문 카운트
    let cancelledHistory = false;
    getMyHistory()
      .then((res) => {
        if (cancelledHistory) return;
        if (res.isSuccess && res.result) setHistory(res.result);
      })
      .catch((err) => {
        console.error('[home] history load failed', err);
      });

    // 최근 활동 — 분석 리포트 최근 5건
    let cancelledReports = false;
    getReportList({ answerType: 'ALL', pageSize: 5 })
      .then((res) => {
        if (cancelledReports) return;
        if (res.isSuccess && res.result?.data) {
          setRecentReports(res.result.data);
        }
      })
      .catch((err) => {
        console.error('[home] recent reports load failed', err);
      });

    return () => {
      cancelledHistory = true;
      cancelledReports = true;
    };
  }, []);

  useEffect(() => {
    // 1차: localStorage 캐시에서 빠르게 로드
    const savedInfo = localStorage.getItem('userInfo');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo) as StoredUserInfo;
        if (parsed?.nickname || parsed?.githubId || parsed?.name) {
          setUserInfo(parsed);
        }
      } catch (e) {
        console.error('userInfo 파싱 실패:', e);
      }
    }

    // 2차: API에서 최신 프로필 가져와 githubId 확실히 채움
    let cancelled = false;
    getMyProfile()
      .then((res) => {
        if (cancelled) return;
        if (!res.isSuccess || !res.result) return;
        setUserInfo((prev) => ({
          ...(prev ?? {}),
          nickname: res.result?.nickname ?? prev?.nickname,
          githubId: res.result?.githubId ?? prev?.githubId,
          profileImage: res.result?.profileImage ?? prev?.profileImage,
        }));
      })
      .catch(() => {
        // 무시: localStorage 값이 있으면 그걸로 사용
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const githubUsername = userInfo?.githubId ?? '';

  const recommendedProjects = [
    {
      icon: Code,
      bgColor: '#ECF3FE',
      iconBg: '#6095FE',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['React', 'TypeScript', 'Next.js'],
      tagBg: '#ECF3FE',
      stars: 24,
      views: 102,
      recruits: 3,
    },
    {
      icon: Server,
      bgColor: '#EFF8EF',
      iconBg: '#7EC481',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['Node.js', 'Nest.js', 'MongoDB'],
      tagBg: '#EFF8EF',
      stars: 18,
      views: 85,
      recruits: 2,
    },
    {
      icon: Brain,
      bgColor: '#F4F2FE',
      iconBg: '#C2B6FC',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['Python', 'PyTorch', 'LangChain'],
      tagBg: '#F4F2FE',
      stars: 31,
      views: 156,
      recruits: 4,
    },
  ];

  // 모두 history API 에서 받아온 실데이터.
  const stats = [
    {
      icon: GitBranch,
      iconBg: '#EDF3FE',
      iconColor: '#578EFE',
      label: '분석한 레포지터리',
      count: history?.githubReportCount ?? 0,
    },
    {
      icon: MessageSquare,
      iconBg: '#F3F0FD',
      iconColor: '#854DDA',
      label: '생성한 면접 질문',
      count: history?.interviewQuestionCount ?? 0,
    },
    {
      icon: Calendar,
      iconBg: '#FEF7E6',
      iconColor: '#FECA3F',
      label: '함께한 일수',
      count: history?.daysWthGitTurl ?? 0,
    },
  ];

  // 최근 활동 — 현재 연동된 백엔드 API 중 분석 리포트 목록을 사용.
  // 추후 글/음성·텍스트 면접 활동까지 합치려면 백엔드 통합 엔드포인트 필요.
  const recentActivities = recentReports.slice(0, 3).map((r) => ({
    icon: GitBranch,
    iconBg: '#EDF3FE',
    iconColor: '#578EFE',
    title: `${r.reportTitle || r.repoName || '레포지터리'}를 분석했어요`,
    time: relativeTime(r.createdAt),
  }));

  return (
    <div
      style={{
        padding: '20px 28px',
        background: '#F0F9FF',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'black',
          marginBottom: 12,
        }}
      >
        내 깃허브 내역
      </h1>

      {/* 상단 카드 영역 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {/* GitHub 프로필 요약 카드 */}
        <div
          style={{
            flex: 1,
            height: 260,
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0F9FF',
            border: '1px solid #B8E6FE',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {githubUsername ? (
            <img
              src={`https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${githubUsername}&theme=buefy`}
              alt="GitHub Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ color: '#6A7282', fontSize: 13 }}>
              GitHub 연동 정보가 없습니다.
            </span>
          )}
        </div>

        {/* 깃털 함께한 지 카드 */}
        <div
          style={{
            width: 360,
            height: 260,
            background: 'white',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 14,
              flex: 1,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 16,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={gitturlLogo}
                alt="깃털"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                깃털과 함께한 지 {history?.daysWthGitTurl ?? 0}일!
              </div>
              <div
                style={{
                  color: '#454545',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                꾸준한 커밋과 분석으로
                <br />
                면접을 준비해보세요!
              </div>
            </div>
          </div>
          <div
            style={{
              height: 1,
              background: '#E5F3FE',
              margin: '8px 0 6px 0',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: '#8F8F8F',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              이번 주 커밋
            </div>
            <div
              style={{
                color: '#0E2248',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              23회
            </div>
          </div>
        </div>
      </div>

      {/* 추천 프로젝트 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'black',
          }}
        >
          추천 프로젝트
        </h2>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#0084D1',
            fontSize: 14,
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          프로젝트 게시판
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {recommendedProjects.map((project, idx) => {
          const Icon = project.icon;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                background: 'white',
                borderRadius: 16,
                border: '1px solid #B8E6FE',
                padding: 16,
                position: 'relative',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <button
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label="bookmark"
              >
                <Bookmark size={18} color="#9CA3AF" />
              </button>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: project.bgColor,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: project.iconBg,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} color="white" />
                  </div>
                </div>
                <div style={{ flex: 1, paddingRight: 22, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'black',
                      marginBottom: 4,
                    }}
                  >
                    {project.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#454545',
                    }}
                  >
                    {project.description}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                {project.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      padding: '4px 10px',
                      background: project.tagBg,
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#454545',
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  color: '#828282',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={14} />
                  <span>{project.stars}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Eye size={14} />
                  <span>{project.views}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <UserPlus size={14} />
                  <span>{project.recruits}명 구인</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 내 활동 요약 */}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: 'black',
          marginBottom: 12,
        }}
      >
        내 활동 요약
      </h2>

      <div
        style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #B8E6FE',
          padding: 20,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', gap: 28 }}>
          {/* 왼쪽: 통계 3개 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: '#454545',
                marginBottom: 14,
              }}
            >
              깃털이 도운 횟수
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: stat.iconBg,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={26} color={stat.iconColor} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'black',
                          marginBottom: 2,
                        }}
                      >
                        {stat.label}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: 'black',
                          }}
                        >
                          {stat.count}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'black',
                            marginLeft: 3,
                          }}
                        >
                          개
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 최근 활동 */}
          <div
            style={{
              width: 560,
              borderLeft: '1px solid #E5F3FE',
              paddingLeft: 30,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#454545',
                }}
              >
                최근 활동
              </div>
              <Link
                to="/analytics"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  color: '#828282',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                모두 보기
                <ChevronRight size={14} />
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div
                style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: 13,
                }}
              >
                아직 활동이 없어요.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentActivities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={idx}
                    style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: activity.iconBg,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={activity.iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 450,
                          color: 'black',
                        }}
                      >
                        {activity.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: '#828282',
                        }}
                      >
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
