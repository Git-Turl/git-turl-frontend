import { useEffect } from 'react';
import {
  subscribeNotifications,
  type SseNotification,
} from '../api/notification';
import { useAuthStore } from '../store/authStore';

type Options = {
  onNotification: (n: SseNotification) => void;
  enabled?: boolean;
};

/**
 * SSE 알림 구독 훅.
 * - 로그인 상태일 때만 연결 (enabled=false 면 미연결)
 * - 언마운트/토큰 변경 시 자동 해제
 */
export const useNotificationSSE = ({
  onNotification,
  enabled = true,
}: Options) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !token) return;

    const unsubscribe = subscribeNotifications({
      onConnect: () => {
        // 연결 완료 로그만 (필요 시 토스트 등으로 교체)
        console.info('[SSE] notifications connected');
      },
      onNotification,
      onError: (err) => {
        console.warn('[SSE] notifications error', err);
      },
    });

    return () => unsubscribe();
  }, [enabled, isAuthenticated, token, onNotification]);
};
