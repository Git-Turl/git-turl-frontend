import { useEffect, useRef, useState } from 'react';
import { ChevronsLeft } from 'lucide-react';

type Notification = {
  id: number;
  avatar?: string;
  nickname: string;
  message: string;
  reply?: string;
  date: string;
  read: boolean;
};

// 시연용 dummy 데이터. 백엔드 알림 API 생기면 fetch로 교체.
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    nickname: '닉네임',
    message: '내 글에 댓글을 달았습니다.',
    reply: '저 관심있어요.',
    date: '2026.03.01',
    read: false,
  },
  {
    id: 2,
    nickname: '닉네임',
    message: '내 글에 댓글을 달았습니다.',
    reply: '저 관심있어요.',
    date: '2026.03.01',
    read: false,
  },
  {
    id: 3,
    nickname: '닉네임',
    message: '내 글에 댓글을 달았습니다.',
    reply: '저 관심있어요.',
    date: '2026.03.01',
    read: true,
  },
  {
    id: 4,
    nickname: '닉네임',
    message: '내 글에 댓글을 달았습니다.',
    reply: '저 관심있어요.',
    date: '2026.03.01',
    read: true,
  },
];

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SIDEBAR_WIDTH = 256; // w-64 (Tailwind) = 16rem = 256px
const DRAWER_WIDTH = 420;

export function NotificationDrawer({ isOpen, onClose }: DrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>(
    DUMMY_NOTIFICATIONS
  );
  const drawerRef = useRef<HTMLDivElement>(null);

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#101828',
              margin: 0,
            }}
          >
            알림
          </h1>
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

        {/* 알림 리스트 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
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
                    alt={n.nickname}
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
                      <span style={{ fontWeight: 600 }}>{n.nickname}</span>
                      <span style={{ color: '#4A5565' }}>
                        님 {n.message}
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

