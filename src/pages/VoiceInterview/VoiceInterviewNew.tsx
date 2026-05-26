import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, FileText, FilePlus, Plus } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getVoiceReports,
  generateQuestions,
  type ReportSummary,
} from '../../api/voiceInterview';
import { useVoiceRecordingStore } from '../../store/voiceRecordingStore';

// 확인용 모크 요약본 — 실제 목록이 비었거나 조회 실패(미로그인 등) 시 폴백
const MOCK_REPORT: ReportSummary = {
  reportId: 1,
  repoName: '(테스트) sample-repo',
  description: '확인용 모크 요약본입니다',
  createdAt: '2026-05-19',
  questionCount: 0,
};

export function VoiceInterviewNew() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getVoiceReports()
      .then((list) => setReports(list))
      .catch(() => setReports([MOCK_REPORT])) // 네트워크 실패 시에만 모크
      .finally(() => setIsLoading(false));
  }, []);

  const filteredReports = reports.filter((report) => {
    if (filterMode === 'all') return true;

    const itemDate = new Date(report.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });

  const selectedReport = reports.find((r) => r.reportId === selectedReportId);

  const handleGoBack = () => {
    navigate('/voice-interview');
  };

  const handleGenerate = async () => {
    if (selectedReportId == null) return;
    setGenerating(true);
    // 모크 모드에서 선택한 질문 개수를 상세/피드백 화면에 반영하기 위해 저장
    const store = useVoiceRecordingStore.getState();
    store.setMockQuestionCount(questionCount);
    // 새 세션이므로 이전에 누적된 ID 목록은 비움
    store.setCurrentQuestionIds([]);
    try {
      const reqBody = { questionCount, answerType: 'VOICE' as const };
      console.log('[VoiceInterview] generateQuestions REQUEST', reqBody);
      const res = await generateQuestions(selectedReportId, reqBody);
      console.log('[VoiceInterview] generateQuestions RESPONSE', res);
      const ids = res.result?.questionIdList ?? [];
      console.log('[VoiceInterview] questionIdList', ids, '(요청 개수:', questionCount, ')');
      // 사용자가 선택한 개수만큼만 저장 (백엔드가 더 많이 줘도 자름)
      store.setCurrentQuestionIds(ids.slice(0, questionCount));
    } catch (e) {
      // 백엔드 실패 시에도 모크 모드로 흐름을 이어감
      console.error('[VoiceInterview] generateQuestions FAILED', e);
    }
    navigate('/voice-interview/loading', {
      state: { reportId: selectedReportId },
    });
  };

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">새 음성 질문 생성</p>
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
              <p className="text-sm text-gray-600">음성 면접 질문을 생성할 요약본을 선택해주세요</p>
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

            {/* 기간 선택 필터 */}
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

            {/* 요약본 그리드 리스트 */}
            {isLoading ? (
              <div className="py-16 text-center text-gray-500">요약본을 불러오는 중...</div>
            ) : filteredReports.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                  <FilePlus className="w-8 h-8 text-sky-600" />
                </div>
                <p className="text-gray-700 font-medium mb-1">
                  {reports.length === 0
                    ? '등록된 레포지토리 분석본이 없습니다'
                    : '조회된 요약본이 없습니다'}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {reports.length === 0
                    ? '음성 면접을 시작하려면 먼저 레포지토리를 분석해주세요'
                    : '필터를 변경하거나 새 분석본을 만들어보세요'}
                </p>
                <Button
                  onClick={() => navigate('/analytics/new')}
                  className="px-6 py-2 bg-sky-600 text-white hover:bg-sky-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  레포지토리 분석본 만들기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {filteredReports.map((report) => (
                  <button
                    key={report.reportId}
                    onClick={() => setSelectedReportId(report.reportId)}
                    className={`relative p-5 border-2 rounded-xl text-left transition-all ${
                      selectedReportId === report.reportId
                        ? 'border-sky-500 bg-sky-50 shadow-md'
                        : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                    }`}
                  >
                    {selectedReportId === report.reportId && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FileText className={`w-5 h-5 ${selectedReportId === report.reportId ? 'text-sky-700' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${selectedReportId === report.reportId ? 'text-sky-900' : 'text-gray-900'}`}>
                          {report.repoName}
                        </h3>
                        {report.description && (
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {report.createdAt} · 음성 질문 {report.questionCount}개
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* 항상 마지막에 "새 분석본 만들기" 카드 */}
                <button
                  onClick={() => navigate('/analytics/new')}
                  className="p-5 border-2 border-dashed border-sky-300 rounded-xl text-left transition-all hover:border-sky-500 hover:bg-sky-50 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sky-700 mb-1">새 분석본 만들기</h3>
                    <p className="text-xs text-gray-500">레포지토리를 새로 분석합니다</p>
                  </div>
                </button>
              </div>
            )}

            {/* 질문 개수 선택 */}
            {selectedReport && (
              <div className="mb-6 p-6 bg-sky-50 border border-sky-200 rounded-lg">
                <h3 className="text-sm text-gray-700 font-medium mb-4">생성할 음성 질문 개수를 선택하세요</h3>
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
            {selectedReport && (
              <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">선택된 요약본:</span>
                  <span className="ml-2 font-medium text-sky-700">{selectedReport.repoName}</span>
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
                disabled={selectedReportId == null || generating}
                className={`px-8 py-2 ${
                  selectedReportId != null && !generating
                    ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {generating ? '생성 중...' : '생성하기'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
