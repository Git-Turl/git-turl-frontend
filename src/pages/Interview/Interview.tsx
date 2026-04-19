import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/card';

export function Interview() {
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 임시 데이터
  const interviews = [
    { id: 1, repoName: 'ecommerce-platform', questionCount: 5, createdAt: '2026.01.15' },
    { id: 2, repoName: 'react-optimization', questionCount: 3, createdAt: '2026.01.10' },
    { id: 3, repoName: 'graphql-api', questionCount: 4, createdAt: '2025.12.28' },
    { id: 4, repoName: 'ml-pipeline', questionCount: 5, createdAt: '2025.12.20' },
  ];

  const filteredInterviews = interviews.filter((interview) => {
    if (filterMode === 'all') return true;

    const itemDate = new Date(interview.createdAt.replace(/\./g, '-'));
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });

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
            {filteredInterviews.length > 0 ? (
              filteredInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  to={`/interview/detail/${interview.id}`}
                  className="block"
                >
                  <Card className="h-48 p-5 border border-sky-100 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group">
                    <div className="flex flex-col h-full">
                      {/* Repository 이름 */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-gray-900 group-hover:text-sky-700 transition-colors line-clamp-1 font-medium">
                          {interview.repoName}
                        </h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs font-medium">
                          <MessageSquare className="w-3 h-3" />
                          <span>{interview.questionCount}</span>
                        </div>
                      </div>

                      {/* 설명/정보 */}
                      <p className="text-sm text-gray-600 mb-auto">
                        면접 질문 {interview.questionCount}개
                      </p>

                      {/* 생성일 */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                        <Calendar className="w-3 h-3" />
                        <span>{interview.createdAt}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : filterMode === 'date' && (
              <div className="col-span-full text-center py-12 text-gray-500">
                해당 기간에 생성된 면접 질문이 없습니다.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}