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
  // 백엔드 응답에 포함되면 표시. 없으면 0 처리.
  commentCount?: number;
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
  writerId?: number;
  // 백엔드 응답에 인라인으로 옴 (S3 URL).
  profileImage?: string | null;
  views: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  // 게시판별 부가 필드 — STUDY/PROJECT 에서만 채워짐. 수정 폼 프리필용.
  recruitCount?: number | null;
  recruitDeadline?: string | null; // YYYY-MM-DD
  studyTag?: StudyTag | null;
  certificateType?: CertificateType | null;
  projectStatus?: ProjectStatus | null;
  recruitStacks?: BoardStack[];
  projectStacks?: BoardStack[];
  platformTypes?: PlatformType[];
};

export type StudyTag = 'CERTIFICATE' | 'CODING_TEST' | 'LANGUAGE';
export type ProjectStatus = 'RECRUITING' | 'CLOSED';
// ⚠️ 백엔드 enum에 'FRONTED' 오타 그대로 사용. 목록 필터링 쿼리에만 사용.
export type TechField = 'BACKEND' | 'FRONTED' | 'AI' | 'ETC';
export type PlatformType = 'WEB' | 'APP' | 'ETC';
export type BoardSort = 'LATEST' | 'LIKE';
// 자격증 유형 — 스터디 + 자격증 태그일 때만 의미 있음.
export type CertificateType = 'WRITTEN' | 'PRACTICAL';

// 게시글 작성/조회용 스택 enum — 백엔드 스펙 기준.
// member.ts 의 TechStack 과는 별개 (자격증 보드의 enum 풀이 더 좁음).
export type BoardStack =
  | 'HTML_CSS'
  | 'TAILWIND_CSS'
  | 'JAVASCRIPT'
  | 'TYPESCRIPT'
  | 'REACT'
  | 'VUE' // ⚠️ VUE_JS 아님
  | 'NEXT_JS'
  | 'JAVA'
  | 'SPRING'
  | 'SPRING_BOOT'
  | 'NODE_JS'
  | 'EXPRESS'
  | 'MYSQL'
  | 'POSTGRESQL'
  | 'TENSORFLOW'
  | 'PYTORCH'
  | 'SCIKIT_LEARN'
  | 'LANGCHAIN'
  | 'OPENAI_API'
  | 'PANDAS';

// UI 표시명(설정 모달 라벨) → 백엔드 enum
const BOARD_STACK_BY_LABEL: Record<string, BoardStack> = {
  'HTML/CSS': 'HTML_CSS',
  'Tailwind CSS': 'TAILWIND_CSS',
  JavaScript: 'JAVASCRIPT',
  TypeScript: 'TYPESCRIPT',
  React: 'REACT',
  'Vue.js': 'VUE',
  'Next.js': 'NEXT_JS',
  Java: 'JAVA',
  Spring: 'SPRING',
  SpringBoot: 'SPRING_BOOT',
  'Node.js': 'NODE_JS',
  Express: 'EXPRESS',
  MySQL: 'MYSQL',
  PostgreSQL: 'POSTGRESQL',
  TensorFlow: 'TENSORFLOW',
  PyTorch: 'PYTORCH',
  'scikit-learn': 'SCIKIT_LEARN',
  LangChain: 'LANGCHAIN',
  'OpenAI API': 'OPENAI_API',
  Pandas: 'PANDAS',
};

export const labelsToBoardStacks = (labels: string[] | undefined): BoardStack[] => {
  if (!labels?.length) return [];
  const out: BoardStack[] = [];
  for (const label of labels) {
    const enumVal = BOARD_STACK_BY_LABEL[label];
    // 매핑 누락은 조용히 skip (백엔드가 모르는 값 보내면 400)
    if (enumVal) out.push(enumVal);
  }
  return Array.from(new Set(out));
};

// enum → UI 표시명 (BOARD_STACK_BY_LABEL 역방향). 상세 화면 스택 표시용.
const BOARD_STACK_LABEL: Record<BoardStack, string> = Object.entries(
  BOARD_STACK_BY_LABEL
).reduce(
  (acc, [label, enumVal]) => {
    acc[enumVal] = label;
    return acc;
  },
  {} as Record<BoardStack, string>
);

export const boardStacksToLabels = (
  stacks: BoardStack[] | undefined
): string[] => {
  if (!stacks?.length) return [];
  // 매핑에 없는 enum 은 그대로 노출 (표시 실패보다는 원문이 나음).
  return stacks.map((s) => BOARD_STACK_LABEL[s] ?? s);
};

// 플랫폼 enum → UI 표시명.
export const PLATFORM_TYPE_LABEL: Record<PlatformType, string> = {
  WEB: '웹',
  APP: '앱',
  ETC: '기타',
};

export type BoardCreateRequest = {
  title: string;
  content: string;
  boardType: BoardType;
  // 스터디 전용
  studyTag?: StudyTag | null;
  certificateType?: CertificateType | null;
  // 모집 관련 (STUDY/PROJECT)
  projectStatus?: ProjectStatus | null;
  recruitCount?: number | null;
  recruitDeadline?: string | null; // YYYY-MM-DD
  // 스택 (BoardStack enum 배열)
  recruitStacks?: BoardStack[];
  projectStacks?: BoardStack[];
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
  // 백엔드 응답에 인라인으로 옴 (S3 URL).
  profileImage?: string | null;
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
 * 백엔드가 받는 multipart 형식이 표준 FormData 로는 정확히 표현이 안 됨:
 * - `request` part: Content-Disposition 에 filename 이 있으면 Spring 이 파일로 인식
 *   → JSON deserialize 실패 → boardType null → "잘못된 게시판 타입입니다" 로 떨어짐.
 *   FormData.append(name, Blob) 은 항상 filename="blob" 을 자동으로 붙이기 때문에
 *   raw multipart body 를 직접 구성해야 함 (Swagger 가 cURL -F 로 보내는 모양 그대로).
 * - `image` part: 백엔드가 필수로 요구. 이미지 없을 땐 Swagger 처럼 빈 plain text part 로 채움.
 */
const MULTIPART_BOUNDARY = 'gitturlBoundary';

const buildBoardMultipart = (
  request: BoardCreateRequest | BoardUpdateRequest,
  image?: File | null
): { body: Blob; contentType: string } => {
  const CRLF = '\r\n';
  const parts: BlobPart[] = [];

  // request (JSON body)
  parts.push(
    `--${MULTIPART_BOUNDARY}${CRLF}` +
      `Content-Disposition: form-data; name="request"${CRLF}` +
      `Content-Type: application/json${CRLF}${CRLF}` +
      `${JSON.stringify(request)}${CRLF}`
  );

  // image
  if (image) {
    const fileName = image instanceof File ? image.name : 'image';
    parts.push(
      `--${MULTIPART_BOUNDARY}${CRLF}` +
        `Content-Disposition: form-data; name="image"; filename="${fileName}"${CRLF}` +
        `Content-Type: ${image.type || 'application/octet-stream'}${CRLF}${CRLF}`
    );
    parts.push(image);
    parts.push(CRLF);
  } else {
    // Swagger 가 보내는 모양과 동일: filename 없이 빈 string
    parts.push(
      `--${MULTIPART_BOUNDARY}${CRLF}` +
        `Content-Disposition: form-data; name="image"${CRLF}${CRLF}` +
        `${CRLF}`
    );
  }

  parts.push(`--${MULTIPART_BOUNDARY}--${CRLF}`);

  return {
    body: new Blob(parts),
    contentType: `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
  };
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
 * - request: JSON part (filename 없이 — Spring이 파일 대신 JSON으로 deserialize 하도록)
 * - image: 백엔드 필수 part. 없으면 빈 plain text 로 자리채움
 */
export const createBoard = async (
  request: BoardCreateRequest,
  image?: File | null
): Promise<ApiResponse<BoardCreateResult>> => {
  const { body, contentType } = buildBoardMultipart(request, image);
  const response = await client.post<ApiResponse<BoardCreateResult>>(
    '/api/v1/boards',
    body,
    {
      headers: { 'Content-Type': contentType },
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
  const { body, contentType } = buildBoardMultipart(request, image);
  const response = await client.patch<ApiResponse<BoardUpdateResult>>(
    `/api/v1/boards/${boardId}`,
    body,
    {
      headers: { 'Content-Type': contentType },
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
 * 게시글 좋아요 추가
 * POST /api/v1/boards/{boardId}/likes
 * 응답 result.liked: true, likeCount: 최신 카운트
 */
export const toggleBoardLike = async (
  boardId: number
): Promise<ApiResponse<BoardLikeResult>> => {
  const response = await client.post<ApiResponse<BoardLikeResult>>(
    `/api/v1/boards/${boardId}/likes`
  );
  return response.data;
};

// 좋아요 취소 응답 — 필드명이 isLiked (POST 응답의 liked 와 다름).
export type BoardUnlikeResult = {
  isLiked: boolean;
  likeCount: number;
};

/**
 * 게시글 좋아요 취소
 * DELETE /api/v1/boards/{boardId}/likes
 */
export const deleteBoardLike = async (
  boardId: number
): Promise<ApiResponse<BoardUnlikeResult>> => {
  const response = await client.delete<ApiResponse<BoardUnlikeResult>>(
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
 * 댓글 좋아요 추가
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

// 댓글 좋아요 취소 응답 — 필드명이 isLiked.
export type CommentUnlikeResult = {
  isLiked: boolean;
  likeCount: number;
};

/**
 * 댓글 좋아요 취소
 * DELETE /api/v1/comments/{commentId}/likes
 */
export const deleteCommentLike = async (
  commentId: number
): Promise<ApiResponse<CommentUnlikeResult>> => {
  const response = await client.delete<ApiResponse<CommentUnlikeResult>>(
    `/api/v1/comments/${commentId}/likes`
  );
  return response.data;
};
