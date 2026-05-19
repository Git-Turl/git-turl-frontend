import client from './client';
import type { ApiResponse } from './types';

// ========== 타입 정의 ==========

// 음성 답변 & 피드백 조회 결과
export type VoiceAnswer = {
  answerId: number;
  content: string;
  feedback: string;
  createdAt: string;
  voiceFile: string;
  answerSummary: string;
  keywords: string[];
  status: string | null;
};

// 질문 목록
export type AnswerType = 'TEXT' | 'VOICE';

export type QuestionItem = {
  questionId: number;
  content: string | null; // status가 PROCESSING이면 null (생성 중)
  createdAt: string;
  status: string;
  time: number | null;
};

export type QuestionListResult = {
  data: QuestionItem[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type QuestionListParams = {
  answerType: AnswerType;
  cursor?: string;
  pageSize?: number;
};

// ========== API 호출 함수 ==========

/**
 * 음성 답변 & 피드백 조회
 * GET /api/v1/questions/{questionId}/answers/voice
 */
export const getVoiceAnswer = async (
  questionId: number
): Promise<ApiResponse<VoiceAnswer>> => {
  const response = await client.get<ApiResponse<VoiceAnswer>>(
    `/api/v1/questions/${questionId}/answers/voice`
  );
  return response.data;
};

/**
 * 음성 답변 저장
 * POST /api/v1/questions/{questionId}/answers/voice
 * (multipart/form-data — webm 또는 mp3 오디오 파일)
 */
export const saveVoiceAnswer = async (
  questionId: number,
  voiceFile: File | Blob,
  fileName = 'answer.webm'
): Promise<ApiResponse<VoiceAnswer>> => {
  const formData = new FormData();
  formData.append('voiceFile', voiceFile, fileName);
  const response = await client.post<ApiResponse<VoiceAnswer>>(
    `/api/v1/questions/${questionId}/answers/voice`,
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
 * 답변 패스
 * POST /api/v1/questions/{questionId}/answers/pass
 */
export const passVoiceAnswer = async (
  questionId: number
): Promise<ApiResponse<null>> => {
  const response = await client.post<ApiResponse<null>>(
    `/api/v1/questions/${questionId}/answers/pass`,
    null
  );
  return response.data;
};

/**
 * 질문 목록 조회
 * GET /api/v1/reports/{reportId}/questions
 */
export const getQuestionList = async (
  reportId: number,
  params: QuestionListParams
): Promise<ApiResponse<QuestionListResult>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('answerType', params.answerType);
  if (params.cursor) queryParams.append('cursor', params.cursor);
  if (params.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  const response = await client.get<ApiResponse<QuestionListResult>>(
    `/api/v1/reports/${reportId}/questions?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * 음성 면접 질문 전체 조회 (커서 페이지네이션 자동 처리)
 */
export const getAllVoiceQuestions = async (
  reportId: number
): Promise<QuestionItem[]> => {
  const all: QuestionItem[] = [];
  // 명세상 cursor 기본값 -1 (첫 페이지). 백엔드가 누락을 처리 못 할 수 있어 명시.
  let cursor = '-1';
  // 무한 루프 방지용 페이지 상한
  for (let page = 0; page < 20; page++) {
    const res = await getQuestionList(reportId, {
      answerType: 'VOICE',
      cursor,
      pageSize: 50,
    });
    const result = res.result;
    if (!result) break;
    all.push(...result.data);
    if (!result.hasNext) break;
    cursor = result.nextCursor;
  }
  return all;
};

// 질문 생성
export type GenerateQuestionsRequest = {
  questionCount: number;
  answerType: AnswerType;
};

export type GenerateQuestionsResult = {
  questionIdList: number[];
};

/**
 * 선택한 요약본 토대로 질문 생성
 * POST /api/v1/reports/{reportId}/questions
 */
export const generateQuestions = async (
  reportId: number,
  data: GenerateQuestionsRequest
): Promise<ApiResponse<GenerateQuestionsResult>> => {
  const response = await client.post<ApiResponse<GenerateQuestionsResult>>(
    `/api/v1/reports/${reportId}/questions`,
    data
  );
  return response.data;
};

// 요약본(분석본) 목록
export type ReportSummary = {
  reportId: number;
  repoName: string;
  description: string | null;
  createdAt: string;
  questionCount: number;
};

type ReportListResult = {
  data: ReportSummary[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

/**
 * 음성면접용 요약본 목록 조회
 * GET /api/v1/reports?answerType=VOICE
 */
export const getVoiceReports = async (): Promise<ReportSummary[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('answerType', 'VOICE');
  queryParams.append('cursor', '-1');
  queryParams.append('pageSize', '50');
  const response = await client.get<ApiResponse<ReportListResult>>(
    `/api/v1/reports?${queryParams.toString()}`
  );
  return response.data.result?.data ?? [];
};
