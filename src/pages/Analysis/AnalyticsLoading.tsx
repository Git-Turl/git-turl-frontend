import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { isAxiosError } from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getReportDetail } from '../../api/member';
import type { ApiResponse } from '../../api/types';

const POLL_INTERVAL = 3000; // 3초
const MAX_ATTEMPTS = 100; // 약 5분

export function AnalyticsLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [failMessage, setFailMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      navigate('/analytics');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const checkReportStatus = async () => {
      attempts += 1;

      try {
        const response = await getReportDetail(Number(reportId));
        if (cancelled) return;

        if (response.isSuccess && response.result) {
          // 분석본이 준비되면 상세 페이지로 이동
          navigate(`/analytics/detail/${reportId}`);
          return;
        }

        // 아직 준비되지 않았으면 재시도 (최대 시도 횟수까지)
        if (attempts >= MAX_ATTEMPTS) {
          setFailMessage(
            '요약본 생성이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
          );
          return;
        }
        timer = setTimeout(checkReportStatus, POLL_INTERVAL);
      } catch (error) {
        if (cancelled) return;
        console.error('분석본 조회 실패:', error);
        const responseData = isAxiosError<ApiResponse<unknown>>(error)
          ? error.response?.data
          : undefined;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const errorCode = responseData?.code;

        // 404: 분석본 자체가 없음 → 목록으로
        // 401/403: 권한 없음 → 재시도 무의미 (계속 403 나올 뿐). 목록으로.
        //   ※ 재시도 루프가 백엔드 폭격 원인이었음.
        if (status === 404) {
          navigate('/analytics');
        } else if (status === 401 || status === 403) {
          alert('해당 요약본에 대한 접근 권한이 없습니다.');
          navigate('/analytics');
        } else if (
          typeof errorCode === 'string' &&
          errorCode.startsWith('REPORT5')
        ) {
          // 백엔드가 구조화된 에러 코드와 함께 500을 반환 = 생성 자체가 실패한 것.
          // (예: REPORT500_2 - 정확도가 낮아 생성 실패) 재시도해도 해결되지 않으므로 종료.
          // 백엔드 원문 메시지 대신 사용자용 고정 문구를 노출한다.
          setFailMessage(
            '서버에 일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.'
          );
        } else if (attempts >= MAX_ATTEMPTS) {
          setFailMessage(
            '요약본 생성이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
          );
        } else {
          // 그 외 (네트워크 오류 등): 아직 생성 중일 수 있으니 재시도
          timer = setTimeout(checkReportStatus, POLL_INTERVAL);
        }
      }
    };

    checkReportStatus();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate, reportId]);

  if (failMessage) {
    return (
      <div className="min-h-screen p-8 bg-[#F0F9FF]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">분석</h1>
            <p className="text-gray-600">요약본 생성 실패</p>
          </div>

          <div className="flex items-center justify-center min-h-[500px]">
            <Card className="p-12 bg-white border border-sky-100 max-w-md w-full shadow-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>

                <div>
                  <p className="text-xl text-gray-900 mb-4 font-medium">
                    요약본 생성에 실패했습니다
                  </p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {failMessage}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => navigate('/analytics')}
                    className="bg-sky-600 text-white hover:bg-sky-700"
                  >
                    목록으로
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-xl text-gray-900 mb-4 font-medium">
                  요약본 생성 중...
                </p>
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
