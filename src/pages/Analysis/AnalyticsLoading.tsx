import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { getReportDetail } from '../../api/member';

export function AnalyticsLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');

  useEffect(() => {
    const checkReportStatus = async () => {
      if (!reportId) {
        navigate('/analytics');
        return;
      }

      try {
        const response = await getReportDetail(Number(reportId));
        if (response.isSuccess && response.result) {
          // 분석본이 준비되면 상세 페이지로 이동
          navigate(`/analytics/detail/${reportId}`);
        } else {
          // 아직 준비되지 않았으면 재시도
          setTimeout(checkReportStatus, 3000);
        }
      } catch (error: any) {
        console.error('분석본 조회 실패:', error);
        const status = error.response?.status;

        // 404: 분석본 자체가 없음 → 목록으로
        // 401/403: 권한 없음 → 재시도 무의미 (계속 403 나올 뿐). 목록으로.
        //   ※ 재시도 루프가 백엔드 폭격 원인이었음.
        // 그 외 (5xx 등): 아직 생성 중일 수 있으니 재시도
        if (status === 404) {
          navigate('/analytics');
        } else if (status === 401 || status === 403) {
          alert('해당 요약본에 대한 접근 권한이 없습니다.');
          navigate('/analytics');
        } else {
          setTimeout(checkReportStatus, 3000);
        }
      }
    };

    checkReportStatus();
  }, [navigate, reportId]);

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">분석</h1>
          <p className="text-gray-600">문서 생성 중</p>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="p-12 bg-white border border-sky-100 max-w-md w-full shadow-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* 로딩 아이콘 */}
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
              </div>

              {/* 로딩 텍스트 */}
              <div>
                <p className="text-xl text-gray-900 mb-4 font-medium">요약본 생성 중...</p>
                <p className="text-sm text-gray-500">
                  문서와 질문은 최대 5분이 걸릴 수 있습니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}