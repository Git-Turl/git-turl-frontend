import { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  BarChart3,
  Briefcase,
  Users,
  Bell,
  ChevronRight,
  Code2,
  Server,
  Brain,
  Star,
  Eye,
  UserPlus,
  GitBranch,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

export function Home() {
  const [githubUsername] = useState('seoyoon127');

  // 🚧 시연용: localStorage에서 유저 정보 불러오기 🚧
  const [userInfo, setUserInfo] = useState<{
    nickname: string;
    profileImage: string | null;
  }>({
    nickname: '김개발',
    profileImage: null,
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem('userInfo');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setUserInfo({
          nickname: parsed.nickname || '김개발',
          profileImage: parsed.profileImage || null,
        });
        console.log('유저 정보 로드:', parsed);
      } catch (e) {
        console.error('userInfo 파싱 실패:', e);
      }
    }
  }, []);

  const menuItems = [
    { icon: HomeIcon, label: 'Home', active: true },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Briefcase, label: 'Interview', active: false },
    { icon: Users, label: 'Community', active: false },
    { icon: Bell, label: 'Notifications', active: false },
  ];

  // 추천 프로젝트 더미 데이터
  const recommendedProjects = [
    {
      type: '프론트',
      icon: Code2,
      bgColor: '#ECF3FE',
      iconBg: '#6095FE',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['React', 'TypeScript', 'Next.js'],
      stars: 24,
      views: 102,
      recruits: 3,
    },
    {
      type: '백엔드',
      icon: Server,
      bgColor: '#EFF8EF',
      iconBg: '#7EC481',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['Node.js', 'Nest.js', 'MongoDB'],
      stars: 18,
      views: 85,
      recruits: 2,
    },
    {
      type: 'AI',
      icon: Brain,
      bgColor: '#F4F2FE',
      iconBg: '#C2B6FC',
      title: '프로젝트명',
      description: '프로젝트 설명',
      tags: ['Python', 'PyTorch', 'LangChain'],
      stars: 31,
      views: 156,
      recruits: 4,
    },
  ];

  // 통계 데이터
  const stats = [
    {
      icon: GitBranch,
      iconBg: '#EDF3FE',
      iconColor: '#578EFE',
      label: '분석한 레포지터리',
      count: 9,
      change: '+1',
    },
    {
      icon: MessageSquare,
      iconBg: '#F3F0FD',
      iconColor: '#854DDA',
      label: '생성한 면접 질문',
      count: 48,
      change: '+12',
    },
    {
      icon: ThumbsUp,
      iconBg: '#FEF7E6',
      iconColor: '#FECA3F',
      label: '피드백 받은 횟수',
      count: 56,
      change: '+15',
    },
  ];

  // 최근 활동 데이터
  const recentActivities = [
    {
      icon: GitBranch,
      iconBg: '#EDF3FE',
      iconColor: '#578EFE',
      title: 'git-turl 레포지터리를 분석했어요',
      time: '4시간 전',
    },
    {
      icon: ThumbsUp,
      iconBg: '#FEF7E6',
      iconColor: '#FECA3F',
      title: 'test1 답변 피드백을 받았어요',
      time: '하루 전',
    },
    {
      icon: MessageSquare,
      iconBg: '#F3F0FD',
      iconColor: '#854DDA',
      title: 'test1 면접 질문을 생성했어요',
      time: '하루 전',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* 사이드바 */}
      <aside
        style={{
          width: 280,
          height: '100vh',
          background: 'white',
          borderRight: '1px solid #B8E6FE',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #DFF2FE',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 30 }}>🪶</span>
          <div>
            <div
              style={{
                color: '#0084D1',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 500,
                lineHeight: '28px',
              }}
            >
              깃털
            </div>
            <div
              style={{
                color: '#6A7282',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
                lineHeight: '16px',
              }}
            >
              Git-turl
            </div>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  background: item.active ? '#F0F9FF' : 'transparent',
                }}
              >
                <Icon
                  size={20}
                  color={item.active ? '#00AEEF' : '#4A5565'}
                  strokeWidth={item.active ? 2.5 : 2}
                />
                <span
                  style={{
                    color: item.active ? '#00AEEF' : '#4A5565',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: item.active ? 580 : 400,
                    lineHeight: '20px',
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #DFF2FE' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#DFF2FE',
                boxShadow: '0 0 0 2px #DFF2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0084D1',
                fontSize: 16,
                fontWeight: 600,
                overflow: 'hidden',
              }}
            >
              {userInfo.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt="프로필"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                userInfo.nickname.charAt(0)
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  color: '#101828',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                {userInfo.nickname}
              </div>
              <div
                style={{
                  color: '#6A7282',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  lineHeight: '16px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                @{githubUsername}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main
        style={{
          flex: 1,
          height: '100vh',
          background: '#F0F9FF',
          overflowY: 'auto',
          padding: '30px 55px',
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: 'black',
            marginBottom: 20,
          }}
        >
          내 깃허브 내역
        </h1>

        {/* 상단 카드 영역 */}
        <div style={{ display: 'flex', gap: 22, marginBottom: 40 }}>
          {/* GitHub 프로필 카드 */}
          <div
            style={{
              flex: 1,
              height: 255,
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
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
          </div>

          {/* 깃털 카드 */}
          <div
            style={{
              width: 415,
              height: 255,
              background: 'white',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 20,
                flex: 1,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: '#D9D9D9',
                  borderRadius: 20,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}
              >
                🪶
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: 'black',
                    fontSize: 20,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  깃털과 함께한 지 15일!
                </div>
                <div
                  style={{
                    color: '#454545',
                    fontSize: 16,
                    fontFamily: 'Inter',
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
                margin: '12px 0 8px 0',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  color: '#8F8F8F',
                  fontSize: 14,
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                이번 주 커밋
              </div>
              <div
                style={{
                  color: '#0E2248',
                  fontSize: 28,
                  fontFamily: 'Inter',
                  fontWeight: 600,
                }}
              >
                23회
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 추천 프로젝트 ==================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontFamily: 'Inter',
              fontWeight: 600,
              color: 'black',
            }}
          >
            추천 프로젝트
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#0084D1',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            프로젝트 게시판
            <ChevronRight size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
          {recommendedProjects.map((project, idx) => {
            const Icon = project.icon;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid #B8E6FE',
                  padding: 20,
                  position: 'relative',
                  minHeight: 240,
                }}
              >
                {/* 상단: 아이콘 + 제목 */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: project.bgColor,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        background: project.iconBg,
                        borderRadius: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={32} color="white" />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        color: 'black',
                        marginBottom: 6,
                      }}
                    >
                      {project.title}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        color: '#454545',
                      }}
                    >
                      {project.description}
                    </div>
                  </div>
                </div>

                {/* 태그 */}
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {project.tags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        padding: '6px 12px',
                        background: project.bgColor,
                        borderRadius: 12,
                        fontSize: 13,
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        color: '#454545',
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>

                {/* 하단 정보 (별/조회수/구인) */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    color: '#828282',
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Star size={16} />
                    <span>{project.stars}</span>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Eye size={16} />
                    <span>{project.views}</span>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <UserPlus size={16} />
                    <span>{project.recruits}명 구인</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== 내 활동 요약 ==================== */}
        <h2
          style={{
            fontSize: 26,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: 'black',
            marginBottom: 20,
          }}
        >
          내 활동 요약
        </h2>

        <div
          style={{
            background: 'white',
            borderRadius: 20,
            border: '1px solid #B8E6FE',
            padding: 30,
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', gap: 40 }}>
            {/* 왼쪽: 통계 3개 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 20,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  color: '#454545',
                  marginBottom: 20,
                }}
              >
                깃털이 도운 횟수
              </div>
              <div style={{ display: 'flex', gap: 30 }}>
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          background: stat.iconBg,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={40} color={stat.iconColor} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            color: 'black',
                            marginBottom: 4,
                          }}
                        >
                          {stat.label}
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: 32,
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              color: 'black',
                            }}
                          >
                            {stat.count}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              fontFamily: 'Inter',
                              fontWeight: 500,
                              color: 'black',
                              marginLeft: 4,
                            }}
                          >
                            개
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#808080',
                            fontFamily: 'Inter',
                            fontWeight: 500,
                          }}
                        >
                          {stat.change} (이번 주)
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
                width: 400,
                borderLeft: '1px solid #E5F3FE',
                paddingLeft: 30,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    color: '#454545',
                  }}
                >
                  최근 활동
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#828282',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  모두 보기
                  <ChevronRight size={16} />
                </div>
              </div>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {recentActivities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={idx}
                      style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                    >
                      <div
                        style={{
                          width: 45,
                          height: 45,
                          background: activity.iconBg,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={22} color={activity.iconColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: 450,
                            color: 'black',
                          }}
                        >
                          {activity.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontFamily: 'Inter',
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}