import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { getReportList, getQuestions, type ReportListItem } from '../../api/member';

export function Interview() {
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [questionDates, setQuestionDates] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const params: Parameters<typeof getReportList>[0] = {
          answerType: 'TEXT',
          pageSize: 20,
        };
        if (filterMode === 'date') {
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
        }
        const response = await getReportList(params);
        if (response.isSuccess && response.result) {
          const data = response.result.data;
          setReports(data);

          // 각 리포트의 질문 생성일을 병렬로 조회
          const dateEntries = await Promise.all(
            data.map(async (report) => {
              try {
                const qRes = await getQuestions(report.reportId, {
                  answerType: 'TEXT',
                  pageSize: 1,
                });
                const firstQ = qRes.result?.data[0];
                return [report.reportId, firstQ?.createdAt ?? ''] as const;
              } catch {
                return [report.reportId, ''] as const;
              }
            })
          );
          setQuestionDates(Object.fromEntries(dateEntries));
        }
      } catch (error) {
        console.error('면접 질문 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filterMode, startDate, endDate]);

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">면접</h1>
        </div>

        <Card className="p-8 bg-white border border-sky-100 shadow-sm">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl text-gray-900">면접 질문 내역</h2>

            {/* 필터 모드 토글 */}
            <div className="flex items-center gap-4">
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
          </div>

          {/* 날짜 범위 선택기 */}
          {filterMode === 'date' && (
            <div className="flex items-center justify-end gap-3 mb-8 p-4 bg-sky-50 rounded-lg border border-sky-100">
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

          {/* 면접 질문 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 새 질문 생성 카드 */}
            <Link to="/interview/new">
              <button className="h-48 border-2 border-dashed border-sky-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all flex flex-col items-center justify-center gap-3 group w-full">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <Plus className="w-6 h-6 text-sky-600" />
                </div>
                <span className="text-sm text-sky-700">새 질문 생성</span>
              </button>
            </Link>

            {/* 기존 면접 카드 */}
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 p-5 border border-sky-100 rounded-lg flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-auto" />
                  <Skeleton className="h-3 w-24 mt-4" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {filterMode === 'date'
                  ? '해당 기간에 생성된 면접 질문이 없습니다.'
                  : '아직 생성된 면접 질문이 없습니다.'}
              </div>
            ) : (
              reports.map((report) => (
                <Link
                  key={report.reportId}
                  to={`/interview/detail/${report.reportId}`}
                  className="block"
                >
                  <Card className="h-48 p-5 border border-sky-100 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group">
                    <div className="flex flex-col h-full">
                      {/* Repository 이름 */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-gray-900 group-hover:text-sky-700 transition-colors line-clamp-1 font-medium">
                          {report.reportTitle ?? report.repoName ?? `분석본 #${report.reportId}`}
                        </h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs font-medium shrink-0 ml-2">
                          <MessageSquare className="w-3 h-3" />
                          <span>{report.questionCount}</span>
                        </div>
                      </div>

                      {/* 설명 */}
                      <p className="text-sm text-gray-600 mb-auto line-clamp-2">
                        {report.description || `면접 질문 ${report.questionCount}개`}
                      </p>

                      {/* 질문 생성일 */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {questionDates[report.reportId]
                            ? questionDates[report.reportId].replace(/-/g, '.')
                            : report.createdAt.replace(/-/g, '.')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
