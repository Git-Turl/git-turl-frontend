import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';

export function AnalyticsLoading() {
  const navigate = useNavigate();

  useEffect(() => {
    // 3초 동안 로딩 시뮬레이션 후 상세 페이지로 이동
    const timer = setTimeout(() => {
      navigate('/analytics/detail/new');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

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