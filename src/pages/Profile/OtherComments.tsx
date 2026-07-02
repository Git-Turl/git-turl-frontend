import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronRight, Heart, Calendar, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import {
  getMemberComments,
  getMemberProfile,
  type MemberCommentItem,
} from '../../api/member';

const formatDate = (iso: string) =>
  iso ? iso.slice(0, 10).replace(/-/g, '.') : '';

const BOARD_TYPE_LABEL: Record<string, string> = {
  FORUM: '자유게시판',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  FREE: '자유게시판',
};

export function OtherComments() {
  const { memberId: memberIdParam } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const memberIdNum = memberIdParam ? Number(memberIdParam) : NaN;

  const [nickname, setNickname] = useState<string>('');
  const [comments, setComments] = useState<MemberCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(memberIdNum)) {
      setLoadError('잘못된 프로필입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      getMemberProfile(memberIdNum),
      getMemberComments(memberIdNum, { sort: 'latest', page: 0, size: 50 }),
    ])
      .then(([profRes, commentsRes]) => {
        if (cancelled) return;
        if (profRes.isSuccess && profRes.result) {
          setNickname(profRes.result.nickname);
        }
        if (commentsRes.isSuccess && commentsRes.result?.commentList) {
          setComments(commentsRes.result.commentList);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[other-comments] load error', err);
        setLoadError('댓글을 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberIdNum]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto text-center py-12 text-gray-500">
          로딩 중...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto text-center py-12 text-gray-500">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link
            to={`/profile/${memberIdNum}`}
            className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            {nickname || '프로필'}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Comments</span>
        </div>

        <h1 className="text-3xl mb-8 text-gray-900">Comments</h1>

        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            아직 작성한 댓글이 없어요.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <Card
                key={c.commentId}
                onClick={() => navigate(`/community/${c.boardId}`)}
                className="p-6 bg-white border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
              >
                <div className="space-y-2">
                  {/* 원본 게시글 정보 */}
                  <div className="flex items-center gap-2 text-xs text-sky-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>
                      {BOARD_TYPE_LABEL[c.boardType] ?? c.boardType}
                    </span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-500 truncate">
                      {c.boardTitle}
                    </span>
                  </div>

                  {/* 댓글 내용 */}
                  <p className="text-gray-900 leading-relaxed">{c.content}</p>

                  {/* 메타 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      <span>{c.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-6 text-xs text-gray-400 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            총 {comments.length}개
          </div>
        )}
      </div>
    </div>
  );
}
