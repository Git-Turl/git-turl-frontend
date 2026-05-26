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
  likeCount: number;
  createdAt: string;
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
};

export type BoardDetail = {
  boardId: number;
  title: string;
  content: string;
  imageUrl: string | null;
  boardType: BoardType;
  authorName: string;
  views: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
};

export type BoardCreateRequest = {
  title: string;
  content: string;
  boardType: BoardType;
};

export type BoardCreateResult = {
  boardId: number;
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

export type Comment = {
  commentId: number;
  parentId: number | null;
  depth: number;
  isSecret: boolean;
  content: string;
  writerName: string;
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

const buildBoardFormData = (
  request: BoardCreateRequest | BoardUpdateRequest,
  image?: File | null
): FormData => {
  const formData = new FormData();
  formData.append(
    'request',
    new Blob([JSON.stringify(request)], { type: 'application/json' })
  );
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

  const url = queryParams.toString()
    ? `/api/v1/boards?${queryParams.toString()}`
    : '/api/v1/boards';

  const response = await client.get<ApiResponse<BoardListResult>>(url);
  return response.data;
};

/**
 * 게시글 작성 (multipart/form-data)
 * POST /api/v1/boards
 */
export const createBoard = async (
  request: BoardCreateRequest,
  image?: File | null
): Promise<ApiResponse<BoardCreateResult>> => {
  const response = await client.post<ApiResponse<BoardCreateResult>>(
    '/api/v1/boards',
    buildBoardFormData(request, image),
    { headers: { 'Content-Type': 'multipart/form-data' } }
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
  const response = await client.patch<ApiResponse<BoardUpdateResult>>(
    `/api/v1/boards/${boardId}`,
    buildBoardFormData(request, image),
    { headers: { 'Content-Type': 'multipart/form-data' } }
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
