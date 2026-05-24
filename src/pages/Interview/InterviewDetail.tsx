import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getReportDetail, getQuestions, type QuestionItem } from '../../api/member';

type LocalQuestion = QuestionItem & {
  answer: string;
  feedback: string;
  isGeneratingFeedback: boolean;
};

export function InterviewDetail() {
  const { id } = useParams();
  const [reportName, setReportName] = useState('');
  const [reportCreatedAt, setReportCreatedAt] = useState('');
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);
  const questionsRef = useRef<LocalQuestion[]>([]);
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');

  questionsRef.current = questions;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [reportRes, questionsRes] = await Promise.all([
          getReportDetail(Number(id)),
          getQuestions(Number(id), { answerType: 'TEXT', pageSize: 20 }),
        ]);

        if (reportRes.isSuccess && reportRes.result) {
          setReportName(
            reportRes.result.reportTitle ?? reportRes.result.repoName
          );
        }

        if (questionsRes.isSuccess && questionsRes.result) {
          const data = questionsRes.result.data;
          setQuestions(
            data.map((q) => ({
              ...q,
              answer: '',
              feedback: '',
              isGeneratingFeedback: false,
            }))
          );
          if (data.length > 0) {
            setReportCreatedAt(data[0].createdAt.replace(/-/g, '.'));
          }
        }
      } catch (error) {
        console.error('데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // PROCESSING 질문이 있는 동안 10초마다 재조회 (최대 30회 = 5분)
  useEffect(() => {
    if (loading || !id) return;

    pollAttemptsRef.current = 0;

    const intervalId = setInterval(async () => {
      const hasProcessing = questionsRef.current.some(
        (q) => q.status === 'PROCESSING'
      );
      if (!hasProcessing) {
        clearInterval(intervalId);
        return;
      }

      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current > 30) {
        clearInterval(intervalId);
        setPollingTimedOut(true);
        return;
      }

      try {
        const res = await getQuestions(Number(id), {
          answerType: 'TEXT',
          pageSize: 20,
        });
        if (res.isSuccess && res.result) {
          setQuestions((prev) =>
            res.result!.data.map((q) => {
              const existing = prev.find((p) => p.questionId === q.questionId);
              return {
                ...q,
                answer: existing?.answer ?? '',
                feedback: existing?.feedback ?? '',
                isGeneratingFeedback: existing?.isGeneratingFeedback ?? false,
              };
            })
          );
        }
      } catch (error) {
        console.error('질문 목록 갱신 실패:', error);
      }
    }, 10000);

    pollingRef.current = intervalId;
    return () => clearInterval(intervalId);
  }, [loading, id]);

  const handleManualRefresh = async () => {
    if (!id) return;
    setPollingTimedOut(false);
    pollAttemptsRef.current = 0;
    try {
      const res = await getQuestions(Number(id), {
        answerType: 'TEXT',
        pageSize: 20,
      });
      if (res.isSuccess && res.result) {
        setQuestions((prev) =>
          res.result!.data.map((q) => {
            const existing = prev.find((p) => p.questionId === q.questionId);
            return {
              ...q,
              answer: existing?.answer ?? '',
              feedback: existing?.feedback ?? '',
              isGeneratingFeedback: existing?.isGeneratingFeedback ?? false,
            };
          })
        );
      }
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  const toggleQuestion = (questionId: number) => {
    const next = new Set(openQuestions);
    if (next.has(questionId)) {
      next.delete(questionId);
    } else {
      next.add(questionId);
    }
    setOpenQuestions(next);
  };

  const startEditingAnswer = (questionId: number, currentAnswer: string) => {
    setEditingAnswer(questionId);
    setAnswerInput(currentAnswer);
  };

  const saveAnswer = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.questionId === questionId ? { ...q, answer: answerInput } : q
      )
    );
    setEditingAnswer(null);
    setAnswerInput('');
  };

  const cancelEditingAnswer = () => {
    setEditingAnswer(null);
    setAnswerInput('');
  };

  const generateFeedback = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.questionId === questionId ? { ...q, isGeneratingFeedback: true } : q
      )
    );

    setTimeout(() => {
      const mockFeedback = `훌륭한 답변입니다! 기술적 이해도가 높으며, 실제 프로젝트 경험을 바탕으로 구체적인 예시를 들어 설명하셨습니다.

개선할 점:
1. 구체적인 성능 지표나 수치를 포함하면 더 설득력이 있을 것 같습니다.
2. 트레이드오프나 선택의 이유를 조금 더 명확히 설명하면 좋겠습니다.

전반적으로 매우 우수한 답변입니다. 실무 경험이 잘 드러나고 있습니다.`;

      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId
            ? { ...q, feedback: mockFeedback, isGeneratingFeedback: false }
            : q
        )
      );
    }, 2000);
  };

  const displayName = reportName || `분석본 #${id}`;
  const doneCount = questions.filter((q) => q.status === 'DONE').length;

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-500">질문 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-6xl mx-auto">
        {/* 네비게이션 경로 */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link
            to="/interview"
            className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            면접
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{displayName}</span>
        </div>

        <Card className="p-8 bg-white border border-sky-100 shadow-sm">
          {/* 헤더 */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl text-gray-900 mb-2">
              면접 질문 / {displayName}
            </h1>
            <p className="text-sm text-gray-500">
              {reportCreatedAt && `생성일: ${reportCreatedAt} • `}
              질문 {doneCount}개
              {questions.some((q) => q.status === 'PROCESSING') && (
                <span className="ml-2 text-sky-600">
                  ({questions.filter((q) => q.status === 'PROCESSING').length}개 생성 중)
                </span>
              )}
            </p>
          </div>

          {/* 생성 지연 안내 배너 */}
          {pollingTimedOut && questions.some((q) => q.status === 'PROCESSING') && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
              <p className="text-sm text-amber-800">
                질문 생성에 예상보다 오랜 시간이 걸리고 있습니다. 잠시 후 다시 확인해주세요.
              </p>
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                className="shrink-0 text-sm border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                새로고침
              </Button>
            </div>
          )}

          {/* 질문 목록 */}
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              아직 생성된 질문이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.questionId}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* 질문 헤더 */}
                  <button
                    onClick={() =>
                      q.status === 'DONE' && toggleQuestion(q.questionId)
                    }
                    disabled={q.status === 'PROCESSING'}
                    className={`w-full p-5 flex items-start justify-between bg-white text-left transition-colors ${
                      q.status === 'DONE'
                        ? 'hover:bg-gray-50'
                        : 'cursor-default opacity-70'
                    }`}
                  >
                    <div className="flex-1 flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-sm font-medium flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      {q.status === 'PROCESSING' || q.content === null ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                          <span className="text-sm">질문 생성 중...</span>
                        </div>
                      ) : (
                        <p className="text-gray-900 font-medium">{q.content}</p>
                      )}
                    </div>
                    {q.status === 'DONE' &&
                      (openQuestions.has(q.questionId) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      ))}
                  </button>

                  {/* 질문 상세 (펼침) */}
                  {q.status === 'DONE' && openQuestions.has(q.questionId) && (
                    <div className="p-5 pt-4 bg-gray-50 border-t border-gray-200">
                      {/* 답변 섹션 */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                          답변
                        </h3>

                        {editingAnswer === q.questionId ? (
                          <div className="space-y-4">
                            <textarea
                              value={answerInput}
                              onChange={(e) => setAnswerInput(e.target.value)}
                              maxLength={200}
                              placeholder="답변을 입력하세요 (최대 200자)"
                              className="w-full p-4 border border-sky-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                              rows={6}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {answerInput.length} / 200
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  onClick={cancelEditingAnswer}
                                  variant="outline"
                                  className="px-4 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  취소
                                </Button>
                                <Button
                                  onClick={() => saveAnswer(q.questionId)}
                                  disabled={answerInput.length === 0}
                                  className={`px-4 py-2 text-sm ${
                                    answerInput.length > 0
                                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  저장하기
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : q.answer ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {q.answer}
                              </p>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() =>
                                  startEditingAnswer(q.questionId, q.answer)
                                }
                                variant="outline"
                                className="px-4 py-2 text-sm border-sky-300 text-sky-700 hover:bg-sky-50"
                              >
                                수정하기
                              </Button>
                              {!q.feedback && !q.isGeneratingFeedback && (
                                <Button
                                  onClick={() => generateFeedback(q.questionId)}
                                  className="px-4 py-2 text-sm bg-sky-400 text-white hover:bg-sky-500"
                                >
                                  피드백 받기
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
                            <p className="text-gray-500 mb-4">
                              아직 등록된 답변이 없습니다
                            </p>
                            <Button
                              onClick={() =>
                                startEditingAnswer(q.questionId, '')
                              }
                              className="px-6 py-2 bg-sky-600 text-white hover:bg-sky-700"
                            >
                              답변 작성하기
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 피드백 섹션 */}
                      {q.isGeneratingFeedback && (
                        <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                            <p className="text-sm text-sky-700">
                              피드백 생성 중...
                            </p>
                          </div>
                          <div className="mt-3 w-full bg-sky-200 rounded-full h-1.5">
                            <div
                              className="bg-sky-600 h-1.5 rounded-full animate-pulse"
                              style={{ width: '60%' }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {q.feedback && !q.isGeneratingFeedback && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-4">
                            AI 피드백
                          </h3>
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                              {q.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
