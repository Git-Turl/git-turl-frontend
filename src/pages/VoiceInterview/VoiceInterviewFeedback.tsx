import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Play, Pause, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  getAllVoiceQuestions,
  getVoiceAnswer,
  type VoiceAnswer,
} from '../../api/voiceInterview';
import { getMockQuestions, MOCK_VOICE_ANSWERS } from './mockData';
import { useVoiceRecordingStore } from '../../store/voiceRecordingStore';

type FeedbackItem = {
  questionId: number;
  question: string;
  answer: VoiceAnswer | null; // null = 미답변
};

export function VoiceInterviewFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 질문 목록 + 각 질문의 음성 답변/피드백 조회
  useEffect(() => {
    const reportId = Number(id);

    // 녹음 화면에서 실제로 녹음한 질문만 모크 답변을 채운다.
    // (건너뛴 질문은 스토어에 없으므로 answer = null → "미답변" 처리)
    const recorded = useVoiceRecordingStore.getState().recordings;
    const mockQuestions = getMockQuestions(
      useVoiceRecordingStore.getState().mockQuestionCount
    );
    const mockAnswerFor = (qid: number): VoiceAnswer | null =>
      recorded[qid] ? MOCK_VOICE_ANSWERS[qid] ?? null : null;

    const mockItems = (): FeedbackItem[] =>
      mockQuestions.map((q) => ({
        questionId: q.questionId,
        question: q.content ?? '',
        answer: mockAnswerFor(q.questionId),
      }));

    if (!reportId) {
      setFeedbackData(mockItems());
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const questions = await getAllVoiceQuestions(reportId);
        const store = useVoiceRecordingStore.getState();
        const allSessionIds = store.allSessionQuestionIds;
        // allSessionIds가 있으면 녹음 직후 세션 → 패스 포함 전체 세션 질문 표시
        // 없으면 내역에서 접근 → 전체 질문 표시
        const list = allSessionIds.length > 0
          ? questions.filter((q) => allSessionIds.includes(q.questionId))
          : questions;
        const items = await Promise.all(
          list.map(async (q) => {
            try {
              const res = await getVoiceAnswer(q.questionId);
              // 조회 성공 → 백엔드 응답 그대로 (null이면 미답변/건너뜀)
              return {
                questionId: q.questionId,
                question: q.content ?? '',
                answer: res.result,
              };
            } catch {
              // 조회 실패 → 녹음한 질문만 모크 답변으로 폴백
              return {
                questionId: q.questionId,
                question: q.content ?? '',
                answer: mockAnswerFor(q.questionId),
              };
            }
          })
        );
        setFeedbackData(items);
      } catch {
        setFeedbackData(mockItems()); // 백엔드 실패 시 모크 폴백
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // 선택된 질문이 바뀌면 오디오 재생 초기화
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedQuestion]);

  const storeRecordings = useVoiceRecordingStore((s) => s.recordings);

  // 녹음 화면에서 녹음한 음성이 있으면 그걸 우선 재생, 없으면 API의 voiceFile
  const audioUrl = useMemo(() => {
    const item = feedbackData[selectedQuestion];
    if (!item) return '';
    const blob = storeRecordings[item.questionId];
    if (blob) return URL.createObjectURL(blob);
    return item.answer?.voiceFile ?? '';
  }, [feedbackData, selectedQuestion, storeRecordings]);

  // blob URL 메모리 정리
  useEffect(() => {
    return () => {
      if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const total = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접 피드백</h1>
          <p className="text-gray-600">피드백을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const selectedItem = feedbackData[selectedQuestion];
  const answer = selectedItem.answer;
  const hasRecording = !!answer;

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접 피드백</h1>
        </div>

        <div className="flex gap-8 items-start">
          {/* Progress Tracker */}
          <div className="sticky top-8 w-[72px]">
            <div className="bg-white border border-sky-100 rounded-2xl shadow-sm px-3 py-5 flex flex-col items-center gap-0">
              {feedbackData.map((item, index) => {
                const isDone = !!item.answer;
                const isCurrent = selectedQuestion === index;

                return (
                  <div key={item.questionId} className="flex flex-col items-center">
                    {/* 원형 아이콘 */}
                    <div className="relative group">
                      <button
                        onClick={() => setSelectedQuestion(index)}
                        onMouseEnter={() => setHoveredQuestion(index)}
                        onMouseLeave={() => setHoveredQuestion(null)}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                          ${isCurrent ? 'bg-sky-100 ring-2 ring-sky-400 ring-offset-2' : ''}
                          ${!isCurrent && isDone ? 'bg-emerald-100 ring-2 ring-emerald-300' : ''}
                          ${!isCurrent && !isDone ? 'bg-gray-100 ring-1 ring-gray-200' : ''}
                        `}
                      >
                        {isDone && !isCurrent && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-sky-600">Q{index + 1}</span>
                        )}
                        {!isCurrent && !isDone && (
                          <span className="text-[10px] font-medium text-gray-400">Q{index + 1}</span>
                        )}
                      </button>
                      {isCurrent && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white" />
                      )}

                      {/* Tooltip - 문제 미리보기 */}
                      {hoveredQuestion === index && (
                        <div className="absolute left-16 top-0 z-10 w-80 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-2xl">
                          <p className="leading-relaxed">Q{index + 1}. {item.question}</p>
                          {item.answer ? (
                            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-300">
                              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                              <span>답변 완료</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                              <span>미답변</span>
                            </div>
                          )}
                          <div className="absolute left-0 top-6 -ml-2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-8 border-r-gray-900" />
                        </div>
                      )}
                    </div>

                    {/* 연결선 */}
                    {index < feedbackData.length - 1 && (
                      <div className={`w-px h-5 my-1 transition-colors duration-300 ${isDone ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-100 w-full space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-400 leading-tight">완료</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-400 leading-tight">선택됨</span>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 - 선택된 질문 상세 */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white rounded-2xl p-8 border border-sky-100 shadow-sm">
              {/* Question Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                  <p className="text-gray-900 text-base">
                    Q{selectedQuestion + 1}. {selectedItem.question}
                  </p>
                </div>
                {hasRecording && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-emerald-700 font-medium">분석 완료</span>
                  </div>
                )}
              </div>

              {/* 오디오 플레이어 */}
              {(hasRecording || audioUrl) && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-300 transition-colors">
                  <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
                    preload="metadata"
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        const audio = audioRef.current;
                        if (!audio) return;
                        if (audio.paused) {
                          audio.play();
                        } else {
                          audio.pause();
                        }
                      }}
                      disabled={!audioUrl}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-sky-100 flex items-center justify-center transition-all group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-gray-700 group-hover:text-sky-700 fill-gray-700 group-hover:fill-sky-700" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-700 group-hover:text-sky-700 fill-gray-700 group-hover:fill-sky-700 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {audioUrl ? '음성 녹음 재생' : '녹음 파일 없음'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              {hasRecording && answer ? (
                <div className="space-y-6">
                  {/* 첫 번째 행: Keywords | My Answer */}
                  <div className="flex gap-6">
                    {/* Keywords */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">키워드</h3>
                      <div className="flex items-center flex-wrap gap-2">
                        {answer.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 border border-sky-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* My Answer (요약) */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">내 답변 요약</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{answer.answerSummary}</p>
                    </div>
                  </div>

                  {/* 두 번째 행: Full STT Text | AI Feedback */}
                  <div className="flex gap-6">
                    {/* Full STT Text */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">내 답변 (전체 텍스트)</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{answer.content}</p>
                    </div>

                    {/* AI Feedback */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">AI 피드백</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{answer.feedback}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">이 질문은 답변하지 않았습니다.</p>
                </div>
              )}

              {/* 뒤로가기 버튼 */}
              <div className="flex justify-start pt-8 border-t border-gray-200 mt-8">
                <Button
                  onClick={() => navigate('/voice-interview')}
                  variant="outline"
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  목록으로 돌아가기
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
