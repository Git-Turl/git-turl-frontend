import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Lock,
} from 'lucide-react';
import {
  createComment,
  deleteBoard,
  deleteBoardLike,
  deleteComment,
  deleteCommentLike,
  getBoardDetail,
  getComments,
  toggleBoardLike,
  toggleCommentLike,
  updateComment,
  boardStacksToLabels,
  PLATFORM_TYPE_LABEL,
  type BoardDetail,
  type BoardType,
  type Comment,
  type StudyTag,
  type CertificateType,
} from '../../api/community';
import { getRecruitStatus } from '../../utils/localBoardStatus';
import { AuthorLink, getMyMemberId } from '../../components/common/AuthorLink';
import defaultProfile from '../../assets/img/img_profile.svg';
import '../../components/RichTextEditor/editor.css';

const boardTypeLabel: Record<BoardType, string> = {
  STUDY: '스터디',
  PROJECT: '프로젝트',
  FORUM: '자유게시판',
};

const studyTagLabel: Record<StudyTag, string> = {
  CERTIFICATE: '자격증',
  CODING_TEST: '코딩테스트',
  LANGUAGE: '어학',
};

const certificateTypeLabel: Record<CertificateType, string> = {
  WRITTEN: '필기',
  PRACTICAL: '실기',
};

// 스택/설정 칩 한 줄. 라벨(선택) + 값들.
function MetaChips({
  label,
  values,
  accent = false,
}: {
  label?: string;
  values: string[];
  accent?: boolean;
}) {
  if (!values.length) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#6B7280',
            marginRight: 2,
          }}
        >
          {label}
        </span>
      )}
      {values.map((v) => (
        <span
          key={v}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: accent ? '#00AEEF' : '#F0F9FF',
            color: accent ? 'white' : '#0091C7',
            border: accent ? 'none' : '1px solid #B8E6FE',
          }}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

// 비밀댓글 체크박스 라벨 공통 스타일
const secretToggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontWeight: 500,
  color: '#6B7280',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

// 작성자 아바타 — 프로필 이미지 URL 있으면 img, 없으면 기본 이미지.
// '' 빈 문자열 도 "이미지 없음" 으로 간주.
function Avatar({ src, size = 28 }: { src?: string; size?: number }) {
  const url = src && src.length > 0 ? src : defaultProfile;
  return (
    <img
      src={url}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        background: '#E5E7EB',
        flexShrink: 0,
      }}
      onError={(e) => {
        e.currentTarget.src = defaultProfile;
      }}
    />
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}년 ${mm}월 ${dd}일 ${hh}:${mi}`;
}

export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const postId = Number(id);

  const [post, setPost] = useState<BoardDetail | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  // 좋아요 처리 중인 commentId 집합 — 같은 댓글 더블클릭 시 응답 순서 어긋남 방지.
  const [commentLikeBusy, setCommentLikeBusy] = useState<Set<number>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1); // UI 1-indexed
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentTotalElements, setCommentTotalElements] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newCommentSecret, setNewCommentSecret] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // 게시글 상세 조회
  useEffect(() => {
    if (isNaN(postId)) {
      setPostLoading(false);
      setPostError('잘못된 게시글입니다.');
      return;
    }
    let cancelled = false;
    setPostLoading(true);
    setPostError(null);
    getBoardDetail(postId)
      .then((res) => {
        if (cancelled) return;
        if (res.isSuccess && res.result) {
          setPost(res.result);
          setLiked(res.result.isLiked);
          setLikeCount(res.result.likeCount);
        } else {
          setPostError(res.message || '게시글을 불러오지 못했습니다.');
        }
      })
      .catch(() => {
        if (!cancelled) setPostError('게시글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setPostLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // 댓글 목록 조회
  const loadComments = useCallback(
    (page: number) => {
      if (isNaN(postId)) return;
      getComments(postId, { page: page - 1 })
        .then((res) => {
          if (res.isSuccess && res.result) {
            setComments(res.result.commentList ?? []);
            setCommentTotalPages(Math.max(1, res.result.totalPage ?? 1));
            setCommentTotalElements(res.result.totalElements ?? 0);
          }
        })
        .catch(() => {
          // 무시: 댓글 로딩 실패는 게시글 표시를 막지 않음
        });
    },
    [postId]
  );

  useEffect(() => {
    loadComments(commentPage);
  }, [loadComments, commentPage]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // 최상위 댓글 / 대댓글 분리 (parentId === null 이거나 depth === 0)
  const topLevelComments = comments.filter(
    (c) => c.parentId === null || c.parentId === undefined
  );
  const getReplies = (parentId: number) =>
    comments.filter((c) => c.parentId === parentId);

  const handleEdit = () => {
    setMenuOpen(false);
    navigate(`/community/write?id=${postId}`);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await deleteBoard(postId);
      if (res.isSuccess) {
        navigate('/community');
      } else {
        alert(res.message || '삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 로딩/에러 처리
  if (postLoading) {
    return (
      <CenterMessage onBack={() => navigate('/community')}>
        불러오는 중...
      </CenterMessage>
    );
  }

  if (postError || !post) {
    return (
      <CenterMessage onBack={() => navigate('/community')}>
        {postError || '존재하지 않거나 삭제된 게시글입니다.'}
      </CenterMessage>
    );
  }

  const addReply = async (
    parentId: number,
    content: string,
    isSecret = false
  ) => {
    if (!content.trim()) return;
    try {
      const res = await createComment(postId, {
        content: content.trim(),
        parentId,
        isSecret,
      });
      if (res.isSuccess) {
        loadComments(commentPage);
      } else {
        alert(res.message || '답글 등록에 실패했습니다.');
      }
    } catch {
      alert('답글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await createComment(postId, {
        content: newComment.trim(),
        isSecret: newCommentSecret,
      });
      if (res.isSuccess) {
        setNewComment('');
        setNewCommentSecret(false);
        loadComments(commentPage);
      } else {
        alert(res.message || '댓글 등록에 실패했습니다.');
      }
    } catch {
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await deleteComment(commentId);
      if (res.isSuccess) {
        loadComments(commentPage);
      } else {
        alert(res.message || '삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateComment = async (
    commentId: number,
    content: string,
    isSecret = false
  ): Promise<boolean> => {
    if (!content.trim()) return false;
    try {
      const res = await updateComment(commentId, {
        content: content.trim(),
        isSecret,
      });
      if (res.isSuccess) {
        loadComments(commentPage);
        return true;
      }
      alert(res.message || '댓글 수정에 실패했습니다.');
      return false;
    } catch {
      alert('댓글 수정 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleToggleCommentLike = async (commentId: number) => {
    // 같은 댓글이 이미 처리 중이면 무시 (더블클릭 방지).
    if (commentLikeBusy.has(commentId)) return;
    setCommentLikeBusy((prev) => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });

    // 현재 상태 캡처 — 분기 결정에 사용.
    const target = comments.find((c) => c.commentId === commentId);
    const prevLiked = !!target?.isLiked;

    // 낙관적 업데이트.
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
            }
          : c
      )
    );
    try {
      // 현재 상태에 따라 POST(추가) / DELETE(취소) 분기.
      const res = prevLiked
        ? await deleteCommentLike(commentId)
        : await toggleCommentLike(commentId);
      if (res.isSuccess && res.result) {
        // likeCount 만 서버 값으로 동기화. isLiked 는 옵티미스틱 토글값 그대로.
        const { likeCount } = res.result;
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === commentId ? { ...c, likeCount } : c
          )
        );
      } else {
        console.warn('[CommunityDetail] 댓글 좋아요 처리 실패', res.message);
      }
    } catch (e) {
      console.error('[CommunityDetail] 댓글 좋아요 처리 에러', e);
    } finally {
      setCommentLikeBusy((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const showPagination = commentTotalPages > 1;

  return (
    <div
      style={{
        padding: '24px 32px',
        background: '#F0F9FF',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => navigate('/community')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 10px 6px 6px',
          marginBottom: 14,
          background: 'transparent',
          border: 'none',
          color: '#4A5565',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: 8,
        }}
      >
        <ChevronLeft size={18} />
        돌아가기
      </button>

      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '28px 32px',
          border: '1px solid #DFF2FE',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: 10, display: 'flex', gap: 6 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 12px',
              borderRadius: 999,
              border: '1px solid #0084D1',
              background: '#E0F2FE',
              color: '#0084D1',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {boardTypeLabel[post.boardType] || '게시글'}
          </span>
          {(() => {
            const status = getRecruitStatus(post.boardId);
            if (!status) return null;
            const isRecruiting = status === 'RECRUITING';
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 12px',
                  borderRadius: 999,
                  border: `1px solid ${isRecruiting ? '#00AEEF' : '#828282'}`,
                  background: 'white',
                  color: isRecruiting ? '#00AEEF' : '#828282',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {isRecruiting ? '모집중' : '모집완료'}
              </span>
            );
          })()}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'black',
              flex: 1,
              minWidth: 0,
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
            }}
          >
            <button
              onClick={async () => {
                if (likeBusy) return;
                // 낙관적 업데이트 — 서버 응답 오면 실제 값으로 교체
                const prevLiked = liked;
                const prevCount = likeCount;
                setLiked(!prevLiked);
                setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
                setLikeBusy(true);
                try {
                  // 현재 상태(prevLiked)에 따라 분기:
                  // - 좋아요 추가: POST (toggleBoardLike)
                  // - 좋아요 취소: DELETE (deleteBoardLike)
                  const res = prevLiked
                    ? await deleteBoardLike(postId)
                    : await toggleBoardLike(postId);
                  if (res.isSuccess && res.result) {
                    // 서버 응답으로 likeCount 동기화 (정확한 값 사용).
                    // liked 값은 옵티미스틱 토글 결과 그대로 유지 (POST는 liked, DELETE는 isLiked 로 필드명 다름 + 신뢰도 이슈).
                    setLikeCount(res.result.likeCount);
                  } else {
                    console.warn(
                      '[CommunityDetail] 좋아요 처리 실패',
                      res.message
                    );
                  }
                } catch (e) {
                  console.error('[CommunityDetail] 좋아요 처리 에러', e);
                } finally {
                  setLikeBusy(false);
                }
              }}
              disabled={likeBusy}
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: likeBusy ? 'not-allowed' : 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                opacity: likeBusy ? 0.6 : 1,
              }}
            >
              <Heart
                size={22}
                color={liked ? '#000' : '#4A5565'}
                fill={liked ? '#000' : 'none'}
                strokeWidth={2}
              />
              <span style={{ fontSize: 13, color: '#4A5565' }}>{likeCount}</span>
            </button>

            {(() => {
              // 본인 ID 못 받아오면 기본 표시. 본인 ID 있을 땐 타인 글에서만 숨김.
              const myId = getMyMemberId();
              return myId == null || myId === post.writerId;
            })() && (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="더보기"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <MoreVertical size={22} color="#4A5565" />
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      padding: 4,
                      minWidth: 124,
                      zIndex: 10,
                    }}
                  >
                    <MenuItem onClick={handleEdit} icon={<Pencil size={14} />}>
                      수정하기
                    </MenuItem>
                    <MenuItem onClick={handleDelete} icon={<Trash2 size={14} />}>
                      삭제하기
                    </MenuItem>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <AuthorLink
            writerId={post.writerId}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Avatar src={post.profileImage ?? undefined} size={28} />
            <span style={{ fontSize: 13, color: '#4A5565' }}>
              {post.authorName}
            </span>
          </AuthorLink>
          <span style={{ fontSize: 13, color: '#4A5565' }}>
            | {formatDate(post.createdAt)} | 조회 {post.views}
          </span>
        </div>

        {/* 프로젝트/스터디 게시판: 설정한 스택·플랫폼·태그를 상단에 노출 */}
        {post.boardType !== 'FORUM' &&
          (() => {
            const recruit = boardStacksToLabels(post.recruitStacks);
            const project = boardStacksToLabels(post.projectStacks);
            const platforms = (post.platformTypes ?? []).map(
              (p) => PLATFORM_TYPE_LABEL[p]
            );
            const studyChips: string[] = [];
            if (post.boardType === 'STUDY') {
              if (post.studyTag) studyChips.push(studyTagLabel[post.studyTag]);
              if (post.certificateType)
                studyChips.push(certificateTypeLabel[post.certificateType]);
            }
            // 모집 설정 (STUDY/PROJECT 공통): 인원 · 마감일
            const recruitInfo: string[] = [];
            if (post.recruitCount != null)
              recruitInfo.push(`모집 ${post.recruitCount}명`);
            if (post.recruitDeadline)
              recruitInfo.push(`마감 ${post.recruitDeadline}`);
            const hasAny =
              recruit.length ||
              project.length ||
              platforms.length ||
              studyChips.length ||
              recruitInfo.length;
            if (!hasAny) return null;
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '14px 16px',
                  background: '#FAFCFF',
                  border: '1px solid #E5F4FB',
                  borderRadius: 12,
                  marginBottom: 18,
                }}
              >
                <MetaChips label="분류" values={studyChips} accent />
                <MetaChips label="플랫폼" values={platforms} accent />
                <MetaChips label="모집" values={recruitInfo} />
                <MetaChips label="구인 스택" values={recruit} />
                <MetaChips label="사용 스택" values={project} />
              </div>
            );
          })()}

        <div style={{ height: 1, background: '#E5E7EB', marginBottom: 20 }} />

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            style={{
              maxWidth: '100%',
              borderRadius: 12,
              marginBottom: 20,
            }}
          />
        )}

        {/*
          본문은 글쓰기 시 TipTap 에디터로 작성한 HTML.
          시연용으로 sanitize 없이 그대로 렌더 — 운영 배포 전 DOMPurify 같은 라이브러리로 정제 필요.
        */}
        <div
          className="rte-content"
          style={{ minHeight: 220, marginBottom: 24 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div style={{ marginTop: 32 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'black',
              marginBottom: 10,
            }}
          >
            댓글 ({commentTotalElements})
          </h2>
          <div style={{ height: 1, background: '#E5E7EB', marginBottom: 16 }} />

          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '12px 14px',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              background: '#FAFAFA',
              marginBottom: 18,
              alignItems: 'flex-start',
            }}
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={2}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1F2937',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-end',
                alignSelf: 'stretch',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <label style={secretToggleStyle}>
                <input
                  type="checkbox"
                  checked={newCommentSecret}
                  onChange={(e) => setNewCommentSecret(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <Lock size={12} />
                비밀댓글
              </label>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '8px 18px',
                  background: newComment.trim() ? '#00AEEF' : '#D1D5DB',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                등록
              </button>
            </div>
          </div>

          {topLevelComments.length === 0 ? (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: 13,
              }}
            >
              아직 댓글이 없습니다.
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <CommentRow
                key={comment.commentId}
                comment={comment}
                postWriterId={post.writerId}
                replies={getReplies(comment.commentId)}
                onReply={(content, isSecret) =>
                  addReply(comment.commentId, content, isSecret)
                }
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
                onToggleLike={handleToggleCommentLike}
              />
            ))
          )}

          {showPagination && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                marginTop: 20,
              }}
            >
              <PageBtn
                onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                disabled={commentPage === 1}
                icon={<ChevronLeft size={14} />}
              />
              {Array.from({ length: commentTotalPages }, (_, i) => i + 1).map(
                (n) => {
                  const active = n === commentPage;
                  return (
                    <button
                      key={n}
                      onClick={() => setCommentPage(n)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: 'none',
                        background: active ? '#00AEEF' : 'transparent',
                        color: active ? 'white' : '#4A5565',
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  );
                }
              )}
              <PageBtn
                onClick={() =>
                  setCommentPage((p) => Math.min(commentTotalPages, p + 1))
                }
                disabled={commentPage === commentTotalPages}
                icon={<ChevronRight size={14} />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CenterMessage({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        padding: '24px 32px',
        background: '#F0F9FF',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 10px 6px 6px',
          marginBottom: 14,
          background: 'transparent',
          border: 'none',
          color: '#4A5565',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: 8,
        }}
      >
        <ChevronLeft size={18} />
        돌아가기
      </button>
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '60px 32px',
          border: '1px solid #DFF2FE',
          textAlign: 'center',
          color: '#828282',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  postWriterId,
  replies,
  onReply,
  onDelete,
  onUpdate,
  onToggleLike,
  isReply = false,
}: {
  comment: Comment;
  postWriterId?: number;
  replies?: Comment[];
  onReply?: (content: string, isSecret: boolean) => void;
  onDelete?: (commentId: number) => void;
  onUpdate?: (
    commentId: number,
    content: string,
    isSecret?: boolean
  ) => Promise<boolean>;
  onToggleLike?: (commentId: number) => void;
  isReply?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySecret, setReplySecret] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editSecret, setEditSecret] = useState(comment.isSecret);
  const [editSaving, setEditSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 비밀댓글은 게시글 작성자 + 댓글 작성자에게만 내용 공개.
  // 그 외(비로그인 포함)에겐 잠금 문구만 노출.
  const myId = getMyMemberId();
  const isSecretHidden =
    comment.isSecret &&
    !(
      myId != null &&
      (myId === comment.writerId || myId === postWriterId)
    );

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleSubmitReply = () => {
    if (!replyText.trim() || !onReply) return;
    onReply(replyText, replySecret);
    setReplyText('');
    setReplySecret(false);
    setReplyOpen(false);
  };

  return (
    <div style={{ marginLeft: isReply ? 40 : 0 }}>
      <div style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
        {isReply && (
          <CornerDownRight
            size={16}
            color="#9CA3AF"
            style={{ marginTop: 8, flexShrink: 0 }}
          />
        )}
        <AuthorLink
          writerId={comment.writerId}
          style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}
        >
          <div style={{ marginTop: 2 }}>
            <Avatar src={comment.profileImage ?? undefined} size={28} />
          </div>
        </AuthorLink>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13,
              color: '#4A5565',
              marginBottom: 4,
            }}
          >
            <AuthorLink writerId={comment.writerId}>
              {comment.writerName}
            </AuthorLink>
            {' | '}
            {formatDate(comment.createdAt)}
            {comment.isSecret && !isSecretHidden && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  color: '#00AEEF',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <Lock size={10} />
                비밀
              </span>
            )}
          </div>

          {isSecretHidden ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: '#9CA3AF',
                fontStyle: 'italic',
                marginBottom: 4,
              }}
            >
              <Lock size={13} />
              비밀 댓글입니다.
            </div>
          ) : editOpen ? (
            // 인라인 수정 모드
            <div style={{ marginBottom: 4 }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #00AEEF',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <label style={{ ...secretToggleStyle, marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={editSecret}
                  onChange={(e) => setEditSecret(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <Lock size={12} />
                비밀댓글
              </label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={async () => {
                    if (!onUpdate || editSaving) return;
                    setEditSaving(true);
                    const ok = await onUpdate(
                      comment.commentId,
                      editText,
                      editSecret
                    );
                    setEditSaving(false);
                    if (ok) setEditOpen(false);
                  }}
                  disabled={editSaving || !editText.trim()}
                  style={{
                    padding: '6px 14px',
                    background: editSaving || !editText.trim() ? '#D1D5DB' : '#00AEEF',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: editSaving || !editText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => {
                    setEditOpen(false);
                    setEditText(comment.content);
                    setEditSecret(comment.isSecret);
                  }}
                  disabled={editSaving}
                  style={{
                    padding: '6px 14px',
                    background: 'white',
                    border: '1px solid #D1D5DB',
                    color: '#4A5565',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 14,
                color: '#1F2937',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                marginBottom: 4,
              }}
            >
              {comment.content}
            </div>
          )}

          {!editOpen && !isSecretHidden && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* 좋아요 */}
              {onToggleLike && (
                <button
                  onClick={() => onToggleLike(comment.commentId)}
                  aria-label={comment.isLiked ? '좋아요 취소' : '좋아요'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    background: 'transparent',
                    border: 'none',
                    padding: '2px 0',
                    cursor: 'pointer',
                    color: comment.isLiked ? '#000' : '#828282',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <Heart
                    size={13}
                    color={comment.isLiked ? '#000' : '#828282'}
                    fill={comment.isLiked ? '#000' : 'none'}
                    strokeWidth={2}
                  />
                  <span>{comment.likeCount}</span>
                </button>
              )}

              {/* 답글 (대댓글엔 없음) */}
              {!isReply && onReply && (
                <button
                  onClick={() => setReplyOpen((v) => !v)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0084D1',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '2px 0',
                  }}
                >
                  {replyOpen ? '취소' : '답글'}
                </button>
              )}
            </div>
          )}
        </div>
        {!isSecretHidden &&
          (myId == null || myId === comment.writerId) && (
          <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="더보기"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <MoreVertical size={18} color="#9CA3AF" />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  padding: 4,
                  minWidth: 124,
                  zIndex: 10,
                }}
              >
                <MenuItem
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    setMenuOpen(false);
                    setEditText(comment.content);
                    setEditSecret(comment.isSecret);
                    setEditOpen(true);
                  }}
                >
                  수정하기
                </MenuItem>
                <MenuItem
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(comment.commentId);
                  }}
                >
                  삭제하기
                </MenuItem>
              </div>
            )}
          </div>
        )}
      </div>

      {replyOpen && (
        <div
          style={{
            marginLeft: 40,
            marginBottom: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <CornerDownRight
            size={16}
            color="#9CA3AF"
            style={{ marginTop: 10, flexShrink: 0 }}
          />
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답글을 입력하세요"
            rows={2}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <label style={secretToggleStyle}>
              <input
                type="checkbox"
                checked={replySecret}
                onChange={(e) => setReplySecret(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <Lock size={12} />
              비밀댓글
            </label>
            <button
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
              style={{
                padding: '8px 14px',
                background: replyText.trim() ? '#00AEEF' : '#D1D5DB',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: replyText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              등록
            </button>
          </div>
        </div>
      )}

      {replies && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentRow
              key={reply.commentId}
              comment={reply}
              postWriterId={postWriterId}
              isReply
              onDelete={onDelete}
              onUpdate={onUpdate}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon,
  children,
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        fontSize: 13,
        color: '#4A5565',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function PageBtn({
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
        width: 28,
        height: 28,
        borderRadius: 6,
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
