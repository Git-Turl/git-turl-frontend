import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Play, Pause, Volume2, Check, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const mockFeedbackData = [
  {
    id: 0,
    question: 'E-commerce 플랫폼에서 사용한 주요 기술 스택에 대해 설명해주세요.',
    hasRecording: true,
    keywords: ['Node.js', 'Express', 'PostgreSQL', 'React'],
    sttText: '저는 이 프로젝트에서 Node.js와 Express를 백엔드 프레임워크로 사용했으며, 데이터베이스는 PostgreSQL을 선택했습니다. 프론트엔드에서는 React와 TypeScript를 사용하여 타입 안정성을 확보했고, Tailwind CSS로 스타일링을 구현했습니다. 또한 결제 시스템은 Stripe API를 통합했으며, 인증은 JWT 기반으로 구현했습니다. 배포는 AWS EC2를 사용했고, CI/CD는 GitHub Actions로 자동화했습니다.',
    myAnswer: 'Node.js, Express, PostgreSQL, React, TypeScript를 주요 기술 스택으로 사용했으며, 각 기술을 선택한 이유는 확장성과 타입 안정성 때문입니다.',
    aiFeedback: {
      strength: '기술 스택 선택에 대한 명확한 설명을 제공했습니다. PostgreSQL 선택 이유와 TypeScript의 타입 안정성 언급이 좋았습니다.',
      improvement: '각 기술을 선택한 구체적인 이유나 프로젝트 요구사항과의 연관성을 더 설명하면 더 좋을 것 같습니다.'
    }
  },
  {
    id: 1,
    question: 'JWT 기반 인증 시스템을 구현할 때 고려한 보안 요소는 무엇인가요?',
    hasRecording: true,
    keywords: ['JWT', '보안', 'HTTPS', 'XSS'],
    sttText: 'JWT 토큰의 유효 기간을 짧게 설정하고, Refresh Token을 별도로 관리했습니다. 또한 HTTPS를 통한 통신을 강제하고, 토큰을 HttpOnly 쿠키에 저장하여 XSS 공격을 방지했습니다. Secret key는 환경 변수로 관리하여 코드에 노출되지 않도록 했고, 토큰 갱신 시 이전 토큰을 블랙리스트에 추가하여 재사용을 방지했습니다.',
    myAnswer: 'JWT 유효기간 설정, Refresh Token 관리, HTTPS 강제, HttpOnly 쿠키 사용으로 XSS 공격을 방지했습니다.',
    aiFeedback: {
      strength: '보안 요소에 대한 이해도가 높습니다. JWT 유효기간, Refresh Token, HTTPS, HttpOnly 쿠키 등 핵심 보안 요소를 잘 언급했습니다.',
      improvement: 'Secret key 관리나 CORS 설정 같은 추가적인 보안 요소도 언급하면 완벽할 것 같습니다.'
    }
  },
  {
    id: 2,
    question: 'PostgreSQL을 선택한 이유와 데이터베이스 최적화 전략을 말씀해주세요.',
    hasRecording: false,
    keywords: [],
    sttText: '',
    myAnswer: '',
    aiFeedback: {
      strength: '',
      improvement: ''
    }
  },
  {
    id: 3,
    question: 'Stripe API를 통합하면서 겪었던 어려움과 해결 방법을 설명해주세요.',
    hasRecording: true,
    keywords: ['Stripe', '웹훅', '멱등성', '결제'],
    sttText: 'Stripe 웹훅 처리 과정에서 이벤트 순서 보장이 어려웠습니다. 이를 해결하기 위해 멱등성 키를 사용하고, 데이터베이스에 웹훅 이벤트 로그를 저장하여 중복 처리를 방지했습니다. 또한 웹훅 검증을 위해 Stripe 시그니처를 확인했고, 실패한 웹훅은 재시도 큐에 저장하여 자동으로 재처리되도록 구현했습니다.',
    myAnswer: '웹훅 이벤트 순서 보장 문제를 멱등성 키와 이벤트 로그로 해결했습니다.',
    aiFeedback: {
      strength: '실제 문제 상황과 해결 방법을 구체적으로 설명했습니다. 멱등성 키와 이벤트 로그 관리는 좋은 해결책입니다.',
      improvement: '웹훅 재시도 로직이나 실패 처리 전략도 함께 언급하면 더욱 좋겠습니다.'
    }
  },
  {
    id: 4,
    question: 'MVC 패턴을 적용한 이유와 레이어드 아키텍처의 장점을 설명해주세요.',
    hasRecording: true,
    keywords: ['MVC', '아키텍처', '유지보수', '확장성'],
    sttText: 'MVC 패턴을 적용한 이유는 비즈니스 로직과 프레젠테이션 로직을 분리하여 코드의 유지보수성을 높이기 위해서였습니다. 레이어드 아키텍처를 사용하면 각 계층이 독립적으로 작동하므로 테스트가 용이하고, 특정 계층만 수정해도 다른 계층에 영향을 주지 않아 확장성이 좋습니다. 또한 팀 협업 시 각자 담당 레이어에 집중할 수 있어 개발 효율이 향상됩니다.',
    myAnswer: 'MVC 패턴으로 로직을 분리하여 유지보수성을 높이고, 레이어드 아키텍처로 각 계층을 독립적으로 관리하여 확장성을 확보했습니다.',
    aiFeedback: {
      strength: 'MVC 패턴과 레이어드 아키텍처의 장점을 명확하게 설명했습니다. 유지보수성, 테스트 용이성, 확장성을 잘 언급했습니다.',
      improvement: '실제 프로젝트에서 어떻게 적용했는지 구체적인 예시를 들면 더욱 설득력이 있을 것 같습니다.'
    }
  },
];

export function VoiceInterviewFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const totalDuration = 150; // 2분 30초

  // 재생 타이머
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, totalDuration]);

  // 선택된 질문이 바뀌면 재생 초기화
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [selectedQuestion]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / totalDuration) * 100;

  const selectedItem = mockFeedbackData[selectedQuestion];

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접 피드백</h1>
          <p className="text-gray-600">ecommerce-platform</p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Progress Tracker */}
          <div className="sticky top-8 w-[72px]">
            <div className="bg-white border border-sky-100 rounded-2xl shadow-sm px-3 py-5 flex flex-col items-center gap-0">
              {mockFeedbackData.map((item, index) => {
                const isDone = item.hasRecording;
                const isCurrent = selectedQuestion === index;

                return (
                  <div key={item.id} className="flex flex-col items-center">
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
                          {item.hasRecording ? (
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
                    {index < mockFeedbackData.length - 1 && (
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
                {selectedItem.hasRecording && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-emerald-700 font-medium">분석 완료</span>
                  </div>
                )}
              </div>

              {/* 오디오 플레이어 */}
              {selectedItem.hasRecording && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (currentTime >= totalDuration) {
                          setCurrentTime(0);
                        }
                        setIsPlaying(!isPlaying);
                      }}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-sky-100 flex items-center justify-center transition-all group"
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
                        <span className="text-xs text-gray-500">음성 녹음 재생</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {formatTime(currentTime)} / {formatTime(totalDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              {selectedItem.hasRecording ? (
                <div className="space-y-6">
                  {/* 첫 번째 행: Keywords | My Answer */}
                  <div className="flex gap-6">
                    {/* Keywords */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">키워드</h3>
                      <div className="flex items-center gap-2">
                        {selectedItem.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 border border-sky-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* My Answer */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">내 답변</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedItem.myAnswer}</p>
                    </div>
                  </div>

                  {/* 두 번째 행: Full STT Text | AI Feedback */}
                  <div className="flex gap-6">
                    {/* Full STT Text */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">내 답변 (전체 텍스트)</h3>
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedItem.sttText}</p>
                    </div>

                    {/* AI Feedback */}
                    <div className="flex-1 p-5 bg-sky-50 rounded-lg border border-sky-200">
                      <h3 className="text-sm text-gray-700 font-medium mb-3">AI 피드백</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">강점:</p>
                          <p className="text-sm text-gray-800">{selectedItem.aiFeedback.strength}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">개선:</p>
                          <p className="text-sm text-gray-800">{selectedItem.aiFeedback.improvement}</p>
                        </div>
                      </div>
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
