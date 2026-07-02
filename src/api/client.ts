import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송 (refresh token)
  timeout: 10000, // 10초 타임아웃 — 응답 없으면 에러로 처리
});

// 요청 인터셉터: 모든 요청에 access token 자동 첨부
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 토큰 재발급 동시 호출 방지용 단일 프로미스
let reissuePromise: Promise<string | null> | null = null;

const requestReissue = async (): Promise<string | null> => {
  try {
    const res = await axios.post<{
      isSuccess: boolean;
      result: { accessToken: string } | null;
    }>(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reissue`,
      null,
      { withCredentials: true }
    );
    if (res.data?.isSuccess && res.data.result?.accessToken) {
      const newToken = res.data.result.accessToken;
      localStorage.setItem('accessToken', newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 응답 인터셉터: 401 시 토큰 재발급 후 1회 재시도, 실패 시 로그인으로
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // /auth/reissue 자체가 401이면 더 이상 재시도하지 않음
    const isReissueCall = originalRequest?.url?.includes('/auth/reissue');

    if (status === 401 && originalRequest && !originalRequest._retry && !isReissueCall) {
      originalRequest._retry = true;

      if (!reissuePromise) {
        reissuePromise = requestReissue().finally(() => {
          reissuePromise = null;
        });
      }

      const newToken = await reissuePromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return client.request(originalRequest as AxiosRequestConfig);
      }

      // 재발급 실패 → 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default client;
