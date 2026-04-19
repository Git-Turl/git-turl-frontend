import { useState } from 'react';
import { Plus, Calendar, TrendingUp, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface RepositoryAnalysis {
  id: string;
  repoName: string;
  description: string;
  createdAt: string;
  isPublic: boolean;
}

export function Analytics() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<'all' | 'date'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Mock 데이터
  const analyses: RepositoryAnalysis[] = [
    {
      id: '1',
      repoName: '쇼핑몰-클론코딩',
      description: 'React + Node.js로 간단한 쇼핑몰 기능 구현 (로그인, 장바구니, 결제 흐름 연습)',
      createdAt: '2026-03-15',
      isPublic: true,
    },
    {
      id: '2',
      repoName: '리액트-렌더링-최적화',
      description: '불필요한 리렌더링 줄이기 위한 memo, useCallback 실습',
      createdAt: '2026-03-10',
      isPublic: false,
    },
    {
      id: '3',
      repoName: 'graphql-연습',
      description: 'Apollo Server로 간단한 GraphQL API 구성해보기',
      createdAt: '2026-03-05',
      isPublic: true,
    },
    {
      id: '4',
      repoName: 'docker-배포-연습',
      description: 'Docker로 Node 서버 컨테이너화하고 EC2에 배포 연습',
      createdAt: '2026-03-01',
      isPublic: false,
    },
    {
      id: '5',
      repoName: '간단-추천모델',
      description: 'Python으로 영화 추천 로직 간단히 구현 (협업 필터링 기초)',
      createdAt: '2026-02-28',
      isPublic: true,
    },
    {
      id: '6',
      repoName: '채팅앱-토이프로젝트',
      description: 'Socket.io로 실시간 채팅 기능 구현해보기',
      createdAt: '2026-02-25',
      isPublic: true,
    },
  ];

  const filteredAnalyses = filterMode === 'all'
    ? analyses
    : analyses.filter((analysis) => {
      if (!startDate && !endDate) return true;

      const analysisDate = new Date(analysis.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return analysisDate >= start && analysisDate <= end;
      } else if (start) {
        return analysisDate >= start;
      } else if (end) {
        return analysisDate <= end;
      }
      return true;
    });

  const handleNewAnalysis = () => {
    navigate('/analytics/new');
  };

  const handleCardClick = (id: string) => {
    navigate(`/analytics/detail/${id}`);
  };

  const formatDisplayDate = (dateStr: string) => {
    return dateStr.replace(/-/g, '.');
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
            {filteredAnalyses.map((analysis) => (
              <Card
                key={analysis.id}
                onClick={() => handleCardClick(analysis.id)}
                className="h-48 p-5 border border-sky-100 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group"
              >
                <div className="flex flex-col h-full">
                  {/* Repository 이름 */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-gray-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {analysis.repoName}
                    </h3>
                    {analysis.isPublic && (
                      <Badge className="bg-green-100 text-green-700 text-xs border-0 hover:bg-green-100">
                        공개
                      </Badge>
                    )}
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-auto">
                    {analysis.description}
                  </p>

                  {/* 생성일 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDisplayDate(analysis.createdAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}