// 분석본 선택 화면의 스켈레톤 행 개수를 "직전에 불러온 리포트 수"에 맞추기 위한 캐시.
// 목록 API 는 로딩이 끝나야 개수를 알 수 있으므로, 이전 로딩 값을 저장해두고
// 다음 방문 때 그 개수만큼 스켈레톤을 미리 깔아준다. 캐시가 없으면 기본값 사용.
const KEY = 'analysisReportCount';
const DEFAULT_ROWS = 4;
const MIN_ROWS = 1;
const MAX_ROWS = 12;

export function getCachedReportCount(fallback = DEFAULT_ROWS): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.min(Math.max(Math.round(n), MIN_ROWS), MAX_ROWS);
  } catch {
    return fallback;
  }
}

export function setCachedReportCount(count: number): void {
  try {
    // 0개(리포트 없음)면 굳이 캐시하지 않는다 — 다음 방문 때 기본값으로 뜨는 게 자연스러움.
    if (count > 0) localStorage.setItem(KEY, String(count));
  } catch {
    // localStorage 접근 불가(사파리 프라이빗 등) 시 무시.
  }
}
