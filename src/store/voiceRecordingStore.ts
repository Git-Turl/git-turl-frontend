import { create } from 'zustand';

// 음성면접 세션 상태(메모리 한정, 새로고침 시 사라짐)
// - recordings: 녹음 화면에서 만든 음성 blob을 questionId 기준으로 보관 → 피드백 화면 재생용
// - mockQuestionCount: 모크 모드에서 "새로 만들기" 시 선택한 질문 개수
type VoiceRecordingStore = {
  recordings: Record<number, Blob>;
  mockQuestionCount: number;

  // 방금 생성한 질문 ID 목록. 같은 레포에 과거 질문이 쌓여 있어도 이 ID로만 필터링
  // (폴링 대상 — 패스된 질문 제외)
  currentQuestionIds: number[];
  // 세션 전체 질문 (패스 포함)
  allSessionQuestionIds: number[];
  // 분석에 실패한(백엔드에서 QUESTION404 등으로 영구 실패 응답) 질문 ID 목록
  // 피드백 화면에서 "분석 실패"로 별도 표시하기 위해 사용
  failedQuestionIds: number[];

  setRecording: (questionId: number, blob: Blob) => void;
  removeRecording: (questionId: number) => void;
  setMockQuestionCount: (count: number) => void;
  setCurrentQuestionIds: (ids: number[]) => void;
  setAllSessionQuestionIds: (ids: number[]) => void;
  setFailedQuestionIds: (ids: number[]) => void;
};

export const useVoiceRecordingStore = create<VoiceRecordingStore>((set) => ({
  recordings: {},
  mockQuestionCount: 3,
  currentQuestionIds: [],
  allSessionQuestionIds: [],
  failedQuestionIds: [],
  setRecording: (questionId, blob) =>
    set((state) => ({
      recordings: { ...state.recordings, [questionId]: blob },
    })),
  removeRecording: (questionId) =>
    set((state) => {
      const next = { ...state.recordings };
      delete next[questionId];
      return { recordings: next };
    }),
  setMockQuestionCount: (count) => set({ mockQuestionCount: count }),
  setCurrentQuestionIds: (ids) => set({ currentQuestionIds: ids }),
  setAllSessionQuestionIds: (ids) => set({ allSessionQuestionIds: ids }),
  setFailedQuestionIds: (ids) => set({ failedQuestionIds: ids }),
}));