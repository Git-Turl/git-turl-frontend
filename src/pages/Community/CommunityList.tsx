import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Plus,
  ChevronDown,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  getBoardList,
  type BoardListItem,
  type BoardType,
  type BoardSort,
  type StudyTag,
  type ProjectStatus,
  type TechField,
  type PlatformType,
} from '../../api/community';
import { getRecruitStatus } from '../../utils/localBoardStatus';
import { AuthorLink } from '../../components/common/AuthorLink';

// 필터 옵션 정의 (label = 한글 표시, value = 백엔드 enum)
type Option<T extends string> = { label: string; value: T };

const sortOptions: Option<BoardSort>[] = [
  { label: '최신순', value: 'LATEST' },
  { label: '좋아요순', value: 'LIKE' },
];

const studyTagOptions: Option<StudyTag | ''>[] = [
  { label: '전체', value: '' },
  { label: '자격증', value: 'CERTIFICATE' },
  { label: '코딩테스트', value: 'CODING_TEST' },
  { label: '어학', value: 'LANGUAGE' },
];

const projectStatusOptions: Option<ProjectStatus | ''>[] = [
  { label: '전체', value: '' },
  { label: '모집중', value: 'RECRUITING' },
  { label: '모집완료', value: 'CLOSED' },
];

const techFieldOptions: Option<TechField | ''>[] = [
  { label: '전체', value: '' },
  { label: '백엔드', value: 'BACKEND' },
  { label: '프론트엔드', value: 'FRONTED' },
  { label: 'AI', value: 'AI' },
  { label: '기타', value: 'ETC' },
];

const platformTypeOptions: Option<PlatformType | ''>[] = [
  { label: '전체', value: '' },
  { label: '웹', value: 'WEB' },
  { label: '앱', value: 'APP' },
  { label: '기타', value: 'ETC' },
];

type TabType = 'study' | 'project' | 'free';

const tabToBoardType: Record<TabType, BoardType> = {
  study: 'STUDY',
  project: 'PROJECT',
  free: 'FORUM',
};

const boardTypeLabel: Record<BoardType, string> = {
  STUDY: '스터디',
  PROJECT: '프로젝트',
  FORUM: '자유',
};

// 스터디 태그 enum → 한글 라벨
const studyTagLabel: Record<StudyTag, string> = {
  LANGUAGE: '어학',
  CERTIFICATE: '자격증',
  CODING_TEST: '코딩테스트',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function isNewPost(iso: string): boolean {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return false;
  return Date.now() - d < 24 * 60 * 60 * 1000;
}

// ⚠️ 시연용 목업 — 백엔드 응답에 작성자 id 추가되면 제거.
// 작성자는 jeongkyueun / siuoo0819 고정 (타인 프로필 클릭 → /profile/:nickname 흐름 검증).
// boardId 는 백엔드 PK 와 충돌 안 나게 큰 음수 사용. 게시글 자체를 클릭하면
// 상세 페이지가 404 일 수 있으니 시연에서는 작성자 이름만 클릭.
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

// 탭별 2개씩 — 같은 작성자 2명(jeongkyueun, siuoo0819)을 그대로 쓰면서 제목/내용만 탭에 맞춤.
const MOCK_POSTS_BY_TAB: Record<TabType, Omit<BoardListItem, 'boardType'>[]> = {
  study: [
    {
      boardId: -10001,
      title: '토익 900점대 같이 공부하실 분 구합니다',
      content:
        '<p>안녕하세요! 토익 900점 목표로 함께 공부하실 분 구합니다. 매주 정기 모임에서 RC/LC 같이 풀고 점수 인증으로 동기부여 받아봐요. 평일 저녁 2시간 정도 생각하고 있습니다.</p>',
      imageUrl: null,
      studyTag: 'LANGUAGE',
      writerName: 'jeongkyueun',
      likeCount: 5,
      createdAt: hoursAgo(2),
    },
    {
      boardId: -10002,
      title: '정보처리기사 필기 스터디 모집합니다',
      content:
        '<p>정보처리기사 필기 시험 같이 준비하실 분 모집합니다. 1과목부터 차근차근 같이 정리하고 기출문제 풀이 진행할 예정입니다. 자격증 도전 환영이에요!</p>',
      imageUrl: null,
      studyTag: 'CERTIFICATE',
      writerName: 'siuoo0819',
      likeCount: 8,
      createdAt: hoursAgo(6),
    },
  ],
  project: [
    {
      boardId: -10003,
      title: '백엔드 (DB쪽) 구합니다',
      content:
        '<p>사이드 프로젝트 백엔드 (DB 설계 + API) 담당해주실 분 구합니다. 스택은 Spring Boot + PostgreSQL 예정이고, 주 1회 온라인 미팅 진행할 예정입니다. 포트폴리오용으로도 좋아요!</p>',
      imageUrl: null,
      projectStatus: 'RECRUITING',
      techFields: ['BACKEND'],
      platformTypes: ['WEB'],
      writerName: 'jeongkyueun',
      likeCount: 6,
      createdAt: hoursAgo(3),
    },
    {
      boardId: -10004,
      title: '디자이너 구합니다 ~블렌더 환영~',
      content:
        '<p>팀 프로젝트 UI/UX 디자이너 구합니다. 블렌더로 간단한 3D 에셋 만들 수 있는 분 대환영! 정해진 마감 없고 천천히 진행할 예정입니다. 포트폴리오 만들고 싶으신 분 모십니다.</p>',
      imageUrl: null,
      projectStatus: 'RECRUITING',
      techFields: ['ETC'],
      platformTypes: ['WEB', 'APP'],
      writerName: 'siuoo0819',
      likeCount: 12,
      createdAt: hoursAgo(8),
    },
  ],
  free: [
    {
      boardId: -10005,
      title: '컴퓨터 앞에만 앉아서 체력부족을 근래 느끼는데 다들 운동 하시나요',
      content:
        '<p>하루 종일 코딩만 하다 보니 요즘 체력이 너무 떨어진 것 같아요. 다들 어떻게 운동하시나요? 추천하는 루틴이나 운동 있으면 공유 부탁드립니다. 홈트도 좋고 헬스도 좋아요!</p>',
      imageUrl: null,
      writerName: 'jeongkyueun',
      likeCount: 18,
      createdAt: hoursAgo(1),
    },
    {
      boardId: -10006,
      title: '퇴근하고 싶다...',
      content:
        '<p>오늘따라 퇴근 시간이 왜 이렇게 안 가는지... 다들 화이팅하세요 ㅠㅠ 금요일까지만 버티면 됩니다.</p>',
      imageUrl: null,
      writerName: 'siuoo0819',
      likeCount: 32,
      createdAt: hoursAgo(0.5),
    },
  ],
};

// HTML 태그 제거 후 텍스트 미리보기용으로 변환
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function CommunityList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('study');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1); // UI: 1-indexed, API: 0-indexed

  // 백엔드 필터 (탭별로 적용되는 항목이 다름. 빈 문자열 = 미적용)
  const [sort, setSort] = useState<BoardSort>('LATEST');
  const [studyTag, setStudyTag] = useState<StudyTag | ''>('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | ''>('');
  const [techField, setTechField] = useState<TechField | ''>('');
  const [platformType, setPlatformType] = useState<PlatformType | ''>('');

  const [posts, setPosts] = useState<BoardListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'study', label: '스터디' },
    { id: 'project', label: '프로젝트' },
    { id: 'free', label: '자유게시판' },
  ];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBoardList({
      page: page - 1,
      boardType: tabToBoardType[activeTab],
      sort,
      // 탭별로 의미 있는 필터만 전송 (빈 값은 undefined 처리되어 쿼리에서 제외됨)
      ...(activeTab === 'study' && studyTag ? { studyTag } : {}),
      ...(activeTab !== 'free' && projectStatus ? { projectStatus } : {}),
      ...(activeTab === 'project' && techField ? { techField } : {}),
      ...(activeTab === 'project' && platformType ? { platformType } : {}),
    })
      .then((res) => {
        if (cancelled) return;
        // 활성 탭의 목업 게시글 2개를 첫 페이지 상단에 prepend.
        const currentType = tabToBoardType[activeTab];
        const mocks: BoardListItem[] = MOCK_POSTS_BY_TAB[activeTab].map((m) => ({
          ...m,
          boardType: currentType,
        }));
        if (res.isSuccess && res.result) {
          const real = res.result.boardList ?? [];
          setPosts(page === 1 ? [...mocks, ...real] : real);
          setTotalPages(Math.max(1, res.result.totalPage ?? 1));
        } else {
          setError(res.message || '게시글을 불러오지 못했습니다.');
          setPosts(page === 1 ? mocks : []);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError('게시글을 불러오지 못했습니다.');
        const currentType = tabToBoardType[activeTab];
        const mocks: BoardListItem[] = MOCK_POSTS_BY_TAB[activeTab].map((m) => ({
          ...m,
          boardType: currentType,
        }));
        setPosts(page === 1 ? mocks : []);
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, page, sort, studyTag, projectStatus, techField, platformType]);

  // 탭 변경 시 페이지 + 탭별 필터 초기화
  useEffect(() => {
    setPage(1);
    setStudyTag('');
    setProjectStatus('');
    setTechField('');
    setPlatformType('');
  }, [activeTab]);

  // 검색은 백엔드 미지원 → 클라이언트 사이드 필터 (현재 페이지 결과 내)
  const filteredPosts = search.trim()
    ? posts.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          stripHtml(p.content).toLowerCase().includes(q)
        );
      })
    : posts;

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
          fontSize: 26,
          fontWeight: 700,
          color: 'black',
          marginBottom: 14,
        }}
      >
        커뮤니티
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: 'relative',
                  padding: '12px 32px',
                  background: active ? 'white' : 'transparent',
                  borderTop: active ? '1px solid #DFF2FE' : 'none',
                  borderLeft: active ? '1px solid #DFF2FE' : 'none',
                  borderRight: active ? '1px solid #DFF2FE' : 'none',
                  borderBottom: 'none',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  fontSize: 15,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#00AEEF' : '#828282',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/community/write')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 22px',
            background: '#00AEEF',
            color: 'white',
            borderTop: '1px solid #00AEEF',
            borderLeft: '1px solid #00AEEF',
            borderRight: '1px solid #00AEEF',
            borderBottom: 'none',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: -1,
            marginRight: 24,
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          글쓰기
        </button>
      </div>

      <div
        style={{
          background: 'white',
          borderTopLeftRadius: activeTab === 'study' ? 0 : 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: '20px 24px',
          boxSizing: 'border-box',
          border: '1px solid #DFF2FE',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              color="#9CA3AF"
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색어를 입력하세요"
              style={{
                width: '100%',
                height: 42,
                padding: '0 16px 0 44px',
                borderRadius: 999,
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: 14,
                color: '#374151',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <EnumDropdown
              value={sort}
              options={sortOptions}
              onChange={setSort}
            />
            {activeTab === 'study' && (
              <EnumDropdown
                value={studyTag}
                options={studyTagOptions}
                onChange={setStudyTag}
                placeholder="태그"
              />
            )}
            {activeTab !== 'free' && (
              <EnumDropdown
                value={projectStatus}
                options={projectStatusOptions}
                onChange={setProjectStatus}
                placeholder="모집상태"
              />
            )}
            {activeTab === 'project' && (
              <>
                <EnumDropdown
                  value={techField}
                  options={techFieldOptions}
                  onChange={setTechField}
                  placeholder="분야"
                />
                <EnumDropdown
                  value={platformType}
                  options={platformTypeOptions}
                  onChange={setPlatformType}
                  placeholder="플랫폼"
                />
              </>
            )}
          </div>
        </div>

        <div>
          {loading ? (
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
                color: '#828282',
                fontSize: 14,
              }}
            >
              불러오는 중...
            </div>
          ) : error ? (
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
                color: '#EF4444',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div
              style={{
                padding: '60px 0',
                textAlign: 'center',
                color: '#828282',
                fontSize: 14,
              }}
            >
              아직 등록된 게시글이 없습니다.
            </div>
          ) : (
            filteredPosts.map((post, idx) => (
              <PostRow
                key={post.boardId}
                post={post}
                isLast={idx === filteredPosts.length - 1}
                onClick={() => navigate(`/community/${post.boardId}`)}
              />
            ))
          )}
        </div>

        {!loading && !error && filteredPosts.length > 0 && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #F3F4F6',
            }}
          >
            <PageButton
              onClick={() => setPage(1)}
              disabled={page === 1}
              icon={<ChevronsLeft size={16} />}
            />
            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              icon={<ChevronLeft size={16} />}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              const active = n === page;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: active ? '#00AEEF' : 'transparent',
                    color: active ? 'white' : '#4A5565',
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              );
            })}
            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              icon={<ChevronRight size={16} />}
            />
            <PageButton
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              icon={<ChevronsRight size={16} />}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 백엔드 enum 값을 그대로 다루는 드롭다운 (label/value 분리)
function EnumDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (v: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentLabel =
    options.find((o) => o.value === value)?.label ?? placeholder ?? '선택';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
          color: '#4A5565',
          cursor: 'pointer',
          minWidth: 96,
          justifyContent: 'space-between',
        }}
      >
        {currentLabel}
        <ChevronDown
          size={14}
          color="#9CA3AF"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            background: '#ffffff',
            borderRadius: 14,
            padding: '8px 0',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value || '__empty__'}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: selected ? 600 : 500,
                  color: selected ? '#0084D1' : '#4A5565',
                  textAlign: 'center',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: disabled ? '#D1D5DB' : '#4A5565',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </button>
  );
}

function PostRow({
  post,
  isLast,
  onClick,
}: {
  post: BoardListItem;
  isLast: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 20,
        padding: '20px 0',
        borderBottom: isLast ? 'none' : '1px solid #E5E7EB',
        cursor: 'pointer',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: 'black' }}>
            {post.title}
          </span>
          {isNewPost(post.createdAt) && (
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: '#FF5353',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              N
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 14,
            color: '#4A5565',
            marginBottom: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {stripHtml(post.content)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {(() => {
            // 스터디 게시판이면 studyTag(자격증/코딩테스트/어학) 표시, 없으면 boardType
            const pillText =
              post.boardType === 'STUDY' && post.studyTag
                ? studyTagLabel[post.studyTag]
                : boardTypeLabel[post.boardType];
            return <Pill text={`#${pillText}`} filled />;
          })()}
          {(() => {
            const status = getRecruitStatus(post.boardId);
            if (!status) return null;
            const isRecruiting = status === 'RECRUITING';
            return (
              <Pill
                text={isRecruiting ? '모집중' : '모집완료'}
                color={isRecruiting ? '#00AEEF' : '#828282'}
              />
            );
          })()}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#828282',
              fontSize: 13,
              marginLeft: 6,
            }}
          >
            <Heart size={14} />
            <span>{post.likeCount}</span>
          </div>
          <AuthorLink writerName={post.writerName}>
            <div style={{ color: '#828282', fontSize: 13 }}>
              {post.writerName}
            </div>
          </AuthorLink>
          <div style={{ color: '#828282', fontSize: 13 }}>
            {formatDate(post.createdAt)}
          </div>
        </div>
      </div>

      <div
        style={{
          width: 130,
          height: 92,
          background: post.imageUrl ? 'transparent' : '#E5E7EB',
          borderRadius: 10,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
    </div>
  );
}

function Pill({
  text,
  color = '#00AEEF',
  filled = false,
}: {
  text: string;
  color?: string;
  filled?: boolean;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 999,
        border: filled ? '1px solid #0084D1' : `1px solid ${color}`,
        color: filled ? '#0084D1' : color,
        fontSize: 12,
        fontWeight: 500,
        background: filled ? '#E0F2FE' : 'white',
      }}
    >
      {text}
    </span>
  );
}
