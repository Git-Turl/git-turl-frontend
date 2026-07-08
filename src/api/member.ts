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

// 프로필 수정용 요청 타입 (선택적 필드 — null 은 "변경 없음"을 의미)
export type ProfileRequest = {
  nickname?: string | null;
  jobType?: JobType | null;
  techStackList?: TechStack[] | null;
};

export type MyProfile = {
  // 백엔드가 응답에 id / memberId 중 하나를 포함하면 채워짐 (작성자 본인 판별에 사용).
  id?: number;
  memberId?: number;
  nickname: string;
  profileImage: string;
  jobType: JobType;
  githubId: string;
  techStackList: TechStack[];
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

export type ImprovementDetail = {
  title: string;
  files: string[] | null;
  currentStatus: string;
  example: string;
  actionPlan: string;
};

export type Improvements = {
  improvement1: ImprovementDetail;
  improvement2: ImprovementDetail;
  improvement3: ImprovementDetail;
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
  bookmarked?: boolean;
};

// 분석본 목록 조회 타입
export type ReportListItem = {
  reportId: number;
  repoName: string | null;
  reportTitle?: string;
  description: string | null;
  createdAt: string;
  questionCount: number;
  bookmarked?: boolean;
  status?: 'PUBLIC' | 'PRIVATE';
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

export type NicknameCheckRequest = {
  nickname: string;
};

export type NicknameCheckResult = {
  code: string;
};

// ========== API 호출 함수 ==========

/**
 * 닉네임 중복 확인
 * POST /api/v1/members/nickname
 */
export const checkNickname = async (
  data: NicknameCheckRequest
): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>(
    '/api/v1/members/nickname',
    data
  );
  return response.data;
};

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
 * 타인 프로필 조회 (memberId 기반)
 * GET /api/v1/members/{memberId}/profile
 */
export const getMemberProfile = async (
  memberId: number
): Promise<ApiResponse<MyProfile>> => {
  const response = await client.get<ApiResponse<MyProfile>>(
    `/api/v1/members/${memberId}/profile`
  );
  return response.data;
};

// by-nickname 프로필 조회는 백엔드에 없음 — memberId 기반(getMemberProfile) 사용.

// 깃털 히스토리 (서버 필드명 daysWthGitTurl 그대로 사용 — typo 가능성 있음)
export type GitTurlHistory = {
  daysWthGitTurl: number;
  githubReportCount: number;
  interviewQuestionCount: number;
  // 백엔드가 추가하면 자동 표시 (현재 미지원).
  weeklyCommitCount?: number;
};

/**
 * 깃털 히스토리 조회
 * GET /api/v1/members/me/history
 */
export const getMyHistory = async (): Promise<ApiResponse<GitTurlHistory>> => {
  const response = await client.get<ApiResponse<GitTurlHistory>>(
    '/api/v1/members/me/history'
  );
  return response.data;
};

// ========== 내 게시글/댓글 조회 ==========

export type MemberContentBoardType = 'FORUM' | 'STUDY' | 'PROJECT';

export type MemberBoardSort = 'latest' | 'like';

// 게시글 목록 응답 — community 게시글 목록과 동일한 스키마.
export type MemberBoardItem = {
  boardId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  boardType: MemberContentBoardType;
  writerName: string;
  likeCount: number;
  createdAt: string;
  // 스터디/프로젝트 한정 (옵셔널)
  studyTag?: string | null;
  certificateType?: string | null;
  projectStatus?: string | null;
  recruitCount?: number;
  recruitDeadline?: string | null;
  recruitStacks?: string[];
  projectStacks?: string[];
  platformTypes?: string[];
};

export type MemberBoardListResult = {
  boardList: MemberBoardItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

export type MemberContentParams = {
  boardType?: 'FORUM' | 'STUDY' | 'PROJECT';
  sort?: MemberBoardSort;
  page?: number;
  size?: number;
};

const buildMyContentQuery = (params?: MemberContentParams) => {
  const qs = new URLSearchParams();
  if (params?.boardType) qs.append('boardType', params.boardType);
  if (params?.sort) qs.append('sort', params.sort);
  if (params?.page !== undefined) qs.append('page', String(params.page));
  if (params?.size !== undefined) qs.append('size', String(params.size));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

/**
 * 내 게시글 조회
 * GET /api/v1/boards/me
 */
export const getMyBoards = async (
  params?: MemberContentParams
): Promise<ApiResponse<MemberBoardListResult>> => {
  const response = await client.get<ApiResponse<MemberBoardListResult>>(
    `/api/v1/boards/me${buildMyContentQuery(params)}`
  );
  return response.data;
};

export type MemberCommentItem = {
  commentId: number;
  boardId: number;
  boardTitle: string;
  boardType: MemberContentBoardType;
  content: string;
  likeCount: number;
  createdAt: string;
};

export type MemberCommentListResult = {
  commentList: MemberCommentItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

/**
 * 내 댓글 조회
 * GET /api/v1/comments/me
 */
export const getMyComments = async (
  params?: MemberContentParams
): Promise<ApiResponse<MemberCommentListResult>> => {
  const response = await client.get<ApiResponse<MemberCommentListResult>>(
    `/api/v1/comments/me${buildMyContentQuery(params)}`
  );
  return response.data;
};

/**
 * 타인 게시글 조회
 * GET /api/v1/boards/members/{memberId}
 * 응답 스키마는 내 게시글 조회와 동일.
 */
export const getMemberBoards = async (
  memberId: number,
  params?: MemberContentParams
): Promise<ApiResponse<MemberBoardListResult>> => {
  const response = await client.get<ApiResponse<MemberBoardListResult>>(
    `/api/v1/boards/members/${memberId}${buildMyContentQuery(params)}`
  );
  return response.data;
};

/**
 * 타인 댓글 조회
 * GET /api/v1/comments/members/{memberId}
 * 응답 스키마는 내 댓글 조회와 동일.
 */
export const getMemberComments = async (
  memberId: number,
  params?: MemberContentParams
): Promise<ApiResponse<MemberCommentListResult>> => {
  const response = await client.get<ApiResponse<MemberCommentListResult>>(
    `/api/v1/comments/members/${memberId}${buildMyContentQuery(params)}`
  );
  return response.data;
};

// ========== 타인 공개 요약본 조회 ==========

export type MemberReportItem = {
  reportId: number;
  repoName: string;
  reportTitle: string;
  description: string;
  createdAt: string; // YYYY-MM-DD
  questionCount: number;
  // 백엔드가 목록에 status 를 포함해 주면 프론트에서 PUBLIC 만 필터해서 표시.
  status?: 'PUBLIC' | 'PRIVATE';
  bookmarked?: boolean;
};

export type MemberReportListResult = {
  data: MemberReportItem[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type MemberReportParams = {
  cursor?: string; // 기본 '-1'
  pageSize?: number; // 기본 10
};

/**
 * 타인 공개 요약본 목록 조회
 * GET /api/v1/reports/members/{memberId}
 * 공개 설정한 요약본만 응답에 포함됨 (백엔드 필터 처리).
 * 빈 결과는 result 가 없는 정상 응답(REPORT200_8) 으로 옴.
 */
export const getMemberReports = async (
  memberId: number,
  params?: MemberReportParams
): Promise<ApiResponse<MemberReportListResult>> => {
  const qs = new URLSearchParams();
  if (params?.cursor !== undefined) qs.append('cursor', params.cursor);
  if (params?.pageSize !== undefined)
    qs.append('pageSize', String(params.pageSize));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  const response = await client.get<ApiResponse<MemberReportListResult>>(
    `/api/v1/reports/members/${memberId}${query}`
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
 * 분석본 북마크 여부 수정
 * PATCH /api/v1/reports/{reportId}/bookmark
 * 기본값 false. 요청 시 false → true, true → false 로 토글됨.
 */
export type UpdateReportBookmarkResult = {
  bookmarked: boolean;
};

export const updateReportBookmark = async (
  reportId: number
): Promise<ApiResponse<UpdateReportBookmarkResult>> => {
  const response = await client.patch<ApiResponse<UpdateReportBookmarkResult>>(
    `/api/v1/reports/${reportId}/bookmark?reportId=${reportId}`
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
