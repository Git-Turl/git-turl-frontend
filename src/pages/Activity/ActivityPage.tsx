import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, GitBranch, MessageSquare, ThumbsUp } from 'lucide-react';
import {
  getMyBoards,
  getMyComments,
  getReportList,
  type MyBoardItem,
  type MyCommentItem,
  type ReportListItem,
} from '../../api/member';

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

type Activity = {
  icon: typeof GitBranch;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
  createdAt: string;
  onClick?: () => void;
};

const PAGE_SIZE = 30;

export function ActivityPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [boards, setBoards] = useState<MyBoardItem[]>([]);
  const [comments, setComments] = useState<MyCommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getReportList({ answerType: 'ALL', pageSize: PAGE_SIZE })
        .then((res) => (res.isSuccess && res.result?.data ? res.result.data : []))
        .catch(() => []),
      getMyBoards({ sort: 'latest', page: 0, size: PAGE_SIZE })
        .then((res) => (res.isSuccess && res.result?.posts ? res.result.posts : []))
        .catch(() => []),
      getMyComments({ sort: 'latest', page: 0, size: PAGE_SIZE })
        .then((res) =>
          res.isSuccess && res.result?.comments ? res.result.comments : []
        )
        .catch(() => []),
    ])
      .then(([r, b, c]) => {
        if (cancelled) return;
        setReports(r);
        setBoards(b);
        setComments(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reportActivities: Activity[] = reports.map((r) => ({
    icon: GitBranch,
    iconBg: '#EDF3FE',
    iconColor: '#578EFE',
    title: `${r.reportTitle || r.repoName || '레포지터리'}를 분석했어요`,
    time: relativeTime(r.createdAt),
    createdAt: r.createdAt,
    onClick: () => navigate(`/analytics/detail/${r.reportId}`),
  }));

  const boardActivities: Activity[] = boards.map((b) => ({
    icon: MessageSquare,
    iconBg: '#F3F0FD',
    iconColor: '#854DDA',
    title: `'${b.title}' 게시글을 작성했어요`,
    time: relativeTime(b.createdAt),
    createdAt: b.createdAt,
    onClick: () => navigate(`/community/${b.postId}`),
  }));

  const commentActivities: Activity[] = comments.map((c) => ({
    icon: ThumbsUp,
    iconBg: '#FEF7E6',
    iconColor: '#FECA3F',
    title: `'${c.postTitle}'에 댓글을 작성했어요`,
    time: relativeTime(c.createdAt),
    createdAt: c.createdAt,
    onClick: () => navigate(`/community/${c.postId}`),
  }));

  const activities = [
    ...reportActivities,
    ...boardActivities,
    ...commentActivities,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
        onClick={() => navigate('/home')}
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
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'black',
            marginBottom: 24,
          }}
        >
          최근 활동
        </h1>

        {loading ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: 13,
            }}
          >
            불러오는 중...
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: 13,
            }}
          >
            아직 활동이 없어요.
          </div>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={activity.onClick}
                    disabled={!activity.onClick}
                    style={{
                      width: '100%',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      padding: '12px 14px',
                      border: '1px solid #E5F3FE',
                      borderRadius: 12,
                      background: 'white',
                      cursor: activity.onClick ? 'pointer' : 'default',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (activity.onClick)
                        e.currentTarget.style.background = '#F0F9FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
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
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'black',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activity.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#828282',
                          marginTop: 2,
                        }}
                      >
                        {activity.time}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
