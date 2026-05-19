import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronRight, FileDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getReportDetail, updateReportStatus } from '../../api/member';

export function AnalyticsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!id) {
        navigate('/analytics');
        return;
      }

      try {
        const response = await getReportDetail(Number(id));
        if (response.isSuccess && response.result) {
          setAnalysisData(response.result);
          setIsPublic(response.result.status === 'PUBLIC');
        } else {
          // 아직 준비되지 않았으면 로딩 페이지로
          navigate(`/analytics/loading?reportId=${id}`);
        }
      } catch (error: any) {
        console.error('분석본 상세 조회 실패:', error);
        
        // 404 에러면 목록으로 이동
        if (error.response?.status === 404) {
          navigate('/analytics');
        } else {
          // 기타 에러도 로딩 페이지로
          navigate(`/analytics/loading?reportId=${id}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [id, navigate]);

  const handleDownloadPDF = () => {
    alert('PDF 다운로드 기능이 실행됩니다.');
  };

  const handleGenerateInterview = () => {
    navigate('/interview');
  };

  const handleStatusToggle = async () => {
    if (!id || isUpdatingStatus) return;

    const newStatus = !isPublic ? 'PUBLIC' : 'PRIVATE';
    setIsUpdatingStatus(true);

    try {
      const response = await updateReportStatus(Number(id), { status: newStatus });
      if (response.isSuccess && response.result) {
        setIsPublic(response.result.status === 'PUBLIC');
        // Update the analysisData status as well
        setAnalysisData({
          ...analysisData,
          status: response.result.status
        });
      }
    } catch (error: any) {
      console.error('공개 설정 변경 실패:', error);
      // Revert the toggle on error
      setIsPublic(!isPublic);
      alert('공개 설정 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-500">분석본을 불러오는 중...</div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-500">분석본을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-6xl mx-auto">
        {/* 네비게이션 경로 */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link
            to="/analytics"
            className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            깃허브 요약 내역
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{analysisData.repoName}</span>
        </div>

        <Card className="p-8 bg-white border border-sky-100 shadow-sm">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl text-gray-900 mb-2">
                깃허브 요약 내역 / {analysisData.repoName}
              </h1>
              <p className="text-sm text-gray-500">
                작성일: {new Date(analysisData.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {/* 공개/비공개 토글 스위치 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStatusToggle}
                  disabled={isUpdatingStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300'
                    } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isPublic ? 'text-green-700' : 'text-gray-700'}`}>
                  {isUpdatingStatus ? '변경 중...' : (isPublic ? '공개' : '비공개')}
                </span>
              </div>

              {/* PDF 다운로드 버튼 */}
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 border-sky-300 text-sky-700 hover:bg-sky-50 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>pdf로 저장</span>
              </Button>
            </div>
          </div>

          {/* 분석 내용 */}
          <div className="prose max-w-none mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 min-h-[600px] max-h-[800px] overflow-y-auto shadow-inner">
              <h2 className="text-xl text-gray-900 mb-4 font-semibold">
                {analysisData.repoName} 분석 리포트
              </h2>
              {analysisData.content ? (
                <div className="space-y-6">
                  {/* 프로젝트 목적 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 목적</h3>
                    <p className="text-gray-700">{analysisData.content.content.purpose}</p>
                  </div>

                  {/* 기술 스택 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">기술 스택</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">언어</p>
                        <p className="text-blue-700">{analysisData.content.content.stack.language}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-900">프레임워크</p>
                        <p className="text-green-700">{analysisData.content.content.stack.framework}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">라이브러리</p>
                        <p className="text-purple-700">{analysisData.content.content.stack.library}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">보안</p>
                        <p className="text-orange-700">{analysisData.content.content.stack.security}</p>
                      </div>
                    </div>
                  </div>

                  {/* 커밋 통계 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">커밋 통계</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900">{analysisData.content.content.commitStats.totalCommits}</p>
                        <p className="text-sm text-gray-600">전체 커밋</p>
                      </div>
                      <div className="bg-sky-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-sky-900">{analysisData.content.content.commitStats.myCommits}</p>
                        <p className="text-sm text-sky-600">내 커밋</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-900">{analysisData.content.content.commitStats.myCommitRate}%</p>
                        <p className="text-sm text-green-600">기여도</p>
                      </div>
                    </div>
                  </div>

                  {/* 프로젝트 규모 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 규모</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-900">{analysisData.content.content.scale.fileCount}</p>
                        <p className="text-sm text-yellow-600">파일 수</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-indigo-900">{analysisData.content.content.scale.commitCount}</p>
                        <p className="text-sm text-indigo-600">커밋 수</p>
                      </div>
                    </div>
                  </div>

                  {/* 분석 보고서 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">분석 보고서</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                        {analysisData.content.content.reports}
                      </pre>
                    </div>
                  </div>

                  {/* 주요 기능 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">주요 기능</h3>
                    <div className="space-y-3">
                      {Object.values(analysisData.content.content.features).map((feature: any, index) => (
                        <div key={index} className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                          <h4 className="font-medium text-sky-900 mb-2">{feature.title}</h4>
                          {feature.files && feature.files.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">관련 파일:</p>
                              <div className="flex flex-wrap gap-1">
                                {feature.files.map((file: string, fileIndex: number) => (
                                  <span key={fileIndex} className="inline-block bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded font-mono">
                                    {file}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-700">{feature.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 개선사항 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">개선사항</h3>
                    <div className="space-y-3">
                      {Object.values(analysisData.content.content.improvements).map((improvement: any, index) => (
                        <div key={index} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <h4 className="font-medium text-amber-900 mb-2">{improvement.title}</h4>
                          {improvement.files && improvement.files.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">관련 파일:</p>
                              <div className="flex flex-wrap gap-1">
                                {improvement.files.map((file: string, fileIndex: number) => (
                                  <span key={fileIndex} className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-mono">
                                    {file}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-700">{improvement.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">아직 분석이 준비되지 않았습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 면접 질문 생성 버튼 */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={handleGenerateInterview}
              className="px-8 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition-colors shadow-sm hover:shadow-md"
            >
              면접 질문 생성
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}