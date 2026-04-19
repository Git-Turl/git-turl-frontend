import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface Question {
  id: number;
  question: string;
  answer: string;
  feedback: string;
  isGeneratingFeedback: boolean;
}

export function InterviewDetail() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, question: 'E-commerce 플랫폼에서 사용한 주요 기술 스택에 대해 설명해주세요.', answer: '', feedback: '', isGeneratingFeedback: false },
    { id: 2, question: 'JWT 기반 인증 시스템을 구현할 때 고려한 보안 요소는 무엇인가요?', answer: '', feedback: '', isGeneratingFeedback: false },
    { id: 3, question: 'PostgreSQL을 선택한 이유와 데이터베이스 최적화 전략을 말씀해주세요.', answer: '', feedback: '', isGeneratingFeedback: false },
    { id: 4, question: 'Stripe API를 통합하면서 겪었던 어려움과 해결 방법을 설명해주세요.', answer: '', feedback: '', isGeneratingFeedback: false },
    { id: 5, question: 'MVC 패턴을 적용한 이유와 레이어드 아키텍처의 장점을 설명해주세요.', answer: '', feedback: '', isGeneratingFeedback: false },
  ]);

  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set());
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');

  const toggleQuestion = (questionId: number) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const startEditingAnswer = (questionId: number, currentAnswer: string) => {
    setEditingAnswer(questionId);
    setAnswerInput(currentAnswer);
  };

  const saveAnswer = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, answer: answerInput } : q
    ));
    setEditingAnswer(null);
    setAnswerInput('');
  };

  const cancelEditingAnswer = () => {
    setEditingAnswer(null);
    setAnswerInput('');
  };

  const generateFeedback = (questionId: number) => {
    // 생성 중 상태 설정
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, isGeneratingFeedback: true } : q
    ));

    // 시뮬레이션 API 호출
    setTimeout(() => {
      const mockFeedback = `훌륭한 답변입니다! 기술적 이해도가 높으며, 실제 프로젝트 경험을 바탕으로 구체적인 예시를 들어 설명하셨습니다. 

개선할 점:
1. 구체적인 성능 지표나 수치를 포함하면 더 설득력이 있을 것 같습니다.
2. 트레이드오프나 선택의 이유를 조금 더 명확히 설명하면 좋겠습니다.

전반적으로 매우 우수한 답변입니다. 실무 경험이 잘 드러나고 있습니다.`;

      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, feedback: mockFeedback, isGeneratingFeedback: false } : q
      ));
    }, 2000);
  };

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
          <span className="text-gray-600">ecommerce-platform</span>
        </div>

        <Card className="p-8 bg-white border border-sky-100 shadow-sm">
          {/* 헤더 */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl text-gray-900 mb-2">
              면접 질문 / ecommerce-platform
            </h1>
            <p className="text-sm text-gray-500">
              생성일: 2026.01.15 • 질문 {questions.length}개
            </p>
          </div>

          {/* 질문 목록 */}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* 질문 헤더 */}
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full p-5 flex items-start justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-sm font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 font-medium">{q.question}</p>
                  </div>
                  {openQuestions.has(q.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </button>

                {/* 질문 내용 */}
                {openQuestions.has(q.id) && (
                  <div className="p-5 pt-4 bg-gray-50 border-t border-gray-200">
                    {/* 답변 섹션 */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">답변</h3>
                      
                      {editingAnswer === q.id ? (
                        // 답변 편집 모드
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
                                onClick={() => saveAnswer(q.id)}
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
                        // 답변 표시 모드
                        <div className="space-y-4">
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{q.answer}</p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => startEditingAnswer(q.id, q.answer)}
                              variant="outline"
                              className="px-4 py-2 text-sm border-sky-300 text-sky-700 hover:bg-sky-50"
                            >
                              수정하기
                            </Button>
                            {!q.feedback && !q.isGeneratingFeedback && (
                              <Button
                                onClick={() => generateFeedback(q.id)}
                                className="px-4 py-2 text-sm bg-sky-400 text-white hover:bg-sky-500"
                              >
                                피드백 받기
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // 답변 없음 상태
                        <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
                          <p className="text-gray-500 mb-4">아직 등록된 답변이 없습니다</p>
                          <Button
                            onClick={() => startEditingAnswer(q.id, '')}
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
                          <p className="text-sm text-sky-700">피드백 생성 중...</p>
                        </div>
                        <div className="mt-3 w-full bg-sky-200 rounded-full h-1.5">
                          <div className="bg-sky-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}

                    {q.feedback && !q.isGeneratingFeedback && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">AI 피드백</h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">{q.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
