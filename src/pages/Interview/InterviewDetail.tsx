import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getReportDetail,
  getQuestions,
  getAnswers,
  saveAnswer as saveAnswerApi,
  createFeedback,
  deleteAnswer as deleteAnswerApi,
  deleteQuestion as deleteQuestionApi,
  type QuestionItem,
  type AnswerItem,
} from '../../api/member';

type LocalAnswer = AnswerItem & {
  isGeneratingFeedback: boolean;
};

type LocalQuestion = QuestionItem & {
  answers: LocalAnswer[];
  isLoadingAnswers: boolean;
};

export function InterviewDetail() {
  const { id } = useParams();
  const [reportName, setReportName] = useState('');
  const [reportCreatedAt, setReportCreatedAt] = useState('');
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set());
  const pollAttemptsRef = useRef(0);
  const questionsRef = useRef<LocalQuestion[]>([]);
  const [addingAnswerTo, setAddingAnswerTo] = useState<number | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

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
              answers: [],
              isLoadingAnswers: false,
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
                answers: existing?.answers ?? [],
                isLoadingAnswers: existing?.isLoadingAnswers ?? false,
              };
            })
          );
        }
      } catch (error) {
        console.error('질문 목록 갱신 실패:', error);
      }
    }, 10000);

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
              answers: existing?.answers ?? [],
              isLoadingAnswers: existing?.isLoadingAnswers ?? false,
            };
          })
        );
      }
    } catch (error) {
      console.error('새로고침 실패:', error);
    }
  };

  const fetchAnswersForQuestion = async (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.questionId === questionId ? { ...q, isLoadingAnswers: true } : q
      )
    );
    try {
      const res = await getAnswers(questionId);
      if (res.isSuccess && res.result) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.questionId === questionId
              ? {
                  ...q,
                  answers: res.result!.map((a) => ({
                    ...a,
                    isGeneratingFeedback: false,
                  })),
                  isLoadingAnswers: false,
                }
              : q
          )
        );
      }
    } catch {
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId ? { ...q, isLoadingAnswers: false } : q
        )
      );
    }
  };

  const toggleQuestion = (questionId: number) => {
    const next = new Set(openQuestions);
    if (next.has(questionId)) {
      next.delete(questionId);
      setOpenQuestions(next);
    } else {
      next.add(questionId);
      setOpenQuestions(next);
      fetchAnswersForQuestion(questionId);
    }
  };

  const saveAnswer = async (questionId: number) => {
    if (isSavingAnswer || !answerInput.trim()) return;

    setIsSavingAnswer(true);
    try {
      const response = await saveAnswerApi(questionId, {
        content: answerInput.trim(),
      });
      if (response.isSuccess) {
        setAnswerInput('');
        setAddingAnswerTo(null);
        fetchAnswersForQuestion(questionId);
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 'ANSWER400_1') {
        alert('답변은 질문당 최대 3개까지 저장할 수 있습니다.');
      } else {
        alert('답변 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const cancelForm = () => {
    setAddingAnswerTo(null);
    setAnswerInput('');
  };

  const deleteAnswer = async (questionId: number, answerId: number) => {
    if (!window.confirm('답변을 삭제하시겠습니까?')) return;
    try {
      const response = await deleteAnswerApi(answerId);
      if (response.isSuccess) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.questionId === questionId
              ? { ...q, answers: q.answers.filter((a) => a.answerId !== answerId) }
              : q
          )
        );
      }
    } catch {
      alert('답변 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!window.confirm('질문을 삭제하시겠습니까? 관련 답변도 모두 삭제됩니다.')) return;
    try {
      const response = await deleteQuestionApi(questionId);
      if (response.isSuccess) {
        setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
        setOpenQuestions((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      }
    } catch {
      alert('질문 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const generateFeedback = async (questionId: number, answerId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.questionId === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.answerId === answerId
                  ? { ...a, isGeneratingFeedback: true }
                  : a
              ),
            }
          : q
      )
    );

    const onError = () => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId
            ? {
                ...q,
                answers: q.answers.map((a) =>
                  a.answerId === answerId
                    ? { ...a, isGeneratingFeedback: false }
                    : a
                ),
              }
            : q
        )
      );
      alert('피드백 생성에 실패했습니다. 다시 시도해주세요.');
    };

    try {
      const response = await createFeedback(answerId);
      if (!response.isSuccess) {
        onError();
        return;
      }

      // 피드백 생성 완료 폴링 (3초 후 시작, 5초 간격 최대 12회)
      let attempts = 0;
      const pollFeedback = async () => {
        attempts++;
        try {
          const res = await getAnswers(questionId);
          if (res.isSuccess && res.result) {
            const updated = res.result.find((a) => a.answerId === answerId);
            if (updated?.feedback !== null || attempts >= 12) {
              setQuestions((prev) =>
                prev.map((q) =>
                  q.questionId === questionId
                    ? {
                        ...q,
                        answers: res.result!.map((a) => ({
                          ...a,
                          isGeneratingFeedback: false,
                        })),
                        isLoadingAnswers: false,
                      }
                    : q
                )
              );
              return;
            }
          }
        } catch {
          // ignore and retry
        }
        if (attempts < 12) setTimeout(pollFeedback, 5000);
        else {
          setQuestions((prev) =>
            prev.map((q) =>
              q.questionId === questionId
                ? {
                    ...q,
                    answers: q.answers.map((a) =>
                      a.answerId === answerId
                        ? { ...a, isGeneratingFeedback: false }
                        : a
                    ),
                  }
                : q
            )
          );
        }
      };
      setTimeout(pollFeedback, 3000);
    } catch {
      onError();
    }
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
                  (
                  {questions.filter((q) => q.status === 'PROCESSING').length}개
                  생성 중)
                </span>
              )}
            </p>
          </div>

          {/* 생성 지연 안내 배너 */}
          {pollingTimedOut &&
            questions.some((q) => q.status === 'PROCESSING') && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
                <p className="text-sm text-amber-800">
                  질문 생성에 예상보다 오랜 시간이 걸리고 있습니다. 잠시 후
                  다시 확인해주세요.
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
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(q.questionId);
                        }}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                      {q.status === 'DONE' &&
                        (openQuestions.has(q.questionId) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        ))}
                    </div>
                  </button>

                  {/* 질문 상세 (펼침) */}
                  {q.status === 'DONE' && openQuestions.has(q.questionId) && (
                    <div className="p-5 pt-4 bg-gray-50 border-t border-gray-200">
                      {q.isLoadingAnswers ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                          <span className="text-sm">
                            답변 목록을 불러오는 중...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* 답변 없음 */}
                          {q.answers.length === 0 &&
                            addingAnswerTo !== q.questionId && (
                              <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-500 mb-4">
                                  아직 등록된 답변이 없습니다
                                </p>
                                <Button
                                  onClick={() =>
                                    setAddingAnswerTo(q.questionId)
                                  }
                                  className="px-6 py-2 bg-sky-600 text-white hover:bg-sky-700"
                                >
                                  답변 작성하기
                                </Button>
                              </div>
                            )}

                          {/* 기존 답변 목록 */}
                          {q.answers.map((answer, aIdx) => (
                            <div
                              key={answer.answerId}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                  답변 {aIdx + 1}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {answer.createdAt.replace(/-/g, '.')}
                                </span>
                              </div>

                              <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">
                                {answer.content}
                              </p>

                              {/* 피드백 */}
                              {answer.isGeneratingFeedback ? (
                                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                                    <p className="text-sm text-sky-700">
                                      피드백 생성 중...
                                    </p>
                                  </div>
                                </div>
                              ) : answer.feedback ? (
                                <>
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-xs font-medium text-green-700 mb-1">
                                      AI 피드백
                                    </p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                      {answer.feedback}
                                    </p>
                                  </div>
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      onClick={() =>
                                        deleteAnswer(q.questionId, answer.answerId)
                                      }
                                      variant="outline"
                                      className="px-4 py-1.5 text-sm border-red-200 text-red-500 hover:bg-red-50"
                                    >
                                      삭제
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() =>
                                      deleteAnswer(q.questionId, answer.answerId)
                                    }
                                    variant="outline"
                                    className="px-4 py-1.5 text-sm border-red-200 text-red-500 hover:bg-red-50"
                                  >
                                    삭제
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      generateFeedback(q.questionId, answer.answerId)
                                    }
                                    className="px-4 py-1.5 text-sm bg-sky-400 text-white hover:bg-sky-500"
                                  >
                                    피드백 받기
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* 답변 추가 폼 */}
                          {addingAnswerTo === q.questionId ? (
                            <div className="bg-white border border-sky-200 rounded-lg p-4 space-y-3">
                              <textarea
                                value={answerInput}
                                onChange={(e) => setAnswerInput(e.target.value)}
                                maxLength={200}
                                placeholder="답변을 입력하세요 (최대 200자)"
                                className="w-full p-3 border border-sky-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm"
                                rows={5}
                                autoFocus
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {answerInput.length} / 200
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={cancelForm}
                                    disabled={isSavingAnswer}
                                    variant="outline"
                                    className="px-4 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    onClick={() => saveAnswer(q.questionId)}
                                    disabled={
                                      answerInput.length === 0 || isSavingAnswer
                                    }
                                    className={`px-4 py-2 text-sm ${
                                      answerInput.length > 0 && !isSavingAnswer
                                        ? 'bg-sky-600 text-white hover:bg-sky-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {isSavingAnswer ? '저장 중...' : '저장하기'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            q.answers.length > 0 &&
                            q.answers.length < 3 && (
                              <div className="flex justify-end">
                                <Button
                                  onClick={() =>
                                    setAddingAnswerTo(q.questionId)
                                  }
                                  variant="outline"
                                  className="px-4 py-2 text-sm border-sky-300 text-sky-700 hover:bg-sky-50"
                                >
                                  답변 추가하기 ({q.answers.length}/3)
                                </Button>
                              </div>
                            )
                          )}
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
