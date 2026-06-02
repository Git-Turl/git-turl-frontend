import client from './client';
import type { ApiResponse } from './types';

// ========== 타입 정의 ==========

export type BoardType = 'STUDY' | 'PROJECT' | 'FORUM';

export type BoardListItem = {
  boardId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  boardType: BoardType;
  writerName: string;
  // 백엔드가 작성자 id 필드 추가 시 자동 채워짐. 없으면 undefined → 프로필 링크 비활성.
  writerId?: number;
  likeCount: number;
  createdAt: string;
  // 스터디 게시판 한정 — 백엔드가 응답에 포함하면 사용
  studyTag?: StudyTag | null;
  // 프로젝트 게시판 한정
  projectStatus?: ProjectStatus | null;
  techFields?: TechField[];
  platformTypes?: PlatformType[];
};

export type BoardListResult = {
  boardList: BoardListItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

export type BoardListParams = {
  page?: number;
  boardType?: BoardType;
  studyTag?: StudyTag;
  projectStatus?: ProjectStatus;
  // 목록 쿼리는 단수형 (작성 body는 복수형 배열)
  techField?: TechField;
  platformType?: PlatformType;
  sort?: BoardSort;
};

export type BoardDetail = {
  boardId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  boardType: BoardType;
  authorName: string;
  // 백엔드가 작성자 id 필드 추가 시 자동 채워짐.
  authorId?: number;
  views: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  // 아래 필드들은 백엔드가 상세 응답에 포함할 때만 채워짐 (수정 시 폼 프리필용)
  studyTag?: StudyTag | null;
  projectStatus?: ProjectStatus | null;
  techFields?: TechField[];
  platformTypes?: PlatformType[];
};

export type StudyTag = 'CERTIFICATE' | 'CODING_TEST' | 'LANGUAGE';
export type ProjectStatus = 'RECRUITING' | 'CLOSED';
// ⚠️ 백엔드 enum에 'FRONTED' 오타 그대로 사용
export type TechField = 'BACKEND' | 'FRONTED' | 'AI' | 'ETC';
export type PlatformType = 'WEB' | 'APP' | 'ETC';
export type BoardSort = 'LATEST' | 'LIKE';

export type BoardCreateRequest = {
  title: string;
  content: string;
  boardType: BoardType;
  studyTag?: StudyTag | null;
  projectStatus?: ProjectStatus | null;
  techFields?: TechField[];
  platformTypes?: PlatformType[];
};

export type BoardCreateResult = {
  postId: number;
  boardType: BoardType;
  createdAt: string;
};

export type BoardUpdateRequest = Partial<BoardCreateRequest>;

export type BoardUpdateResult = {
  boardId: number;
  updatedAt: string;
};

export type BoardDeleteResult = {
  boardId: number;
  deletedAt: string;
};

export type BoardLikeResult = {
  postId: number;
  liked: boolean;
  likeCount: number;
};

export type CommentLikeResult = {
  commentId: number;
  liked: boolean;
  likeCount: number;
};

export type Comment = {
  commentId: number;
  parentId: number | null;
  depth: number;
  isSecret: boolean;
  content: string;
  writerName: string;
  // 백엔드가 작성자 id 필드 추가 시 자동 채워짐.
  writerId?: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
};

export type CommentListResult = {
  commentList: Comment[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

export type CommentCreateRequest = {
  content: string;
  parentId?: number | null;
  isSecret?: boolean;
};

export type CommentCreateResult = {
  commentId: number;
  createdAt: string;
};

export type CommentUpdateRequest = {
  content: string;
  isSecret?: boolean;
};

export type CommentUpdateResult = {
  commentId: number;
  updatedAt: string;
};

export type CommentDeleteResult = {
  commentId: number;
  deletedAt: string;
};

// ========== 헬퍼 ==========

/**
 * Spring @RequestPart 호환 multipart FormData 생성.
 * - `request`: JSON Blob — filename을 명시해야 브라우저가 part에 Content-Type: application/json 헤더를 붙임
 * - `image`: 선택 (현재 UI 미사용)
 */
const buildBoardFormData = (
  request: BoardCreateRequest | BoardUpdateRequest,
  image?: File | null
): FormData => {
  const formData = new FormData();
  const jsonBlob = new Blob([JSON.stringify(request)], {
    type: 'application/json',
  });
  formData.append('request', jsonBlob, 'request.json');
  if (image) {
    formData.append('image', image);
  }
  return formData;
};

// ========== 게시글 API ==========

/**
 * 게시글 목록 조회
 * GET /api/v1/boards
 */
export const getBoardList = async (
  params?: BoardListParams
): Promise<ApiResponse<BoardListResult>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));
  if (params?.boardType) queryParams.append('boardType', params.boardType);
  if (params?.studyTag) queryParams.append('studyTag', params.studyTag);
  if (params?.projectStatus) queryParams.append('projectStatus', params.projectStatus);
  if (params?.techField) queryParams.append('techField', params.techField);
  if (params?.platformType) queryParams.append('platformType', params.platformType);
  if (params?.sort) queryParams.append('sort', params.sort);

  const url = queryParams.toString()
    ? `/api/v1/boards?${queryParams.toString()}`
    : '/api/v1/boards';

  const response = await client.get<ApiResponse<BoardListResult>>(url);
  return response.data;
};

/**
 * 게시글 작성 (multipart/form-data)
 * POST /api/v1/boards
 * - request: JSON Blob (filename 포함)
 * - image: 선택 (현재 UI 미사용)
 *
 * Content-Type 헤더를 명시적으로 삭제(undefined)해서 axios가 FormData를
 * 감지하고 'multipart/form-data; boundary=...' 를 자동으로 붙이게 함.
 * (client.ts의 기본 application/json 가 덮어써지지 않으면 백엔드가 거부함)
 */
export const createBoard = async (
  request: BoardCreateRequest,
  image?: File | null
): Promise<ApiResponse<BoardCreateResult>> => {
  const formData = buildBoardFormData(request, image);
  const response = await client.post<ApiResponse<BoardCreateResult>>(
    '/api/v1/boards',
    formData,
    {
      headers: {
        // undefined로 설정하면 axios가 기본 헤더를 제거하고 FormData에 맞게 자동 설정
        'Content-Type': undefined as unknown as string,
      },
      // axios가 FormData를 JSON.stringify 하지 않도록 명시
      transformRequest: (data) => data,
    }
  );
  return response.data;
};

/**
 * 게시글 상세 조회
 * GET /api/v1/boards/{boardId}
 */
export const getBoardDetail = async (
  boardId: number
): Promise<ApiResponse<BoardDetail>> => {
  const response = await client.get<ApiResponse<BoardDetail>>(
    `/api/v1/boards/${boardId}`
  );
  return response.data;
};

/**
 * 게시글 수정 (multipart/form-data)
 * PATCH /api/v1/boards/{boardId}
 */
export const updateBoard = async (
  boardId: number,
  request: BoardUpdateRequest,
  image?: File | null
): Promise<ApiResponse<BoardUpdateResult>> => {
  const formData = buildBoardFormData(request, image);
  const response = await client.patch<ApiResponse<BoardUpdateResult>>(
    `/api/v1/boards/${boardId}`,
    formData,
    {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
      transformRequest: (data) => data,
    }
  );
  return response.data;
};

/**
 * 게시글 삭제
 * DELETE /api/v1/boards/{boardId}
 */
export const deleteBoard = async (
  boardId: number
): Promise<ApiResponse<BoardDeleteResult>> => {
  const response = await client.delete<ApiResponse<BoardDeleteResult>>(
    `/api/v1/boards/${boardId}`
  );
  return response.data;
};

/**
 * 게시글 좋아요 토글
 * POST /api/v1/boards/{boardId}/likes
 * 응답 result.liked: true(추가) / false(취소), likeCount: 최신 카운트
 */
export const toggleBoardLike = async (
  boardId: number
): Promise<ApiResponse<BoardLikeResult>> => {
  const response = await client.post<ApiResponse<BoardLikeResult>>(
    `/api/v1/boards/${boardId}/likes`
  );
  return response.data;
};

// ========== 댓글 API ==========

/**
 * 댓글 목록 조회
 * GET /api/v1/boards/{boardId}/comments
 */
export const getComments = async (
  boardId: number,
  params?: { page?: number }
): Promise<ApiResponse<CommentListResult>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));

  const url = queryParams.toString()
    ? `/api/v1/boards/${boardId}/comments?${queryParams.toString()}`
    : `/api/v1/boards/${boardId}/comments`;

  const response = await client.get<ApiResponse<CommentListResult>>(url);
  return response.data;
};

/**
 * 댓글 작성
 * POST /api/v1/boards/{boardId}/comments
 */
export const createComment = async (
  boardId: number,
  request: CommentCreateRequest
): Promise<ApiResponse<CommentCreateResult>> => {
  const response = await client.post<ApiResponse<CommentCreateResult>>(
    `/api/v1/boards/${boardId}/comments`,
    request
  );
  return response.data;
};

/**
 * 댓글 수정
 * PATCH /api/v1/comments/{commentId}
 */
export const updateComment = async (
  commentId: number,
  request: CommentUpdateRequest
): Promise<ApiResponse<CommentUpdateResult>> => {
  const response = await client.patch<ApiResponse<CommentUpdateResult>>(
    `/api/v1/comments/${commentId}`,
    request
  );
  return response.data;
};

/**
 * 댓글 삭제
 * DELETE /api/v1/comments/{commentId}
 */
export const deleteComment = async (
  commentId: number
): Promise<ApiResponse<CommentDeleteResult>> => {
  const response = await client.delete<ApiResponse<CommentDeleteResult>>(
    `/api/v1/comments/${commentId}`
  );
  return response.data;
};

/**
 * 댓글 좋아요 토글
 * POST /api/v1/comments/{commentId}/likes
 */
export const toggleCommentLike = async (
  commentId: number
): Promise<ApiResponse<CommentLikeResult>> => {
  const response = await client.post<ApiResponse<CommentLikeResult>>(
    `/api/v1/comments/${commentId}/likes`
  );
  return response.data;
};
