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
  | 'FLASK'
  | 'FAST_API'
  | 'RUBY_ON_RAILS'
  | 'ASP_NET'
  | 'GO'
  | 'RUST'
  | 'REACT'
  | 'VUE_JS'
  | 'ANGULAR'
  | 'TYPESCRIPT'
  | 'JAVASCRIPT'
  | 'NEXT_JS'
  | 'SVELTE'
  | 'JQUERY'
  | 'HTML_CSS'
  | 'TAILWIND_CSS'
  | 'REACT_NATIVE'
  | 'FLUTTER'
  | 'SWIFT'
  | 'KOTLIN'
  | 'XAMARIN'
  | 'MYSQL'
  | 'POSTGRESQL'
  | 'MONGODB'
  | 'REDIS'
  | 'ORACLE'
  | 'SQLITE'
  | 'DOCKER'
  | 'KUBERNETES'
  | 'AWS'
  | 'AZURE'
  | 'GCP'
  | 'JENKINS'
  | 'GITHUB_ACTIONS'
  | 'GIT'
  | 'RESTFUL_API'
  | 'GRAPHQL'
  | 'ETC';

// 온보딩용 요청 타입 (필수 필드)
export type OnboardingRequest = {
  nickname: string;
  jobType: JobType;
  techStackList: TechStack[];
};

// 프로필 수정용 요청 타입 (선택적 필드)
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

export type Repository = {
  name: string;
  fullName: string;
  description: string | null;
  updatedAt: string;
  private: boolean;
};

export type ReportRequest = {
  fullName: string;
};

export type ReportResult = {
  reportId: number;
};

// ========== API 호출 함수 ==========

/**
 * 프로필 정보 설정 (최초 온보딩)
 * PATCH /api/v1/members/me/onboarding
 */
export const submitOnboarding = async (
  data: OnboardingRequest
): Promise<ApiResponse<null>> => {
  const response = await client.patch<ApiResponse<null>>(
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
 * 레포지토리 목록 조회
 * GET /api/v1/repos
 */
export const getRepositories = async (): Promise<ApiResponse<Repository[]>> => {
  const response = await client.get<ApiResponse<Repository[]>>(
    '/api/v1/repos'
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

/**
 * 레포지토리 분석본 생성
 * POST /api/v1/reports
 */
export const createReport = async (
  data: ReportRequest
): Promise<ApiResponse<ReportResult>> => {
  const response = await client.post<ApiResponse<ReportResult>>(
    '/api/v1/reports',
    data
  );
  return response.data;
};
