import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function InterviewNew() {
  const navigate = useNavigate();
  const [selectedSummary, setSelectedSummary] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 요약 리스트 임시 데이터
  const summaries = [
    { name: 'ecommerce-platform', description: 'E-commerce 플랫폼 분석', createdAt: '2026.01.15' },
    { name: 'react-optimization', description: 'React 성능 최적화', createdAt: '2026.01.10' },
    { name: 'graphql-api', description: 'GraphQL API 서버', createdAt: '2025.12.28' },
    { name: 'k8s-deploy', description: 'Kubernetes 배포 구성', createdAt: '2025.12.25' },
    { name: 'ml-pipeline', description: 'ML 파이프라인', createdAt: '2025.12.20' },
    { name: 'chat-app', description: '실시간 채팅 애플리케이션', createdAt: '2025.12.15' },
  ];

  const filteredSummaries = summaries.filter((summary) => {
    if (filterMode === 'all') return true;

    const itemDate = new Date(summary.createdAt.replace(/\./g, '-'));
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });

  const handleGoBack = () => {
    navigate('/interview');
  };

  const handleGenerate = () => {
    if (selectedSummary) {
      navigate('/interview/loading');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">면접</h1>
          <p className="text-gray-600">새 질문 생성</p>
        </div>

        <div className="space-y-6">
          {/* 스텝 인디케이터 */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-gray-900 font-medium">요약본 선택</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-gray-500">생성 완료</span>
            </div>
          </div>

          {/* 메인 카드 */}
          <Card className="p-8 bg-white border border-sky-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl text-gray-900 mb-2">요약본 선택</h2>
              <p className="text-sm text-gray-600">면접 질문을 생성할 요약본을 선택해주세요</p>
            </div>

            {/* 필터 모드 토글 */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    filterMode === 'all'
                      ? 'bg-white text-sky-700 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterMode('date')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    filterMode === 'date'
                      ? 'bg-white text-sky-700 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  기간별 조회
                </button>
              </div>
            </div>

            {/* 날짜 범위 선택기 */}
            {filterMode === 'date' && (
              <div className="flex items-center justify-end gap-3 mb-6 p-4 bg-sky-50 rounded-lg border border-sky-100">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 font-medium">시작일:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                <span className="text-gray-400">~</span>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 font-medium">종료일:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-4 py-2 text-sm text-sky-700 bg-white border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors font-medium"
                  >
                    초기화
                  </button>
                )}
              </div>
            )}

            {/* 요약본 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredSummaries.map((summary) => (
                <button
                  key={summary.name}
                  onClick={() => setSelectedSummary(summary.name)}
                  className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                    selectedSummary === summary.name
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                  }`}
                >
                  {selectedSummary === summary.name && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FileText className={`w-5 h-5 ${selectedSummary === summary.name ? 'text-sky-700' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${selectedSummary === summary.name ? 'text-sky-900' : 'text-gray-900'}`}>
                        {summary.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{summary.description}</p>
                      <p className="text-xs text-gray-500">{summary.createdAt}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 질문 개수 선택기 */}
            {selectedSummary && (
              <div className="mb-6 p-6 bg-sky-50 border border-sky-200 rounded-lg">
                <h3 className="text-sm text-gray-700 font-medium mb-4">생성할 질문 개수를 선택하세요</h3>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        questionCount === num
                          ? 'border-sky-600 bg-sky-600 text-white font-medium shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-sky-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">개</span>
                </div>
              </div>
            )}

            {/* 선택된 요약본 */}
            {selectedSummary && (
              <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">선택된 요약본:</span>
                  <span className="ml-2 font-medium text-sky-700">{selectedSummary}</span>
                  <span className="ml-4 text-gray-600">질문 개수:</span>
                  <span className="ml-2 font-medium text-sky-700">{questionCount}개</span>
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={!selectedSummary}
                className={`px-8 py-2 ${
                  selectedSummary
                    ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                생성하기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
