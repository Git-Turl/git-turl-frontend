import client from './client';
import type { ApiResponse } from './types';
import type { BoardStack } from './community';

// 추천 게시글 아이템 — result 가 객체 wrapper 없이 배열로 바로 옴.
export type RecommendItem = {
  boardId: number;
  title: string;
  content: string;
  recruitStacks: BoardStack[];
  likeCount: number;
  views: number;
  recruitCount: number;
};

export type RecommendParams = {
  page?: number;
  size?: number;
};

const buildQuery = (params?: RecommendParams) => {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.append('page', String(params.page));
  if (params?.size !== undefined) qs.append('size', String(params.size));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

/**
 * 프로젝트 추천 조회
 * GET /api/v1/boards/projects/recommend
 * 응답 result 는 배열 (pagination wrapper 없음).
 */
export const getRecommendProjects = async (
  params?: RecommendParams
): Promise<ApiResponse<RecommendItem[]>> => {
  const response = await client.get<ApiResponse<RecommendItem[]>>(
    `/api/v1/boards/projects/recommend${buildQuery(params)}`
  );
  return response.data;
};
