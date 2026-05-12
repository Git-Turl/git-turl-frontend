import client from './client';
import type { ApiResponse } from './types';

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
  nickname?: string;
  jobType?: JobType;
  techStackList?: TechStack[] | null;
};

export type MyProfile = {
  nickname: string;
  profileImage: string;
  jobType: JobType;
  githubId: string;
  techStack: TechStack[];
};

export type ProfileImageResult = {
  profileImage: string;
};

// ========== API 호출 함수 ==========

/**
 * 프로필 정보 설정 (최초 온보딩)
 * POST /api/v1/members/me/onboarding
 */
export const submitOnboarding = async (
  data: ProfileRequest
): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>(
    '/api/v1/members/me/onboarding',
    data
  );
  return response.data;
};

/**
 * 프로필 정보 수정
 * PATCH /api/v1/members/me/profile
 */
export const updateProfile = async (
  data: ProfileRequest
): Promise<ApiResponse<null>> => {
  const response = await client.patch<ApiResponse<null>>(
    '/api/v1/members/me/profile',
    data
  );
  return response.data;
};

/**
 * 내 프로필 정보 조회
 * GET /api/v1/members/me/profile
 */
export const getMyProfile = async (): Promise<ApiResponse<MyProfile>> => {
  const response = await client.get<ApiResponse<MyProfile>>(
    '/api/v1/members/me/profile'
  );
  return response.data;
};

/**
 * 프로필 사진 조회
 * GET /api/v1/members/me/profile-image
 */
export const getProfileImage = async (): Promise<
  ApiResponse<ProfileImageResult>
> => {
  const response = await client.get<ApiResponse<ProfileImageResult>>(
    '/api/v1/members/me/profile-image'
  );
  return response.data;
};

/**
 * 프로필 사진 수정
 * PATCH /api/v1/members/me/profile-image
 * (multipart/form-data)
 */
export const updateProfileImage = async (
  file: File
): Promise<ApiResponse<null>> => {
  const formData = new FormData();
  formData.append('profileImage', file);
  const response = await client.patch<ApiResponse<null>>(
    '/api/v1/members/me/profile-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
