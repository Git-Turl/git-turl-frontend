import { useEffect, useState } from 'react';
import {
  getNotificationSettings,
  updateNotificationSetting,
  type NotificationSetting,
  type NotificationType,
} from '../../api/notification';

const TYPE_LABEL: Record<NotificationType, string> = {
  POST_COMMENT: '게시글 댓글 알림',
  COMMENT_REPLY: '대댓글 알림',
};

// 백엔드 응답에 일부 타입이 빠져있어도 UI 에서는 항상 두 종류 모두 노출.
const ALL_TYPES: NotificationType[] = ['POST_COMMENT', 'COMMENT_REPLY'];

// 시연용 목업 — 백엔드 /notification-settings endpoint 추가되면 제거.
// API 가 500/404 면 이 기본값으로 UI 동작, 토글은 로컬 상태만 갱신.
const MOCK_DEFAULT_SETTINGS: NotificationSetting[] = [
  { type: 'POST_COMMENT', enabled: true },
  { type: 'COMMENT_REPLY', enabled: true },
];

export function NotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSetting[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 토글 진행 중인 타입 (중복 클릭 방지)
  const [pendingType, setPendingType] = useState<NotificationType | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getNotificationSettings()
      .then((res) => {
        if (cancelled) return;
        // 백엔드 endpoint 미구현/500 이면 목업 기본값으로 동작.
        if (res.isSuccess === false) {
          console.warn(
            '[notification-settings] API 실패 → 시연용 목업 사용',
            res.message
          );
          setSettings(MOCK_DEFAULT_SETTINGS);
          return;
        }
        setSettings(res.result?.settings ?? MOCK_DEFAULT_SETTINGS);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          '[notification-settings] API 호출 실패 → 시연용 목업 사용',
          err
        );
        setSettings(MOCK_DEFAULT_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // type 의 현재 enabled 값. 응답에 없는 타입은 기본 true 로 간주.
  const isEnabled = (type: NotificationType): boolean => {
    const found = settings?.find((s) => s.type === type);
    return found ? found.enabled : true;
  };

  const handleToggle = (type: NotificationType) => {
    if (pendingType) return;
    const next = !isEnabled(type);

    // 낙관적 업데이트
    setSettings((prev) => {
      const base = prev ?? [];
      const without = base.filter((s) => s.type !== type);
      return [...without, { type, enabled: next }];
    });
    setPendingType(type);

    updateNotificationSetting({ type, enabled: next })
      .then((res) => {
        if (!res.isSuccess) throw new Error(res.message);
      })
      .catch((err) => {
        // 백엔드 endpoint 미구현 시 롤백하지 않고 로컬 상태 유지 (시연용).
        // 백엔드 작동 시점부터 실제 PATCH 결과 반영됨.
        console.warn(
          '[notification-settings] update API 실패 → 로컬만 변경 유지',
          err
        );
      })
      .finally(() => setPendingType(null));
  };

  if (isLoading) {
    return (
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
    );
  }

  if (loadError) {
    return (
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
    );
  }

  return (
    <div>
      {ALL_TYPES.map((type) => {
        const enabled = isEnabled(type);
        const pending = pendingType === type;
        return (
          <div
            key={type}
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14, color: '#101828' }}>
              {TYPE_LABEL[type]}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={`${TYPE_LABEL[type]} 토글`}
              disabled={pending}
              onClick={() => handleToggle(type)}
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
