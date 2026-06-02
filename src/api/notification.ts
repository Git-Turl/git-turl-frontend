import client from './client';
import type { ApiResponse } from './types';

// ========== 타입 정의 ==========

export type NotificationTargetType = 'BOARD' | 'COMMENT';
export type NotificationTag = 'COMMENT' | 'REPLY';

// SSE notification 이벤트 payload (event: notification 의 data)
export type SseNotification = {
  notificationId: number;
  actorId: number;
  actorNickname: string;
  receiverId: number;
  boardId: number;
  targetObjectId: number;
  targetType: NotificationTargetType;
  tag: NotificationTag;
  previewContent: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationType = 'POST_COMMENT' | 'COMMENT_REPLY';

// GET /api/v1/notifications 의 목록 아이템
export type NotificationItem = {
  notificationId: number;
  type: NotificationType;
  postId: number;
  commentId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResult = {
  notifications: NotificationItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type NotificationListParams = {
  page?: number;
  size?: number;
  isRead?: boolean;
};

// ========== SSE 구독 ==========

export type SubscribeHandlers = {
  /** event: connect 수신 시 */
  onConnect?: (data: string) => void;
  /** event: notification 수신 시 */
  onNotification: (payload: SseNotification) => void;
  /** 연결/스트림 오류 발생 시 */
  onError?: (error: unknown) => void;
};

/**
 * SSE 알림 구독
 * GET /api/v1/notifications/subscribe (text/event-stream)
 *
 * 브라우저 기본 EventSource 는 Authorization 헤더를 못 붙이므로
 * fetch + ReadableStream 으로 SSE 프레임을 직접 파싱한다.
 *
 * 반환값을 호출하면 연결을 끊는다 (cleanup).
 */
export const subscribeNotifications = (
  handlers: SubscribeHandlers
): (() => void) => {
  const controller = new AbortController();
  const token = localStorage.getItem('accessToken');
  const baseURL = import.meta.env.VITE_API_BASE_URL as string;

  const run = async () => {
    const url = `${baseURL}/api/v1/notifications/subscribe`;
    console.info('[SSE] subscribe → fetch start', { url, hasToken: !!token });
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        signal: controller.signal,
      });

      console.info('[SSE] response received', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        hasBody: !!response.body,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.warn('[SSE] stream closed by server');
          break;
        }
        buffer += value;

        // SSE 프레임은 빈 줄(\n\n)로 구분
        let sepIndex: number;
        while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          handleFrame(rawEvent, handlers);
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.info('[SSE] aborted (cleanup)');
        return;
      }
      console.error('[SSE] error', err);
      handlers.onError?.(err);
    }
  };

  void run();

  return () => controller.abort();
};

// SSE 프레임 한 개를 event/data 로 파싱
const handleFrame = (raw: string, handlers: SubscribeHandlers) => {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of raw.split('\n')) {
    if (!line || line.startsWith(':')) continue; // 빈 줄/주석 무시
    const idx = line.indexOf(':');
    const field = idx === -1 ? line : line.slice(0, idx);
    // ': ' 한 칸 공백은 표준상 제거
    const value =
      idx === -1 ? '' : line.slice(idx + 1).replace(/^ /, '');

    if (field === 'event') event = value;
    else if (field === 'data') dataLines.push(value);
  }

  const data = dataLines.join('\n');

  if (event === 'connect') {
    handlers.onConnect?.(data);
    return;
  }
  if (event === 'notification') {
    try {
      const payload = JSON.parse(data) as SseNotification;
      handlers.onNotification(payload);
    } catch (e) {
      handlers.onError?.(e);
    }
  }
};

// ========== 알림 목록 조회 ==========

/**
 * 알림 목록 조회
 * GET /api/v1/notifications
 */
export const getNotifications = async (
  params?: NotificationListParams
): Promise<ApiResponse<NotificationListResult>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));
  if (params?.size !== undefined) queryParams.append('size', String(params.size));
  if (params?.isRead !== undefined)
    queryParams.append('isRead', String(params.isRead));

  const url = queryParams.toString()
    ? `/api/v1/notifications?${queryParams.toString()}`
    : '/api/v1/notifications';

  const response = await client.get<ApiResponse<NotificationListResult>>(url);
  return response.data;
};

// ========== 알림 읽음 처리 ==========

export type NotificationReadResult = {
  notificationId: number;
  isRead: boolean;
};

/**
 * 알림 읽음 처리
 * PATCH /api/v1/notifications/{notificationId}/read
 * (Swagger 기준 — /read suffix 필요)
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<ApiResponse<NotificationReadResult>> => {
  const response = await client.patch<ApiResponse<NotificationReadResult>>(
    `/api/v1/notifications/${notificationId}/read`
  );
  return response.data;
};

// ========== 알림 설정 ==========

export type NotificationSetting = {
  type: NotificationType;
  enabled: boolean;
};

export type NotificationSettingsResult = {
  settings: NotificationSetting[];
};

/**
 * 알림 설정 조회
 * GET /api/v1/notification-settings
 */
export const getNotificationSettings = async (): Promise<
  ApiResponse<NotificationSettingsResult>
> => {
  const response = await client.get<ApiResponse<NotificationSettingsResult>>(
    '/api/v1/notification-settings'
  );
  return response.data;
};

/**
 * 알림 설정 변경
 * PATCH /api/v1/notification-settings
 */
export const updateNotificationSetting = async (
  request: NotificationSetting
): Promise<ApiResponse<NotificationSetting>> => {
  const response = await client.patch<ApiResponse<NotificationSetting>>(
    '/api/v1/notification-settings',
    request
  );
  return response.data;
};
