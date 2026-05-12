import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, GitBranch } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getRepositories, createReport } from '../../api/member';

export function AnalyticsNew() {
  const navigate = useNavigate();
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 레포지토리 목록 조회
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await getRepositories();
        if (response.isSuccess && response.result) {
          setRepositories(response.result);
        }
      } catch (error) {
        console.error('레포지토리 목록 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const handleGoBack = () => {
    navigate('/analytics');
  };

  const handleGenerate = async () => {
    if (!selectedRepo) return;

    try {
      const response = await createReport({ fullName: selectedRepo });
      if (response.isSuccess && response.result) {
        // 분석본 생성 성공 시 로딩 페이지로 이동
        navigate('/analytics/loading');
      } else {
        alert(response.message || '분석본 생성에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '분석본 생성 중 오류가 발생했습니다.';
      alert(errorMessage);
      console.error('분석본 생성 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-500">레포지토리 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">분석</h1>
          <p className="text-gray-600">새 레포지토리 분석</p>
        </div>

        <div className="space-y-6">
          {/* 단계 표시 */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-gray-900 font-medium">레포지토리 선택</span>
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
              <h2 className="text-xl text-gray-900 mb-2">깃허브 레포지토리 선택</h2>
              <p className="text-sm text-gray-600">분석할 레포지토리를 선택해주세요</p>
            </div>

            {/* 레포지토리 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {repositories.map((repo) => (
                <button
                  key={repo.fullName}
                  onClick={() => setSelectedRepo(repo.fullName)}
                  className={`relative p-5 border-2 rounded-xl text-left transition-all ${selectedRepo === repo.fullName
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                    }`}
                >
                  {/* 선택된 체크 마크 */}
                  {selectedRepo === repo.fullName && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 레포지토리 정보 */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <GitBranch className={`w-5 h-5 ${selectedRepo === repo.fullName ? 'text-sky-700' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${selectedRepo === repo.fullName ? 'text-sky-900' : 'text-gray-900'}`}>
                        {repo.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{repo.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${selectedRepo === repo.fullName
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 선택된 레포지토리 요약 */}
            {selectedRepo && (
              <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">선택된 레포지토리:</span>
                  <span className="ml-2 font-medium text-sky-700">{selectedRepo}</span>
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
                disabled={!selectedRepo}
                className={`px-8 py-2 ${selectedRepo
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