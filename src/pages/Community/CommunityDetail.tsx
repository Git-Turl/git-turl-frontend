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
} from 'lucide-react';
import {
  createComment,
  deleteBoard,
  deleteComment,
  getBoardDetail,
  getComments,
  type BoardDetail,
  type BoardType,
  type Comment,
} from '../../api/community';
import { getRecruitStatus } from '../../utils/localBoardStatus';
import '../../components/RichTextEditor/editor.css';

const boardTypeLabel: Record<BoardType, string> = {
  STUDY: '스터디',
  PROJECT: '프로젝트',
  FORUM: '자유게시판',
};

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
  const [menuOpen, setMenuOpen] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1); // UI 1-indexed
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentTotalElements, setCommentTotalElements] = useState(0);
  const [newComment, setNewComment] = useState('');

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
    // TODO: 수정 모드 라우팅 (예: /community/write?id=...) 구현 시 연결
    navigate('/community/write');
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

  const addReply = async (parentId: number, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await createComment(postId, {
        content: content.trim(),
        parentId,
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
      const res = await createComment(postId, { content: newComment.trim() });
      if (res.isSuccess) {
        setNewComment('');
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
              onClick={() => {
                // TODO: 좋아요 API 연동 필요. 현재 백엔드 스펙에 토글 엔드포인트가 없어 로컬 토글만 동작.
                setLiked((v) => !v);
                setLikeCount((c) => (liked ? c - 1 : c + 1));
              }}
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
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
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#E5E7EB',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: '#4A5565' }}>
            {post.authorName} | {formatDate(post.createdAt)} | 조회 {post.views}
          </span>
        </div>

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
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#E5E7EB',
                flexShrink: 0,
                marginTop: 4,
              }}
            />
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
                flexShrink: 0,
                alignSelf: 'flex-end',
              }}
            >
              등록
            </button>
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
                replies={getReplies(comment.commentId)}
                onReply={(content) => addReply(comment.commentId, content)}
                onDelete={handleDeleteComment}
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
  replies,
  onReply,
  onDelete,
  isReply = false,
}: {
  comment: Comment;
  replies?: Comment[];
  onReply?: (content: string) => void;
  onDelete?: (commentId: number) => void;
  isReply?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const ref = useRef<HTMLDivElement>(null);

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
    onReply(replyText);
    setReplyText('');
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
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#E5E7EB',
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#4A5565', marginBottom: 4 }}>
            {comment.writerName} | {formatDate(comment.createdAt)}
          </div>
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
                  // TODO: 댓글 수정 모달/인라인 편집 구현 시 updateComment(commentId, ...) 호출
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
              flexShrink: 0,
            }}
          >
            등록
          </button>
        </div>
      )}

      {replies && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentRow
              key={reply.commentId}
              comment={reply}
              isReply
              onDelete={onDelete}
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
