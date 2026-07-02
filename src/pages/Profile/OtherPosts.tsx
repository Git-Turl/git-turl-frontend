import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ChevronRight,
  Heart,
  Calendar,
  Folder,
  MessageCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import {
  getMemberBoards,
  getMemberProfile,
  type MemberBoardItem,
} from '../../api/member';

const formatDate = (iso: string) =>
  iso ? iso.slice(0, 10).replace(/-/g, '.') : '';

const BOARD_TYPE_LABEL: Record<string, string> = {
  FORUM: '자유게시판',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  FREE: '자유게시판',
};

export function OtherPosts() {
  const { memberId: memberIdParam } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const memberIdNum = memberIdParam ? Number(memberIdParam) : NaN;

  const [nickname, setNickname] = useState<string>('');
  const [boards, setBoards] = useState<MemberBoardItem[]>([]);
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
      getMemberBoards(memberIdNum, { sort: 'latest', page: 0, size: 50 }),
    ])
      .then(([profRes, boardsRes]) => {
        if (cancelled) return;
        if (profRes.isSuccess && profRes.result) {
          setNickname(profRes.result.nickname);
        }
        if (boardsRes.isSuccess && boardsRes.result?.boardList) {
          setBoards(boardsRes.result.boardList);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[other-posts] load error', err);
        setLoadError('게시글을 불러오지 못했어요.');
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
          <span className="text-gray-600">Posts</span>
        </div>

        <h1 className="text-3xl mb-8 text-gray-900">Posts</h1>

        {boards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            아직 작성한 게시글이 없어요.
          </div>
        ) : (
          <div className="space-y-4">
            {boards.map((b) => (
              <Card
                key={b.boardId}
                onClick={() => navigate(`/community/${b.boardId}`)}
                className="p-6 bg-white border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <h2 className="text-xl text-gray-900 group-hover:text-sky-700 transition-colors">
                    {b.title}
                  </h2>
                  {b.content && (
                    <p
                      className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: b.content
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 200),
                      }}
                    />
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-sky-500" />
                      <span className="text-sky-600">
                        {BOARD_TYPE_LABEL[b.boardType] ?? b.boardType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      <span>{b.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(b.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {boards.length > 0 && (
          <div className="mt-6 text-xs text-gray-400 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            총 {boards.length}개
          </div>
        )}
      </div>
    </div>
  );
}
