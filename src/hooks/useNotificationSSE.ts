import { useEffect, useState } from 'react';
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
 * - 페이지가 백그라운드 탭이면 (visibilityState === 'hidden') 연결 끊고,
 *   다시 포커스되면 재연결 — 백엔드 SseEmitter 스레드 점유 최소화.
 * - 언마운트/토큰 변경 시 자동 해제.
 */
export const useNotificationSSE = ({
  onNotification,
  enabled = true,
}: Options) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [isVisible, setIsVisible] = useState(() =>
    typeof document === 'undefined'
      ? true
      : document.visibilityState === 'visible'
  );

  // 페이지 visibility 추적 — 탭 백그라운드 전환 시 SSE 끊을 트리거.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () =>
      setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !token || !isVisible) return;

    const unsubscribe = subscribeNotifications({
      onConnect: () => {
        console.info('[SSE] notifications connected');
      },
      onNotification,
      onError: (err) => {
        console.warn('[SSE] notifications error', err);
      },
    });

    return () => unsubscribe();
  }, [enabled, isAuthenticated, token, isVisible, onNotification]);
};
