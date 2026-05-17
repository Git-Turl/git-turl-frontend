import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Mic, Square, ChevronRight, Clock, Check, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const mockQuestions = [
  'E-commerce 플랫폼에서 사용한 주요 기술 스택에 대해 설명해주세요.',
  'JWT 기반 인증 시스템을 구현할 때 고려한 보안 요소는 무엇인가요?',
  'PostgreSQL을 선택한 이유와 데이터베이스 최적화 전략을 말씀해주세요.',
  'Stripe API를 통합하면서 겪었던 어려움과 해결 방법을 설명해주세요.',
  'MVC 패턴을 적용한 이유와 레이어드 아키텍처의 장점을 설명해주세요.',
];

const QUESTION_TIME = 120;

export function VoiceInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Record<number, { audioUrl: string; sttText: string }>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalQuestions = mockQuestions.length;
  const hasRecording = recordings[currentQuestionIndex] !== undefined;

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setTimeLeft(QUESTION_TIME);
    setRecordings((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        audioUrl: 'mock-audio-url',
        sttText: '저는 이 프로젝트에서 Node.js와 Express를 백엔드 프레임워크로 사용했으며, 데이터베이스는 PostgreSQL을 선택했습니다.',
      },
    }));
  }, [currentQuestionIndex]);

  const startRecording = () => {
    setTimeLeft(QUESTION_TIME);
    setIsRecording(true);
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return QUESTION_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setTimeLeft(QUESTION_TIME);
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerPercent = (timeLeft / QUESTION_TIME) * 100;
  const isWarning = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const completedCount = Object.keys(recordings).length;
      navigate('/voice-interview/feedback-loading', {
        state: {
          completedCount,
          totalCount: totalQuestions,
          interviewId: id,
        },
      });
    }
  };

  const handleSkip = () => {
    setSkipped((prev) => new Set(prev).add(currentQuestionIndex));
    handleNext();
  };

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">ecommerce-platform</p>
        </div>

        <div className="flex gap-5 items-start">
          {/* Main Card */}
          <Card className="p-8 bg-white border border-sky-100 shadow-sm flex-1">
            {/* Question */}
            <div className="mb-6">
              <p className="text-lg text-gray-800 leading-relaxed">
                <span className="text-sky-600 font-semibold mr-1">Q{currentQuestionIndex + 1}.</span>
                {currentQuestion}
              </p>
            </div>

            {/* Timer */}
            <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-600'}`}>
                    답변 시간
                  </span>
                </div>
                <span className={`text-2xl font-mono font-bold tabular-nums ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-sky-500'}`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              {isRecording && (
                <p className={`text-xs mt-1.5 text-right ${isCritical ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-gray-400'}`}>
                  {isCritical ? '시간이 거의 다 됐어요!' : isWarning ? '곧 녹음이 종료됩니다' : '시간이 끝나면 자동으로 녹음이 종료됩니다'}
                </p>
              )}
            </div>

            {/* Recording Section */}
            <div className="mb-8 p-8 bg-gray-50 rounded-lg min-h-[260px] flex items-center justify-center">
              {!hasRecording ? (
                <div className="text-center">
                  {isRecording ? (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                          <Mic className="w-12 h-12 text-red-600" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-700">녹음 중...</p>
                      <Button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white hover:bg-red-700 text-base">
                        <Square className="w-5 h-5 mr-2" />
                        녹음 중지
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center">
                          <Mic className="w-12 h-12 text-sky-600" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-500">녹음 버튼을 눌러 답변을 시작하세요</p>
                      <Button onClick={startRecording} className="px-8 py-3 bg-sky-600 text-white hover:bg-sky-700 text-base">
                        <Mic className="w-5 h-5 mr-2" />
                        녹음 시작
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <Mic className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <p className="text-lg text-green-700 font-medium">✓ 녹음 완료</p>
                  <Button
                    onClick={() => {
                      const newRecordings = { ...recordings };
                      delete newRecordings[currentQuestionIndex];
                      setRecordings(newRecordings);
                    }}
                    variant="outline"
                    className="px-8 py-3 text-base border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    다시 녹음
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={() => navigate('/voice-interview')}
                variant="outline"
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                중단하기
              </Button>
              <div className="flex gap-3">
                <Button onClick={handleSkip} variant="outline" className="px-6 py-2 border-sky-300 text-sky-700 hover:bg-sky-50">
                  건너뛰기
                </Button>
                <Button onClick={handleNext} className="px-8 py-2 bg-sky-600 text-white hover:bg-sky-700">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <span className="flex items-center gap-1.5">
                      다음
                      <ChevronRight className="w-4 h-4 -mr-1" />
                    </span>
                  ) : (
                    '완료'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Progress Tracker */}
          <div className="sticky top-8 w-[72px]">
            <div className="bg-white border border-sky-100 rounded-2xl shadow-sm px-3 py-5 flex flex-col items-center gap-0">
              {mockQuestions.map((_, index) => {
                const isDone = !!recordings[index];
                const isSkippedQ = skipped.has(index) && !recordings[index];
                const isCurrent = index === currentQuestionIndex;
                const isPending = !isDone && !isSkippedQ && !isCurrent;

                return (
                  <div key={index} className="flex flex-col items-center">
                    {/* 원형 아이콘 */}
                    <div className="relative">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                          ${isDone ? 'bg-emerald-100 ring-2 ring-emerald-300' : ''}
                          ${isSkippedQ ? 'bg-red-100 ring-2 ring-red-300' : ''}
                          ${isCurrent ? 'bg-sky-100 ring-2 ring-sky-400 ring-offset-2' : ''}
                          ${isPending ? 'bg-gray-100 ring-1 ring-gray-200' : ''}
                        `}
                      >
                        {isDone && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                        {isSkippedQ && <X className="w-4 h-4 text-red-500 stroke-[2.5]" />}
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-sky-600">Q{index + 1}</span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-medium text-gray-400">Q{index + 1}</span>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white" />
                      )}
                    </div>

                    {/* 연결선 */}
                    {index < totalQuestions - 1 && (
                      <div className={`w-px h-5 my-1 transition-colors duration-300 ${isDone ? 'bg-emerald-200' : isSkippedQ ? 'bg-red-200' : 'bg-gray-200'}`} />
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
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-400 leading-tight">건너뜀</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                  <span className="text-[10px] text-gray-400 leading-tight">진행중</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
