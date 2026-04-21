import client from './client';

// ========== 타입 정의 ==========
export type JobType = 'FRONTEND' | 'BACKEND' | 'AI';

export type TechStack =
  | 'PHP'
  | 'NODE_JS'
  | 'NEST_JS'
  | 'SPRING_BOOT'
  | 'DJANGO'
  | 'REACT'
  | 'TYPESCRIPT'
  | 'KOTLIN'
  | 'SWIFT'
  | 'JAVASCRIPT'
  | 'ETC';

export type ProfileRequest = {
  nickname: string;
  jobType: JobType;
  techStackList: TechStack[];
};

export type ProfileResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: null | unknown;
};

// ========== API 호출 함수 ==========

/**
 * 프로필 정보 설정/수정
 * PUT /api/v1/members/me/profile
 */
export const updateProfile = async (
  data: ProfileRequest
): Promise<ProfileResponse> => {
  const response = await client.put<ProfileResponse>(
    '/api/v1/members/me/profile',
    data
  );
  return response.data;
};

/**
 * 내 프로필 정보 조회
 * GET /api/v1/members/me/profile
 */
export const getMyProfile = async () => {
  const response = await client.get('/api/v1/members/me/profile');
  return response.data;
};
