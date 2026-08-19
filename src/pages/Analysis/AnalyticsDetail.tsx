import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronRight, ChevronDown, FileDown, Pencil, Check, X, Star, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getReportDetail,
  getMyProfile,
  updateReportStatus,
  updateReportTitle,
  updateReportBookmark,
  deleteReport,
  createQuestions,
} from '../../api/member';

export function AnalyticsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const [isOwnReport, setIsOwnReport] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionCount, setQuestionCount] = useState(3);
  const [answerType, setAnswerType] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [isCreatingQuestions, setIsCreatingQuestions] = useState(false);
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<number>>(new Set());
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!id) {
        navigate('/analytics');
        return;
      }

      try {
        const [response, myProfileResponse] = await Promise.all([
          getReportDetail(Number(id)),
          getMyProfile().catch(() => null),
        ]);
        if (response.isSuccess && response.result) {
          setAnalysisData(response.result);
          setIsPublic(response.result.status === 'PUBLIC');
          setIsBookmarked(response.result.bookmarked ?? false);
          setTitle(response.result.reportTitle ?? response.result.repoName);
          setIsOwnReport(
            !!myProfileResponse?.result?.githubId &&
              myProfileResponse.result.githubId === response.result.githubId
          );
        } else {
          // 아직 준비되지 않았으면 로딩 페이지로
          navigate(`/analytics/loading?reportId=${id}`);
        }
      } catch (error: any) {
        console.error('분석본 상세 조회 실패:', error);
        const status = error.response?.status;

        // 404: 존재하지 않음 → 목록으로
        // 401/403: 권한 없음 (비공개/타인 소유) → 무한 폴링 하지 말고 뒤로가기
        //   - 이전에 다른 화면(OtherProfile 등)에서 왔으면 그리로, 아니면 목록으로
        if (status === 404) {
          navigate('/analytics');
        } else if (status === 401 || status === 403) {
          alert('해당 요약본에 대한 접근 권한이 없습니다.');
          if (window.history.length > 1) navigate(-1);
          else navigate('/home');
        } else {
          // 그 외 (5xx 등): "아직 생성 중일 수도" → 로딩 페이지에서 폴링
          navigate(`/analytics/loading?reportId=${id}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [id, navigate]);

  const handleEditTitleStart = () => {
    setTitleInput(title);
    setIsEditingTitle(true);
  };

  const handleEditTitleCancel = () => {
    setIsEditingTitle(false);
    setTitleInput('');
  };

  const handleSaveTitle = async () => {
    if (!id || isUpdatingTitle || !titleInput.trim()) return;

    setIsUpdatingTitle(true);
    try {
      const response = await updateReportTitle(Number(id), { title: titleInput.trim() });
      if (response.isSuccess && response.result) {
        setTitle(response.result.title);
        setIsEditingTitle(false);
      }
    } catch (error: any) {
      console.error('제목 변경 실패:', error);
      alert('제목 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCreateQuestions = async () => {
    if (!id || isCreatingQuestions) return;

    setIsCreatingQuestions(true);
    try {
      const response = await createQuestions(Number(id), { questionCount, answerType });
      if (response.isSuccess) {
        setShowQuestionForm(false);
        navigate(
          answerType === 'VOICE'
            ? '/voice-interview'
            : `/interview/detail/${id}`
        );
      }
    } catch (error: any) {
      console.error('질문 생성 실패:', error);
      alert('질문 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingQuestions(false);
    }
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

  const handleBookmarkToggle = async () => {
    if (!id || isUpdatingBookmark || !isOwnReport) return;

    const wasBookmarked = isBookmarked;
    setIsUpdatingBookmark(true);
    setIsBookmarked(!wasBookmarked);

    try {
      const response = await updateReportBookmark(Number(id));
      if (response.isSuccess && response.result) {
        setIsBookmarked(response.result.bookmarked);
      }
    } catch (error: any) {
      console.error('북마크 변경 실패:', error);
      setIsBookmarked(wasBookmarked);
      alert('북마크 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdatingBookmark(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!id || isDeletingReport || !isOwnReport) return;
    if (!confirm('정말 삭제하시겠습니까? 관련 질문과 답변도 모두 삭제됩니다.')) return;

    setIsDeletingReport(true);
    try {
      const response = await deleteReport(Number(id));
      if (response.isSuccess) {
        navigate('/analytics');
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('분석본 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeletingReport(false);
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
        <div className="flex items-center gap-2 mb-8 text-sm print:hidden">
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
          {/* 개별 경고 — 커밋 수 부족 등 이 리포트에 한정된 데이터 품질 경고 */}
          {(() => {
            const visibleWarnings = (analysisData.content?.content.warnings ?? []).filter(
              (_: string, index: number) => !dismissedWarnings.has(index)
            );
            if (visibleWarnings.length === 0) return null;

            return (
              <div className="flex flex-col gap-2 mb-6 print:hidden">
                {analysisData.content.content.warnings.map((warning: string, index: number) =>
                  dismissedWarnings.has(index) ? null : (
                    <div
                      key={index}
                      className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="flex-1 text-sm text-amber-800">{warning}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setDismissedWarnings((prev) => new Set(prev).add(index))
                        }
                        className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
                        aria-label="경고 닫기"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })()}

          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value.slice(0, 100))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleEditTitleCancel();
                    }}
                    autoFocus
                    maxLength={100}
                    className="text-2xl text-gray-900 border-b-2 border-sky-400 bg-transparent focus:outline-none w-full"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    disabled={isUpdatingTitle || !titleInput.trim()}
                    className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 shrink-0"
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditTitleCancel}
                    disabled={isUpdatingTitle}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group mb-2">
                  <h1 className="text-2xl text-gray-900 truncate">{title}</h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditTitleStart}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-sky-600 hover:bg-sky-50 shrink-0 transition-opacity"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500">
                작성일: {new Date(analysisData.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 print:hidden">
              {/* 북마크 버튼 — 본인 소유 요약본에서만 표시 */}
              {isOwnReport && (
                <button
                  onClick={handleBookmarkToggle}
                  disabled={isUpdatingBookmark}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isBookmarked
                      ? 'text-yellow-500'
                      : 'text-gray-400 hover:text-yellow-500'
                  } ${isUpdatingBookmark ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Star
                    className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-400' : ''}`}
                  />
                  {isBookmarked ? '북마크됨' : '북마크'}
                </button>
              )}

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

              <div className="flex items-center gap-3">
                {/* 삭제 버튼 — 본인 소유 요약본에서만 표시 */}
                {isOwnReport && (
                  <Button
                    onClick={handleDeleteReport}
                    disabled={isDeletingReport}
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeletingReport ? '삭제 중...' : '삭제'}</span>
                  </Button>
                )}

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
          </div>

          {/* 분석 내용 */}
          <div className="prose max-w-none mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 min-h-[600px] max-h-[800px] overflow-y-auto shadow-inner print:max-h-none print:overflow-visible">
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
                        <p className="text-2xl font-bold text-green-900">{analysisData.content.content.commitStats.myCommitRate.toFixed(1)}%</p>
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
                          {improvement.currentStatus && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">현재 상태:</p>
                              <p className="text-sm text-gray-700">{improvement.currentStatus}</p>
                            </div>
                          )}
                          {improvement.example && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">예시:</p>
                              <p className="text-sm text-gray-700">{improvement.example}</p>
                            </div>
                          )}
                          {improvement.actionPlan && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">개선 계획:</p>
                              <p className="text-sm text-gray-700">{improvement.actionPlan}</p>
                            </div>
                          )}
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

          {/* 분석 정확도 안내 — 모든 리포트에 공통으로 적용되는 안내, 기본은 접힌 상태 */}
          <div className="mb-8 print:hidden">
            <button
              type="button"
              onClick={() => setIsNoticeOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 ${isNoticeOpen ? 'rotate-180' : ''}`}
              />
              분석본 내용이 정확하지 않나요?
            </button>
            {isNoticeOpen && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-4">
                깃털은 Git 커밋 이력을 기반으로, 사용자가 직접 작성한 파일을 분석하여 리포트를
                생성합니다. 커밋 수가 적거나 여러 명이 함께 작업한 파일이 많을 경우, 실제 기여
                내용과 분석 결과에 차이가 있을 수 있습니다.
              </p>
            )}
          </div>

          {/* 면접 질문 생성 */}
          <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200 print:hidden">
            {!showQuestionForm ? (
              <button
                onClick={() => setShowQuestionForm(true)}
                className="px-8 py-3 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 transition-colors shadow-sm hover:shadow-md"
              >
                면접 질문 생성
              </button>
            ) : (
              <div className="w-full max-w-md bg-sky-50 rounded-xl p-6 border border-sky-200">
                <h3 className="text-gray-900 font-medium mb-5">질문 생성 설정</h3>

                {/* 답변 유형 */}
                <div className="mb-5">
                  <p className="text-sm text-gray-700 mb-2">답변 유형</p>
                  <div className="flex gap-2">
                    {(['TEXT', 'VOICE'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAnswerType(type)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          answerType === type
                            ? 'bg-sky-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'
                        }`}
                      >
                        {type === 'TEXT' ? '텍스트' : '음성'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 질문 개수 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-700 mb-2">
                    질문 개수{' '}
                    <span className="text-sky-600 font-semibold">{questionCount}개</span>
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    disabled={isCreatingQuestions}
                    className="flex-1 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateQuestions}
                    disabled={isCreatingQuestions}
                    className="flex-1 py-2 text-sm text-white bg-sky-400 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingQuestions ? '생성 중...' : '생성하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}