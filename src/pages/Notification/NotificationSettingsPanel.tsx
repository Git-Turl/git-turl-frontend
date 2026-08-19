import { useEffect, useState } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '../../api/notification';
import { Skeleton } from '../../components/ui/skeleton';

// 두 가지 토글의 메타 정보. key 는 NotificationSettings 안의 필드명과 매칭.
const TOGGLES: {
  key: keyof NotificationSettings;
  label: string;
}[] = [
  { key: 'commentNotificationEnabled', label: '게시글 댓글 알림' },
  { key: 'replyNotificationEnabled', label: '대댓글 알림' },
];

// 시연용 기본값 — API 실패 시 fallback.
const DEFAULT_SETTINGS: NotificationSettings = {
  commentNotificationEnabled: true,
  replyNotificationEnabled: true,
};

export function NotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // 처리 중인 토글 key — 중복 클릭 방지.
  const [pendingKey, setPendingKey] = useState<
    keyof NotificationSettings | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getNotificationSettings()
      .then((res) => {
        if (cancelled) return;
        if (res.isSuccess && res.result) {
          setSettings(res.result);
        } else {
          console.warn(
            '[notification-settings] API 실패 → 기본값 사용',
            res.message
          );
          setSettings(DEFAULT_SETTINGS);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[notification-settings] 호출 실패 → 기본값 사용', err);
        setSettings(DEFAULT_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    if (pendingKey || !settings) return;
    const next: NotificationSettings = {
      ...settings,
      [key]: !settings[key],
    };

    // 낙관적 업데이트
    setSettings(next);
    setPendingKey(key);

    updateNotificationSettings(next)
      .then((res) => {
        if (!res.isSuccess) throw new Error(res.message);
        // 서버 응답값으로 동기화 (필드 다 있으면 그걸로 덮어쓰기)
        if (res.result) setSettings(res.result);
      })
      .catch((err) => {
        // 백엔드가 미구현이거나 응답 형식 다른 경우엔 로컬 상태 유지.
        console.warn(
          '[notification-settings] update 실패 → 로컬만 변경 유지',
          err
        );
      })
      .finally(() => setPendingKey(null));
  };

  if (isLoading || !settings) {
    return (
      <div>
        {TOGGLES.map(({ key }) => (
          <div
            key={key}
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {TOGGLES.map(({ key, label }) => {
        const enabled = settings[key];
        const pending = pendingKey === key;
        return (
          <div
            key={key}
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14, color: '#101828' }}>{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={`${label} 토글`}
              disabled={pending}
              onClick={() => handleToggle(key)}
              style={{
                width: 40,
                height: 22,
                borderRadius: 999,
                border: 'none',
                position: 'relative',
                cursor: pending ? 'wait' : 'pointer',
                background: enabled ? '#0284C7' : '#D1D5DB',
                opacity: pending ? 0.6 : 1,
                transition: 'background 0.15s',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: enabled ? 20 : 2,
                  width: 18,
                  height: 18,
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.15s',
                }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
