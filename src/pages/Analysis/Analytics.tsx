import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Plus, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import {
  getReportList,
  updateReportBookmark,
  type ReportListItem,
  type ReportListParams,
} from '../../api/member';

export function Analytics() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: ReportListParams = {
        answerType: 'ALL'
      };
      
      if (filterMode === 'date') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      
      params.pageSize = 10;

      const response = await getReportList(params);
      if (response.isSuccess && response.result) {
        setReports(response.result.data);
      }
    } catch (error) {
      console.error('분석본 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterMode, startDate, endDate]);

  const handleNewAnalysis = () => {
    navigate('/analytics/new');
  };

  const handleCardClick = (id: string) => {
    navigate(`/analytics/detail/${id}`);
  };

  const formatDisplayDate = (dateStr: string) => {
    return dateStr.replace(/-/g, '.');
  };

  const handleBookmarkToggle = async (
    e: MouseEvent<HTMLButtonElement>,
    reportId: number
  ) => {
    e.stopPropagation();
    const wasBookmarked =
      reports.find((r) => r.reportId === reportId)?.bookmarked ?? false;

    setReports((prev) =>
      prev.map((r) =>
        r.reportId === reportId ? { ...r, bookmarked: !wasBookmarked } : r
      )
    );

    try {
      const response = await updateReportBookmark(reportId);
      if (response.isSuccess && response.result) {
        setReports((prev) =>
          prev.map((r) =>
            r.reportId === reportId
              ? { ...r, bookmarked: response.result!.bookmarked }
              : r
          )
        );
      }
    } catch (error) {
      console.error('북마크 변경 실패:', error);
      setReports((prev) =>
        prev.map((r) =>
          r.reportId === reportId ? { ...r, bookmarked: wasBookmarked } : r
        )
      );
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">분석</h1>
          <p className="text-gray-600">깃허브 레포지토리 분석 내역</p>
        </div>

        <Card className="p-8 bg-white border border-sky-100 shadow-sm">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl text-gray-900">깃허브 요약 내역</h2>

            {/* 필터 모드 토글 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${filterMode === 'all'
                      ? 'bg-white text-sky-700 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterMode('date')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${filterMode === 'date'
                      ? 'bg-white text-sky-700 shadow-sm font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  기간별 조회
                </button>
              </div>
            </div>
          </div>

          {/* 날짜 범위 선택 - filterMode가 'date'일 때만 표시 */}
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

          {/* Repository 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 새 레포지토리 분석 카드 */}
            <button
              onClick={handleNewAnalysis}
              className="h-48 border-2 border-dashed border-sky-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                <Plus className="w-6 h-6 text-sky-600" />
              </div>
              <span className="text-sm text-sky-700">새 레포지토리 분석</span>
            </button>

            {/* 기존 분석 카드 */}
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 p-5 border border-sky-100 rounded-lg flex flex-col"
                >
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-auto" />
                  <Skeleton className="h-3 w-24 mt-4" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-gray-500">분석본이 없습니다. 새 레포지토리 분석을 시작해보세요!</div>
              </div>
            ) : (
              reports.map((report) => (
                <Card
                  key={report.reportId}
                  onClick={() => handleCardClick(report.reportId.toString())}
                  className="h-48 p-5 border border-sky-100 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col h-full">
                    {/* Repository 이름 */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-gray-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                        {report.reportTitle ?? report.repoName ?? `분석본 #${report.reportId}`}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => handleBookmarkToggle(e, report.reportId)}
                        className="flex-shrink-0 ml-2 p-0.5 rounded hover:bg-sky-50 transition-colors"
                        aria-label={
                          report.bookmarked ? '북마크 해제' : '북마크 추가'
                        }
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            report.bookmarked
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-sky-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* 설명 */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-auto">
                      {report.description || '레포지토리 분석 결과'}
                    </p>

                    {/* 생성일 */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDisplayDate(report.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}