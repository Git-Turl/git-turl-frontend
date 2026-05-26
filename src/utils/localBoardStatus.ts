/**
 * 게시글 모집 상태 로컬 저장소
 *
 * 현재 백엔드 API에 모집 상태 필드가 없어서 시연용으로 localStorage에 저장.
 * 백엔드에 `isRecruiting` 또는 `status` 필드가 추가되면 이 파일을 삭제하고
 * API 응답값을 그대로 사용하도록 변경하면 됨.
 */

export type RecruitStatus = 'RECRUITING' | 'COMPLETED';

const STORAGE_KEY = 'community-recruit-status';

type StatusMap = Record<string, RecruitStatus>;

function readMap(): StatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as StatusMap;
  } catch {
    return {};
  }
}

function writeMap(map: StatusMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패는 무시 (저장공간 초과 등)
  }
}

export function getRecruitStatus(boardId: number): RecruitStatus | null {
  const map = readMap();
  return map[String(boardId)] ?? null;
}

export function setRecruitStatus(
  boardId: number,
  status: RecruitStatus
): void {
  const map = readMap();
  map[String(boardId)] = status;
  writeMap(map);
}

export function removeRecruitStatus(boardId: number): void {
  const map = readMap();
  delete map[String(boardId)];
  writeMap(map);
}
