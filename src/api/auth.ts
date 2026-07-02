import client from './client';
import type { ApiResponse } from './types';

export type ReissueResult = {
  accessToken: string;
};

/**
 * 토큰 재발급
 * POST /api/v1/auth/reissue
 * (refresh token은 httpOnly 쿠키로 전송)
 */
export const reissueToken = async (): Promise<ApiResponse<ReissueResult>> => {
  const response = await client.post<ApiResponse<ReissueResult>>(
    '/api/v1/auth/reissue'
  );
  return response.data;
};

/**
 * 로그아웃
 * POST /api/v1/auth/logout
 */
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>('/api/v1/auth/logout');
  return response.data;
};

/**
 * 회원 탈퇴
 * DELETE /api/v1/auth/withdraw
 */
export const withdraw = async (): Promise<ApiResponse<null>> => {
  const response = await client.delete<ApiResponse<null>>(
    '/api/v1/auth/withdraw'
  );
  return response.data;
};
