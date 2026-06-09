import client from './client';
import type { ApiResponse } from './types';

// 추천 카테고리 — 백엔드가 소문자로 보내옴 (backend, frontend, ai 등). 그 외 케이스도 허용.
export type RecommendCategory = string;

// 스터디 추천 아이템
export type RecommendStudyItem = {
  postId: number;
  title: string;
  category: RecommendCategory;
  recruitCount: number;
  currentCount: number;
  likeCount: number;
  createdAt: string;
};

// 프로젝트 추천 아이템
export type RecommendProjectItem = {
  postId: number;
  title: string;
  category: RecommendCategory;
  recruitCount: number;
  currentCount: number;
  likeCount: number;
  createdAt: string;
};

export type RecommendStudyResult = {
  studies: RecommendStudyItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type RecommendProjectResult = {
  projects: RecommendProjectItem[];
  page: number;
  size: number;
  totalCount: number;
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
 * 스터디 추천 조회
 * GET /api/v1/home/studies
 */
export const getRecommendStudies = async (
  params?: RecommendParams
): Promise<ApiResponse<RecommendStudyResult>> => {
  const response = await client.get<ApiResponse<RecommendStudyResult>>(
    `/api/v1/home/studies${buildQuery(params)}`
  );
  return response.data;
};

/**
 * 프로젝트 추천 조회
 * GET /api/v1/home/projects
 */
export const getRecommendProjects = async (
  params?: RecommendParams
): Promise<ApiResponse<RecommendProjectResult>> => {
  const response = await client.get<ApiResponse<RecommendProjectResult>>(
    `/api/v1/home/projects${buildQuery(params)}`
  );
  return response.data;
};
