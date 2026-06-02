import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronsLeft, Settings, ArrowLeft } from 'lucide-react';
import { useNotificationSSE } from '../../hooks/useNotificationSSE';
import {
  getNotifications,
  markNotificationAsRead,
  type NotificationItem,
  type SseNotification,
} from '../../api/notification';
import { NotificationSettingsPanel } from './NotificationSettingsPanel';

// 표시용 정규화 타입. 목록 API 와 SSE 둘 다 이 형태로 변환해서 다룬다.
type Notification = {
  id: number;
  avatar?: string;
  // 목록 API 는 actor nickname 을 주지 않으므로 optional.
  nickname?: string;
  message: string;
  reply?: string;
  date: string;
  read: boolean;
};

// "2026-04-08T01:40:00" → "2026.04.08"
const formatDate = (iso: string) => iso.slice(0, 10).replace(/-/g, '.');

// SSE 페이로드 → Notification.
// tag 가 REPLY → "내 댓글에 답글을 달았습니다.", 그 외 → "내 글에 댓글을 달았습니다."
const mapSseToNotification = (n: SseNotification): Notification => ({
  id: n.notificationId,
  nickname: n.actorNickname,
  message:
    n.tag === 'REPLY'
      ? '내 댓글에 답글을 달았습니다.'
      : '내 글에 댓글을 달았습니다.',
  reply: n.previewContent,
  date: formatDate(n.createdAt),
  read: n.isRead,
});

// 목록 API item → Notification. 서버가 완성된 message 를 내려주므로 그대로 사용.
const mapItemToNotification = (n: NotificationItem): Notification => ({
  id: n.notificationId,
  message: n.message,
  date: formatDate(n.createdAt),
  read: n.isRead,
});

const PAGE_SIZE = 20;

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SIDEBAR_WIDTH = 256; // w-64 (Tailwind) = 16rem = 256px
const DRAWER_WIDTH = 420;

export function NotificationDrawer({ isOpen, onClose }: DrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'settings'>('list');
  const drawerRef = useRef<HTMLDivElement>(null);

  // SSE: 새 알림 수신 시 리스트 상단에 추가 (중복 id 는 갱신)
  const handleSseNotification = useCallback((n: SseNotification) => {
    const mapped = mapSseToNotification(n);
    setNotifications((prev) => {
      const without = prev.filter((p) => p.id !== mapped.id);
      return [mapped, ...without];
    });
  }, []);

  // SSE 는 드로어가 열려 있을 때만 연결 — 백엔드 SseEmitter 스레드 부담 최소화.
  // 닫을 때 AbortController 로 자동 해제, 다시 열 때 새 연결.
  useNotificationSSE({
    onNotification: handleSseNotification,
    enabled: isOpen,
  });

  // Drawer 가 열릴 때마다 목록 새로 fetch (1페이지, 읽음/안읽음 모두)
  useEffect(() => {
    if (!isOpen) return;
    setView('list'); // 다시 열 때는 항상 목록부터
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    // 백엔드 페이지네이션이 0-indexed (Spring 관례) — 첫 페이지는 0.
    getNotifications({ page: 0, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        console.log('[notifications] list response', res);
        // isSuccess === false 인 경우만 에러로 취급.
        // result 가 null 이거나 notifications 가 비어있어도 정상 (알림 0건).
        if (res.isSuccess === false) {
          setLoadError(res.message || '알림을 불러오지 못했어요.');
          return;
        }
        const list = res.result?.notifications ?? [];
        setNotifications(list.map(mapItemToNotification));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[notifications] list error', err);
        setLoadError('알림을 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Esc로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleItemClick = (id: number) => {
    // 이미 읽음이면 서버 호출 생략
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return;

    // 낙관적 업데이트
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    markNotificationAsRead(id)
      .then((res) => {
        if (!res.isSuccess) throw new Error(res.message);
      })
      .catch((err) => {
        // 실패 시 롤백
        console.error('[notifications] mark-as-read failed', err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      });
    // TODO: 알림 클릭 시 해당 게시글/댓글로 이동 (백엔드 알림 데이터에 link/boardId 필요)
  };

  return (
    <>
      {/* 배경 딤(backdrop): 사이드바는 가리지 않도록 left: SIDEBAR_WIDTH부터 시작 */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: SIDEBAR_WIDTH,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.35)',
          opacity: isOpen ? 1 : 0,
          transition: isOpen
            ? 'opacity 0.65s ease, visibility 0s linear 0s'
            : 'opacity 0.65s ease, visibility 0s linear 0.65s',
          zIndex: 30,
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      />

      {/* 슬라이드 패널 */}
      <aside
        ref={drawerRef}
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: SIDEBAR_WIDTH,
          height: '100vh',
          width: DRAWER_WIDTH,
          background: 'white',
          borderRight: '1px solid #DFF2FE',
          boxShadow: isOpen ? '4px 0 16px rgba(0,0,0,0.06)' : 'none',
          transform: isOpen
            ? 'translateX(0)'
            : `translateX(-${SIDEBAR_WIDTH + DRAWER_WIDTH}px)`,
          transition: isOpen
            ? 'transform 0.65s ease-in-out, visibility 0s linear 0s'
            : 'transform 0.65s ease-in-out, visibility 0s linear 0.65s',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #DFF2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {view === 'settings' && (
              <button
                type="button"
                onClick={() => setView('list')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6A7282',
                }}
                aria-label="알림 목록으로"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#101828',
                margin: 0,
              }}
            >
              {view === 'settings' ? '알림 설정' : '알림'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {view === 'list' && (
              <button
                type="button"
                onClick={() => setView('settings')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6A7282',
                }}
                aria-label="알림 설정"
              >
                <Settings size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6A7282',
              }}
              aria-label="알림 닫기"
            >
              <ChevronsLeft size={20} />
            </button>
          </div>
        </div>

        {/* 본문: 목록 또는 설정 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {view === 'settings' ? (
            <NotificationSettingsPanel />
          ) : isLoading ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#6A7282',
                fontSize: 13,
              }}
            >
              불러오는 중...
            </div>
          ) : loadError ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#DC2626',
                fontSize: 13,
              }}
            >
              {loadError}
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#6A7282',
                fontSize: 13,
              }}
            >
              알림이 없습니다.
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleItemClick(n.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: n.read ? 'white' : '#F0F9FF',
                  border: 'none',
                  borderBottom: '1px solid #F3F4F6',
                  padding: '14px 20px',
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E0F2FE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = n.read
                    ? 'white'
                    : '#F0F9FF';
                }}
              >
                {/* 아바타 */}
                {n.avatar ? (
                  <img
                    src={n.avatar}
                    alt={n.nickname ?? ''}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#D1D5DB',
                      flexShrink: 0,
                    }}
                  />
                )}

                {/* 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: '#101828',
                        lineHeight: '18px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {n.nickname && (
                        <span style={{ fontWeight: 600 }}>{n.nickname}</span>
                      )}
                      <span style={{ color: '#4A5565' }}>
                        {n.nickname ? `님 ${n.message}` : n.message}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#9CA3AF',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {n.date}
                    </span>
                  </div>
                  {n.reply && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6A7282',
                        lineHeight: '16px',
                        paddingLeft: 4,
                      }}
                    >
                      ↳ {n.reply}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

