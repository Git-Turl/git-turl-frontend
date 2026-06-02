import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Mic, Square, ChevronRight, Clock, Check, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getAllVoiceQuestions,
  saveVoiceAnswer,
  passVoiceAnswer,
  type QuestionItem,
} from '../../api/voiceInterview';
import { getMockQuestions } from './mockData';
import { useVoiceRecordingStore } from '../../store/voiceRecordingStore';
import { encodeBlobToMp3 } from '../../utils/audioEncoder';

const QUESTION_TIME = 120;

export function VoiceInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Record<number, { audioUrl: string; audioBlob: Blob }>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = questions[currentQuestionIndex]?.content ?? '';
  const totalQuestions = questions.length;
  const hasRecording = recordings[currentQuestionIndex] !== undefined;

  // 질문 목록 조회
  useEffect(() => {
    const reportId = Number(id);
    const store = useVoiceRecordingStore.getState();
    const mock = getMockQuestions(store.mockQuestionCount);
    if (!reportId) {
      setQuestions(mock);
      setIsLoading(false);
      return;
    }
    getAllVoiceQuestions(reportId)
      .then((list) => {
        // 같은 레포에 과거 질문이 쌓여 있을 수 있어 이번 세션 ID로만 필터링
        const currentIds = store.currentQuestionIds;
        const requested = Math.max(1, Math.min(store.mockQuestionCount, 5));
        console.log('[VoiceInterview] Detail - 전체 질문', list.length, '개, currentIds', currentIds, '선택개수', requested);
        let filtered: typeof list;
        if (currentIds.length > 0) {
          filtered = list.filter((q) => currentIds.includes(q.questionId));
        } else {
          // 폴백: createdAt 내림차순 정렬 후 사용자가 선택한 개수만큼만
          filtered = [...list]
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, requested);
        }
        // 사용자가 선택한 개수만큼만 표시 (백엔드가 더 많이 줘도 자름)
        filtered = filtered.slice(0, requested);
        // 모자라면 모크 질문으로 패딩 (백엔드가 요청 수만큼 안 줘도 화면은 N개로 채움)
        if (filtered.length < requested) {
          const padFromMock = getMockQuestions(requested).slice(filtered.length);
          filtered = [...filtered, ...padFromMock];
        }
        setQuestions(filtered.length > 0 ? filtered : mock);
      })
      .catch(() => setQuestions(mock)) // 백엔드 실패 시 모크 폴백
      .finally(() => setIsLoading(false));
  }, [id]);

  // 마이크 트랙 해제
  const releaseStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // onstop 핸들러에서 Blob 생성
    }
    setIsRecording(false);
    setTimeLeft(QUESTION_TIME);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // webm 우선, 미지원 브라우저(Safari 등)는 기본 형식 사용
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = recorder;
      const questionIndex = currentQuestionIndex;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blobType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => ({
          ...prev,
          [questionIndex]: { audioUrl, audioBlob },
        }));
        releaseStream();

        const question = questions[questionIndex];
        if (question) {
          // 피드백 화면에서 재생할 수 있도록 스토어에 저장 (재생용은 원본 webm 그대로 사용)
          useVoiceRecordingStore
            .getState()
            .setRecording(question.questionId, audioBlob);
          // mp3로 변환 후 백엔드 업로드
          encodeBlobToMp3(audioBlob)
            .then((mp3Blob) =>
              saveVoiceAnswer(question.questionId, mp3Blob, 'answer.mp3')
            )
            .then((res) => {
              console.log(
                '[VoiceInterview] saveVoiceAnswer 응답',
                question.questionId,
                res
              );
              if (!res.isSuccess) {
                console.warn(
                  '[VoiceInterview] 음성 답변 저장 실패 (응답 isSuccess=false)',
                  res
                );
              }
            })
            .catch((e: unknown) => {
              const err = e as {
                response?: { status?: number; data?: unknown };
              };
              console.error(
                '[VoiceInterview] 음성 답변 저장 에러',
                question.questionId,
                'status:',
                err?.response?.status,
                'data:',
                err?.response?.data,
                e
              );
            });
        }
      };

      recorder.start();
      setTimeLeft(QUESTION_TIME);
      setIsRecording(true);
    } catch {
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
      releaseStream();
    }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setTimeLeft(QUESTION_TIME);
  }, [currentQuestionIndex]);

  // 언마운트 시 녹음 중단 및 마이크 해제
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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
    const question = questions[currentQuestionIndex];
    if (question) {
      passVoiceAnswer(question.questionId).catch((e) =>
        console.error('답변 패스 실패', e)
      );
    }
    handleNext();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
                      const rec = recordings[currentQuestionIndex];
                      if (rec) URL.revokeObjectURL(rec.audioUrl);
                      const newRecordings = { ...recordings };
                      delete newRecordings[currentQuestionIndex];
                      setRecordings(newRecordings);
                      const q = questions[currentQuestionIndex];
                      if (q) {
                        useVoiceRecordingStore
                          .getState()
                          .removeRecording(q.questionId);
                      }
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
              {questions.map((_, index) => {
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
