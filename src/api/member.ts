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

// 분석본 상세 조회 타입
export type Stack = {
  language: string;
  framework: string;
  library: string;
  security: string;
};

export type CommitStats = {
  totalCommits: number;
  myCommits: number;
  myCommitRate: number;
};

export type CommitContribution = {
  [key: string]: number;
};

export type Scale = {
  fileCount: number;
  commitCount: number;
};

export type FeatureDetail = {
  title: string;
  files: string[] | null;
  content: string;
};

export type Features = {
  feature1: FeatureDetail;
  feature2: FeatureDetail;
  feature3: FeatureDetail;
  feature4: FeatureDetail;
  feature5: FeatureDetail;
};

export type Improvements = {
  improvement1: FeatureDetail;
  improvement2: FeatureDetail;
  improvement3: FeatureDetail;
};

export type Content = {
  content: {
    purpose: string;
    stack: Stack;
    commitStats: CommitStats;
    commitContribution: CommitContribution;
    scale: Scale;
    reports: string;
    features: Features;
    improvements: Improvements;
  };
};

export type ReportDetail = {
  reportId: number;
  repoName: string;
  reportTitle?: string;
  githubId: string;
  status: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  content: Content | null;
};

// 분석본 목록 조회 타입
export type ReportListItem = {
  reportId: number;
  repoName: string | null;
  reportTitle?: string;
  description: string | null;
  createdAt: string;
  questionCount: number;
};

export type ReportListResponse = {
  data: ReportListItem[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type ReportListParams = {
  cursor?: string;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PUBLIC' | 'PRIVATE';
  answerType: 'TEXT' | 'VOICE' | 'ALL';
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

/**
 * 레포지토리 분석본 상세 조회
 * GET /api/v1/reports/{reportId}
 */
export const getReportDetail = async (
  reportId: number
): Promise<ApiResponse<ReportDetail>> => {
  const response = await client.get<ApiResponse<ReportDetail>>(
    `/api/v1/reports/${reportId}`
  );
  return response.data;
};

/**
 * 분석본 목록 조회
 * GET /api/v1/reports
 */
export const getReportList = async (
  params: ReportListParams
): Promise<ApiResponse<ReportListResponse>> => {
  const queryParams = new URLSearchParams();
  
  if (params.cursor) queryParams.append('cursor', params.cursor);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.status) queryParams.append('status', params.status);
  queryParams.append('answerType', params.answerType);

  const url = `/api/v1/reports?${queryParams.toString()}`;

  const response = await client.get<ApiResponse<ReportListResponse>>(url);
  return response.data;
};

/**
 * 분석본 공개 설정 변경
 * PATCH /api/v1/reports/{reportId}/status
 */
export type UpdateReportStatusRequest = {
  status: 'PUBLIC' | 'PRIVATE';
};

export type UpdateReportStatusResult = {
  status: 'PUBLIC' | 'PRIVATE';
};

export const updateReportStatus = async (
  reportId: number,
  data: UpdateReportStatusRequest
): Promise<ApiResponse<UpdateReportStatusResult>> => {
  const response = await client.patch<ApiResponse<UpdateReportStatusResult>>(
    `/api/v1/reports/${reportId}/status`,
    data
  );
  return response.data;
};

/**
 * 분석본 제목 변경
 * PATCH /api/v1/reports/{reportId}/title
 */
export type UpdateReportTitleRequest = {
  title: string;
};

export type UpdateReportTitleResult = {
  title: string;
  updatedAt: string;
};

/**
 * 질문 목록 조회
 * GET /api/v1/reports/{reportId}/questions
 */
export type QuestionItem = {
  questionId: number;
  content: string | null;
  createdAt: string;
  status: 'PROCESSING' | 'DONE';
  time: number | null;
};

export type QuestionListResponse = {
  data: QuestionItem[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type QuestionListParams = {
  cursor?: string;
  pageSize?: number;
  answerType: 'TEXT' | 'VOICE';
};

export const getQuestions = async (
  reportId: number,
  params: QuestionListParams
): Promise<ApiResponse<QuestionListResponse>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('answerType', params.answerType);
  if (params.cursor) queryParams.append('cursor', params.cursor);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  const response = await client.get<ApiResponse<QuestionListResponse>>(
    `/api/v1/reports/${reportId}/questions?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * 질문 생성
 * POST /api/v1/reports/{reportId}/questions
 */
export type CreateQuestionsRequest = {
  questionCount: number;
  answerType: 'TEXT' | 'VOICE';
};

export type CreateQuestionsResult = {
  questionIdList: number[];
};

export const createQuestions = async (
  reportId: number,
  data: CreateQuestionsRequest
): Promise<ApiResponse<CreateQuestionsResult>> => {
  const response = await client.post<ApiResponse<CreateQuestionsResult>>(
    `/api/v1/reports/${reportId}/questions`,
    data
  );
  return response.data;
};

export const updateReportTitle = async (
  reportId: number,
  data: UpdateReportTitleRequest
): Promise<ApiResponse<UpdateReportTitleResult>> => {
  const response = await client.patch<ApiResponse<UpdateReportTitleResult>>(
    `/api/v1/reports/${reportId}/title?reportId=${reportId}`,
    data
  );
  return response.data;
};

/**
 * 답변 저장
 * POST /api/v1/questions/{questionId}/answers
 */
export type SaveAnswerRequest = {
  content: string;
};

export type SaveAnswerResult = {
  answerId: number;
};

export const saveAnswer = async (
  questionId: number,
  data: SaveAnswerRequest
): Promise<ApiResponse<SaveAnswerResult>> => {
  const response = await client.post<ApiResponse<SaveAnswerResult>>(
    `/api/v1/questions/${questionId}/answers`,
    data
  );
  return response.data;
};

/**
 * 피드백 생성
 * POST /api/v1/answers/{answerId}/feedbacks
 */
export const createFeedback = async (
  answerId: number
): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>(
    `/api/v1/answers/${answerId}/feedbacks`
  );
  return response.data;
};

/**
 * 답변&피드백 목록 조회
 * GET /api/v1/questions/{questionId}/answers
 */
export type AnswerItem = {
  answerId: number;
  content: string;
  feedback: string | null;
  createdAt: string;
};

export const getAnswers = async (
  questionId: number
): Promise<ApiResponse<AnswerItem[]>> => {
  const response = await client.get<ApiResponse<AnswerItem[]>>(
    `/api/v1/questions/${questionId}/answers`
  );
  return response.data;
};

/**
 * 답변&피드백 삭제
 * DELETE /api/v1/answers/{answerId}
 */
export const deleteAnswer = async (
  answerId: number
): Promise<ApiResponse<null>> => {
  const response = await client.delete<ApiResponse<null>>(
    `/api/v1/answers/${answerId}`
  );
  return response.data;
};

/**
 * 질문 삭제
 * DELETE /api/v1/questions/{questionId}
 */
export const deleteQuestion = async (
  questionId: number
): Promise<ApiResponse<null>> => {
  const response = await client.delete<ApiResponse<null>>(
    `/api/v1/questions/${questionId}`
  );
  return response.data;
};
