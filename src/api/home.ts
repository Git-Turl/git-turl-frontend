import client from './client';
import type { ApiResponse } from './types';

// 추천 프로젝트 게시글 아이템
// (백엔드가 로그인 사용자의 관심 스택 + 프로젝트 구인 스택 기준으로 최대 3개 반환)
export type RecommendProjectItem = {
  boardId: number;
  title: string;
  content: string;
  recruitStacks: string[];
  likeCount: number;
  views: number;
  recruitCount: number;
};

export type RecommendProjectsParams = {
  page?: number;
};

/**
 * 추천 프로젝트 조회
 * GET /api/v1/boards/projects/recommend
 * 응답 result 는 배열 (페이지네이션 wrapper 없음).
 */
export const getRecommendProjects = async (
  params?: RecommendProjectsParams
): Promise<ApiResponse<RecommendProjectItem[]>> => {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.append('page', String(params.page));
  const url =
    qs.toString().length > 0
      ? `/api/v1/boards/projects/recommend?${qs.toString()}`
      : '/api/v1/boards/projects/recommend';
  const response = await client.get<ApiResponse<RecommendProjectItem[]>>(url);
  return response.data;
};
