import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronDown, X, Check } from 'lucide-react';
import {
  createBoard,
  updateBoard,
  getBoardDetail,
  labelsToBoardStacks,
  type BoardType,
  type StudyTag as ApiStudyTag,
  type ProjectStatus,
  type PlatformType,
  type CertificateType as ApiCertificateType,
} from '../../api/community';
import { setRecruitStatus } from '../../utils/localBoardStatus';
import { RichTextEditor } from '../../components/RichTextEditor/RichTextEditor';

type PostType = 'study' | 'project' | 'free';
type StudyTag = '어학' | '자격증' | '코딩테스트';
type CertificateType = '필기' | '실기';
type StackSection = '프론트' | '백엔드' | 'AI';
type PlatformLabel = '웹' | '앱' | '기타';

type PostSettings = {
  recruitCount?: string;
  deadline?: string;
  studyTags?: string[];
  certificateTypes?: string[];
  recruitStacks?: string[];
  usingStacks?: string[];
  platformTypes?: PlatformLabel[];
};

// UI 플랫폼 라벨 → 백엔드 enum
const platformLabelToApi: Record<PlatformLabel, PlatformType> = {
  웹: 'WEB',
  앱: 'APP',
  기타: 'ETC',
};

const postTypeLabels: Record<PostType, string> = {
  study: '스터디',
  project: '프로젝트',
  free: '자유게시판',
};

const postTypeToBoardType: Record<PostType, BoardType> = {
  study: 'STUDY',
  project: 'PROJECT',
  free: 'FORUM',
};

// 백엔드 BoardStack enum 에 있는 것만 노출 (community.ts 의 BOARD_STACK_BY_LABEL 과 라벨 동일해야 매핑됨)
const stackData: Record<StackSection, string[]> = {
  프론트: [
    'HTML/CSS',
    'Tailwind CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Next.js',
  ],
  백엔드: [
    'Java',
    'Spring',
    'SpringBoot',
    'Node.js',
    'Express',
    'MySQL',
    'PostgreSQL',
  ],
  AI: [
    'TensorFlow',
    'PyTorch',
    'scikit-learn',
    'LangChain',
    'OpenAI API',
    'Pandas',
  ],
};

// ===== UI 입력 → 백엔드 enum 매핑 =====

const studyTagToApi: Record<StudyTag, ApiStudyTag> = {
  어학: 'LANGUAGE',
  자격증: 'CERTIFICATE',
  코딩테스트: 'CODING_TEST',
};

// 백엔드 enum → UI 라벨 (수정 시 폼 프리필용 역매핑)
const apiToStudyTag: Record<ApiStudyTag, StudyTag> = {
  LANGUAGE: '어학',
  CERTIFICATE: '자격증',
  CODING_TEST: '코딩테스트',
};

const boardTypeToPostType: Record<BoardType, PostType> = {
  STUDY: 'study',
  PROJECT: 'project',
  FORUM: 'free',
};

// UI 자격증 라벨 → 백엔드 enum
const certificateTypeToApi: Record<CertificateType, ApiCertificateType> = {
  필기: 'WRITTEN',
  실기: 'PRACTICAL',
};

export function CommunityWrite() {
  const navigate = useNavigate();

  // 쿼리 파라미터 ?id=123 가 있으면 수정 모드
  const [searchParams] = useSearchParams();
  const editIdParam = searchParams.get('id');
  const editId = editIdParam ? Number(editIdParam) : null;
  const isEditMode = editId !== null && !isNaN(editId);

  const [postType, setPostType] = useState<PostType>('project');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecruiting, setIsRecruiting] = useState(true);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // 현재 백엔드 스펙은 모집 인원/마감/스택 등 settings 필드를 지원하지 않음.
  // 추후 API 확장 시 createBoard 호출부에 함께 전달하도록 변경할 것.
  const [settings, setSettings] = useState<PostSettings>({});
  const [submitting, setSubmitting] = useState(false);
  // 수정 모드에서 기존 게시글 불러오는 중 여부
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // editId 변화에 따라 폼 상태 동기화
  // - 신규 작성(id 없음): 빈 폼으로 초기화
  // - 수정(id 있음): 기존 게시글 불러와 프리필
  useEffect(() => {
    // 신규 작성 모드: 폼 초기화 (수정 → 새 글로 전환 시 잔존 데이터 제거)
    if (!isEditMode || editId === null) {
      setTitle('');
      setContent('');
      setPostType('project');
      setIsRecruiting(true);
      setSettings({});
      setLoadingPost(false);
      return;
    }

    let cancelled = false;
    setLoadingPost(true);
    getBoardDetail(editId)
      .then((res) => {
        if (cancelled) return;
        if (res.isSuccess && res.result) {
          const p = res.result;
          setTitle(p.title ?? '');
          setContent(p.content ?? '');
          setPostType(boardTypeToPostType[p.boardType] ?? 'project');
          // 모집 상태: projectStatus 우선, 없으면 로컬 저장값 폴백
          if (p.projectStatus) {
            setIsRecruiting(p.projectStatus === 'RECRUITING');
          }
          // 설정 모달 프리필 (studyTag만 역매핑 가능, 스택은 분야만 알 수 있어 복원 생략)
          setSettings({
            studyTags: p.studyTag ? [apiToStudyTag[p.studyTag]] : [],
          });
        } else {
          alert('게시글을 불러오지 못했습니다.');
          navigate('/community');
        }
      })
      .catch(() => {
        if (cancelled) return;
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
        navigate('/community');
      })
      .finally(() => {
        if (!cancelled) setLoadingPost(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editId, navigate]);

  // HTML 본문에서 텍스트만 추출해 비어있는지 확인
  const isContentEmpty = (html: string): boolean => {
    const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    return stripped.length === 0;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (isContentEmpty(content)) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      // ===== settings 모달 입력 → 백엔드 필드 매핑 =====
      // 백엔드 POST /boards 스키마:
      //   필수: title, content, boardType
      //   STUDY: studyTag, (자격증이면) certificateType, recruitCount, recruitDeadline, projectStatus
      //   PROJECT: recruitStacks[], projectStacks[], platformTypes[], recruitCount, recruitDeadline, projectStatus
      //   FORUM: 위 옵션 필드들 모두 생략/null
      const boardType = postTypeToBoardType[postType];

      // studyTag: STUDY 타입에서만 의미 있음.
      const firstStudyTag = settings.studyTags?.[0] as StudyTag | undefined;
      const studyTag =
        boardType === 'STUDY' && firstStudyTag
          ? studyTagToApi[firstStudyTag]
          : null;

      // certificateType: STUDY + 자격증 태그에서만 의미 있음.
      const firstCert = settings.certificateTypes?.[0] as
        | CertificateType
        | undefined;
      const certificateType =
        boardType === 'STUDY' && firstStudyTag === '자격증' && firstCert
          ? certificateTypeToApi[firstCert]
          : null;

      // projectStatus: STUDY/PROJECT 에서 모집 토글로부터 도출. FORUM은 null
      const projectStatus: ProjectStatus | null =
        boardType !== 'FORUM'
          ? isRecruiting
            ? 'RECRUITING'
            : 'CLOSED'
          : null;

      // recruitCount: 빈 문자열 → null, 그 외 정수로
      const parsedCount = settings.recruitCount?.trim()
        ? Number(settings.recruitCount)
        : null;
      const recruitCount =
        boardType !== 'FORUM' && parsedCount !== null && !isNaN(parsedCount)
          ? parsedCount
          : null;

      const recruitDeadline =
        boardType !== 'FORUM' && settings.deadline ? settings.deadline : null;

      // PROJECT 스택: 구인/사용 둘 다 UI 라벨 → BoardStack enum 변환
      const recruitStacks =
        boardType === 'PROJECT'
          ? labelsToBoardStacks(settings.recruitStacks)
          : [];
      const projectStacks =
        boardType === 'PROJECT'
          ? labelsToBoardStacks(settings.usingStacks)
          : [];

      // platformTypes: PROJECT 에서 사용자가 고른 라벨 → enum 변환
      const platformTypes: PlatformType[] =
        boardType === 'PROJECT'
          ? (settings.platformTypes ?? []).map((p) => platformLabelToApi[p])
          : [];

      const payload = {
        title: title.trim(),
        content,
        boardType,
        studyTag,
        certificateType,
        projectStatus,
        recruitCount,
        recruitDeadline,
        recruitStacks,
        projectStacks,
        platformTypes,
      };

      if (isEditMode && editId !== null) {
        // ===== 수정 =====
        const res = await updateBoard(editId, payload);
        console.log('[CommunityWrite] updateBoard 응답:', res);
        if (res.isSuccess) {
          if (postType !== 'free') {
            setRecruitStatus(
              editId,
              isRecruiting ? 'RECRUITING' : 'COMPLETED'
            );
          }
          navigate(`/community/${editId}`);
        } else {
          alert(
            `게시글 수정 실패: ${res.code || ''} ${res.message || '알 수 없는 오류'}`
          );
        }
      } else {
        // ===== 신규 작성 =====
        const res = await createBoard(payload);
        console.log('[CommunityWrite] createBoard 응답:', res);
        if (res.isSuccess) {
          // 모집 상태는 백엔드 미지원 → 시연용 로컬 저장 (자유게시판 제외)
          if (postType !== 'free' && res.result?.postId !== undefined) {
            setRecruitStatus(
              res.result.postId,
              isRecruiting ? 'RECRUITING' : 'COMPLETED'
            );
          }
          navigate('/community');
        } else {
          alert(
            `게시글 등록 실패: ${res.code || ''} ${res.message || '알 수 없는 오류'}`
          );
        }
      }
    } catch (e: unknown) {
      const err = e as {
        response?: {
          status?: number;
          data?: { code?: string; message?: string; result?: unknown };
        };
      };
      const status = err?.response?.status;
      const data = err?.response?.data;
      const actionLabel = isEditMode ? '게시글 수정' : '게시글 등록';
      console.error(`[CommunityWrite] ${actionLabel} 에러:`, e);
      console.error('[CommunityWrite] 응답 status:', status);
      console.error('[CommunityWrite] 응답 data 전체:', data);
      alert(
        `${actionLabel} 중 오류\nstatus: ${status ?? '?'}\ncode: ${data?.code ?? '?'}\nmessage: ${data?.message ?? ''}\nresult: ${
          typeof data?.result === 'string'
            ? data.result
            : JSON.stringify(data?.result ?? '')
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || !isContentEmpty(content)) {
      if (!confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) return;
    }
    navigate('/community');
  };

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const showRecruitToggle = postType !== 'free';
  const showSettingButton = postType !== 'free';

  // 수정 모드: 기존 게시글 로딩 중
  if (loadingPost) {
    return (
      <main
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#F0F9FF',
          paddingTop: 46,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginTop: 80, color: '#828282', fontSize: 16 }}>
          게시글을 불러오는 중...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#F0F9FF',
        paddingTop: 46,
      }}
    >
      <div style={{ width: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 48 }}>
          {isEditMode ? '게시글 수정' : '게시글 작성'}
        </h1>

        <section
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 12,
            padding: '30px 40px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  style={{
                    width: 150,
                    height: 36,
                    borderRadius: 999,
                    border: '1px solid #00AEEF',
                    background: '#fff',
                    fontSize: 15,
                    color: '#00AEEF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  {postTypeLabels[postType]}
                  <ChevronDown size={16} />
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 42,
                      left: 0,
                      width: 150,
                      background: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: 14,
                      padding: '8px 0',
                      zIndex: 20,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    {(Object.keys(postTypeLabels) as PostType[]).map((type) => {
                      const selected = postType === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setPostType(type);
                            setIsDropdownOpen(false);
                            if (type === 'free') {
                              setIsRecruiting(false);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 0',
                            background: selected ? '#F0F9FF' : 'transparent',
                            border: 'none',
                            color: selected ? '#00AEEF' : '#4A5565',
                            fontSize: 15,
                            fontWeight: selected ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {postTypeLabels[type]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {showRecruitToggle && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRecruiting((v) => !v)}
                    style={{
                      width: 56,
                      height: 34,
                      borderRadius: 999,
                      border: 'none',
                      background: isRecruiting ? '#828282' : '#D1D5DB',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: isRecruiting ? 27 : 5,
                        width: 24,
                        height: 24,
                        background: '#fff',
                        borderRadius: '50%',
                        transition: 'left 0.15s',
                      }}
                    />
                  </button>

                  <span
                    style={{
                      color: isRecruiting ? '#00AEEF' : '#828282',
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    {isRecruiting ? '모집 중' : '모집 완료'}
                  </span>
                </>
              )}
            </div>

            <X size={20} color="#00AEEF" />
          </div>

          <input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px solid #A7E5FF',
              fontSize: 22,
              marginBottom: 16,
              outline: 'none',
            }}
          />

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요"
          />


          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {showSettingButton ? (
              <button
                type="button"
                onClick={() => setIsSettingOpen(true)}
                style={{
                  width: 120,
                  height: 42,
                  borderRadius: 999,
                  border: '1px solid #BDBDBD',
                  background: '#fff',
                  color: '#828282',
                  cursor: 'pointer',
                }}
              >
                설정
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  width: 120,
                  height: 42,
                  borderRadius: 999,
                  border: '1px solid #BDBDBD',
                  background: '#fff',
                  color: '#828282',
                  cursor: 'pointer',
                }}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: 120,
                  height: 42,
                  borderRadius: 999,
                  background: submitting ? '#9CD8F0' : '#00AEEF',
                  color: '#fff',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting
                  ? isEditMode
                    ? '수정 중...'
                    : '등록 중...'
                  : isEditMode
                    ? '수정'
                    : '등록'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <PostSettingModal
        isOpen={isSettingOpen}
        postType={postType}
        initial={settings}
        onClose={() => setIsSettingOpen(false)}
        onSave={(s) => {
          setSettings(s);
          setIsSettingOpen(false);
        }}
      />
    </main>
  );
}

function PostSettingModal({
  isOpen,
  postType,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  postType: PostType;
  initial?: PostSettings;
  onClose: () => void;
  onSave: (settings: PostSettings) => void;
}) {
  const [recruitCount, setRecruitCount] = useState(initial?.recruitCount ?? '');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');

  const [studyTags, setStudyTags] = useState<StudyTag[]>(
    (initial?.studyTags as StudyTag[]) ?? []
  );
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    (initial?.certificateTypes as CertificateType[]) ?? []
  );

  const [activeStackTab, setActiveStackTab] = useState<StackSection>('프론트');
  const [recruitStacks, setRecruitStacks] = useState<string[]>(
    initial?.recruitStacks ?? []
  );
  const [usingStacks, setUsingStacks] = useState<string[]>(
    initial?.usingStacks ?? []
  );
  const [platformTypes, setPlatformTypes] = useState<PlatformLabel[]>(
    initial?.platformTypes ?? []
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      recruitCount,
      deadline,
      studyTags,
      certificateTypes,
      recruitStacks,
      usingStacks,
      platformTypes,
    });
  };

  const toggleArrayValue = <T extends string>(
    value: T,
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  const isCertificateSelected = studyTags.includes('자격증');

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.25)',
          zIndex: 100,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 820,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: 14,
          padding: '36px 44px',
          boxSizing: 'border-box',
          zIndex: 101,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 20,
            top: 18,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <X color="#00AEEF" size={26} />
        </button>

        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>
          게시글 설정
        </h2>

        <div style={{ display: 'flex', gap: 18, marginBottom: 28 }}>
          <Field label="모집 인원">
            <input
              value={recruitCount}
              onChange={(e) => {
                const value = e.target.value;

                if (value === '') {
                  setRecruitCount('');
                  return;
                }

                const num = Number(value);

                if (isNaN(num)) return;

                if (num < 0) {
                  setRecruitCount('0');
                  return;
                }

                setRecruitCount(String(num));
              }}

              type="number"
              min={0}
              inputMode="numeric"
              placeholder="예: 4"
              style={inputStyle}
            />
          </Field>

          <Field label="모집 마감 날짜">
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="date"
              style={inputStyle}
            />
          </Field>
        </div>

        {postType === 'study' && (
          <>
            <SectionTitle>스터디 태그</SectionTitle>
            <div style={checkboxGridStyle}>
              {(['어학', '자격증', '코딩테스트'] as StudyTag[]).map((tag) => (
                <CheckBoxButton
                  key={tag}
                  label={tag}
                  checked={studyTags[0] === tag}
                  onClick={() => {
                    // 단일 선택: 이미 선택된 항목을 다시 누르면 해제, 아니면 그 값으로 교체
                    setStudyTags(studyTags[0] === tag ? [] : [tag]);
                    // 자격증이 아닐 때 자격증 유형은 비움
                    if (tag !== '자격증') setCertificateTypes([]);
                  }}
                />
              ))}
            </div>

            {isCertificateSelected && (
              <>
                <SectionTitle>자격증 유형</SectionTitle>
                <div style={checkboxGridStyle}>
                  {(['필기', '실기'] as CertificateType[]).map((type) => (
                    <CheckBoxButton
                      key={type}
                      label={type}
                      checked={certificateTypes.includes(type)}
                      onClick={() =>
                        toggleArrayValue(
                          type,
                          certificateTypes,
                          setCertificateTypes
                        )
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {postType === 'project' && (
          <>
            <SectionTitle>프로젝트 스택</SectionTitle>

            <div style={{ display: 'flex', marginBottom: 20 }}>
              {(['프론트', '백엔드', 'AI'] as StackSection[]).map((tab) => {
                const active = activeStackTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveStackTab(tab)}
                    style={{
                      width: 100,
                      height: 38,
                      border: '1px solid #00AEEF',
                      background: active ? '#00AEEF' : '#fff',
                      color: active ? '#fff' : '#00AEEF',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: 26 }}>
              <SmallTitle>구인 스택</SmallTitle>
              <div style={stackGridStyle}>
                {stackData[activeStackTab].map((stack) => (
                  <CheckBoxButton
                    key={`recruit-${stack}`}
                    label={stack}
                    checked={recruitStacks.includes(stack)}
                    onClick={() =>
                      toggleArrayValue(stack, recruitStacks, setRecruitStacks)
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <SmallTitle>사용하는 스택</SmallTitle>
              <div style={stackGridStyle}>
                {stackData[activeStackTab].map((stack) => (
                  <CheckBoxButton
                    key={`using-${stack}`}
                    label={stack}
                    checked={usingStacks.includes(stack)}
                    onClick={() =>
                      toggleArrayValue(stack, usingStacks, setUsingStacks)
                    }
                  />
                ))}
              </div>
            </div>

            <SectionTitle>플랫폼</SectionTitle>
            <div style={checkboxGridStyle}>
              {(['웹', '앱', '기타'] as PlatformLabel[]).map((p) => (
                <CheckBoxButton
                  key={`platform-${p}`}
                  label={p}
                  checked={platformTypes.includes(p)}
                  onClick={() =>
                    toggleArrayValue(p, platformTypes, setPlatformTypes)
                  }
                />
              ))}
            </div>
          </>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 34,
          }}
        >
          <button type="button" onClick={onClose} style={cancelButtonStyle}>
            취소
          </button>
          <button type="button" onClick={handleSave} style={saveButtonStyle}>
            저장
          </button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
          color: '#4A5565',
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 20, fontWeight: 700, margin: '28px 0 14px' }}>
      {children}
    </h3>
  );
}

function SmallTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 12px' }}>
      {children}
    </h4>
  );
}

function CheckBoxButton({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 46,
        borderRadius: 10,
        border: checked ? '2px solid #00AEEF' : '2px solid #D9D9D9',
        background: checked ? '#F0F9FF' : '#fff',
        color: checked ? '#00AEEF' : '#808080',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: checked ? 700 : 500,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: checked ? '2px solid #00AEEF' : '2px solid #828282',
          background: checked ? '#00AEEF' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && <Check color="white" size={14} strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  borderRadius: 10,
  border: '1px solid #D9D9D9',
  padding: '0 14px',
  boxSizing: 'border-box',
  fontSize: 15,
  outline: 'none',
};

const checkboxGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
};

const stackGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 12,
};

const cancelButtonStyle: React.CSSProperties = {
  width: 110,
  height: 42,
  borderRadius: 999,
  border: '1px solid #BDBDBD',
  background: '#fff',
  color: '#828282',
  cursor: 'pointer',
};

const saveButtonStyle: React.CSSProperties = {
  width: 110,
  height: 42,
  borderRadius: 999,
  border: 'none',
  background: '#00AEEF',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
};
