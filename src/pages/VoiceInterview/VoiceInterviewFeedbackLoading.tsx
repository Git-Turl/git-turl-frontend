import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { getVoiceAnswer, type VoiceAnswer } from '../../api/voiceInterview';
import { useVoiceRecordingStore } from '../../store/voiceRecordingStore';

// 폴링 간격 — 초기 5초에서 점진적으로 늘려서 백엔드 부담 감소 (최대 30초).
const POLL_START_INTERVAL_MS = 5000;
const POLL_MAX_INTERVAL_MS = 30000;
const POLL_BACKOFF = 1.5;
const MAX_POLL_DURATION_MS = 6 * 60 * 1000; // 최대 6분 대기

// 백엔드 분석이 끝났는지 판정.
// - status가 'DONE'/'COMPLETED'면 완료
// - status 정보 없어도 content + feedback이 둘 다 채워졌으면 완료로 간주
function isAnswerReady(answer: VoiceAnswer | null | undefined): boolean {
  if (!answer) return false;
  const status = (answer.status || '').toUpperCase();
  if (status === 'DONE' || status === 'COMPLETED') return true;
  return !!(answer.content?.trim() && answer.feedback?.trim());
}

export function VoiceInterviewFeedbackLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    completedCount = 0,
    totalCount = 5,
    interviewId = '1',
  } = location.state || {};

  const questionIds = useVoiceRecordingStore((s) => s.currentQuestionIds);
  const [readyCount, setReadyCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const cancelledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    cancelledRef.current = false;
    startTimeRef.current = Date.now();

    // 녹음 세션 ID가 없으면 (mock 모드 등) 짧게 기다렸다 그냥 이동
    if (questionIds.length === 0) {
      const t = setTimeout(() => {
        navigate(`/voice-interview/feedback/${interviewId}`);
      }, 1500);
      return () => clearTimeout(t);
    }

    const readyIds = new Set<number>();
    let nextInterval = POLL_START_INTERVAL_MS;

    const checkAll = async () => {
      if (cancelledRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > MAX_POLL_DURATION_MS) {
        alert(
          '피드백 생성이 오래 걸리고 있습니다. 잠시 후 목록에서 다시 확인해주세요.'
        );
        navigate(`/voice-interview/feedback/${interviewId}`);
        return;
      }

      // 아직 ready 안 된 질문만 폴링
      const pending = questionIds.filter((qid) => !readyIds.has(qid));
      await Promise.all(
        pending.map(async (qid) => {
          try {
            const res = await getVoiceAnswer(qid);
            if (res.isSuccess && isAnswerReady(res.result)) {
              readyIds.add(qid);
            }
          } catch {
            // 분석 중 404/5xx 가능 — 다음 폴에서 재시도
          }
        })
      );

      if (cancelledRef.current) return;
      setReadyCount(readyIds.size);

      if (readyIds.size === questionIds.length) {
        // 전부 완료 → 피드백 페이지로 이동
        navigate(`/voice-interview/feedback/${interviewId}`);
        return;
      }

      setTimeout(checkAll, nextInterval);
      // 지수 백오프 — 다음 호출 간격을 점차 늘려서 백엔드 부담 감소
      nextInterval = Math.min(
        Math.round(nextInterval * POLL_BACKOFF),
        POLL_MAX_INTERVAL_MS
      );
    };

    const tickTimer = setInterval(() => {
      if (cancelledRef.current) return;
      setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    checkAll();

    return () => {
      cancelledRef.current = true;
      clearInterval(tickTimer);
    };
  }, [questionIds, navigate, interviewId]);

  const handleSkip = () => {
    cancelledRef.current = true;
    navigate(`/voice-interview/feedback/${interviewId}`);
  };

  // 진행률 계산 — 폴링 중이면 폴링 기준, 녹음 ID 없으면 기존 답변 완료율 사용
  const totalForBar = questionIds.length > 0 ? questionIds.length : totalCount;
  const doneForBar = questionIds.length > 0 ? readyCount : completedCount;
  const completionRate =
    totalForBar > 0 ? Math.round((doneForBar / totalForBar) * 100) : 0;

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">피드백 생성 중</p>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="p-12 bg-white border border-sky-100 max-w-md w-full shadow-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Loading Icon */}
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
              </div>

              {/* Loading Text */}
              <div>
                <p className="text-xl text-gray-900 mb-4 font-medium">
                  피드백 생성 중...
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  음성 분석은 최대 5분이 걸릴 수 있습니다.
                </p>
                <p className="text-xs text-gray-400">
                  경과 시간: {elapsedSec}초
                </p>
              </div>

              {/* Progress Info */}
              <div className="w-full pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {questionIds.length > 0
                        ? '분석 완료'
                        : '답변 완료'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {doneForBar} / {totalForBar}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">진행률</span>
                    <span className="text-sm font-medium text-sky-700">
                      {completionRate}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className="h-2 rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-sky-600 hover:underline"
              >
                지금 결과 보기 (분석 미완료 상태로 이동)
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
