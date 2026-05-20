import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { getAllVoiceQuestions } from '../../api/voiceInterview';

const POLL_INTERVAL = 3000; // 3초
const MAX_ATTEMPTS = 100; // 약 5분

export function VoiceInterviewLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId as number | undefined;

  useEffect(() => {
    if (!reportId) {
      // reportId 없이 들어온 경우 (직접 URL 진입 등)
      navigate('/voice-interview');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    let errorCount = 0;

    // 질문 생성이 끝났는지(PROCESSING이 없는지) 폴링
    const poll = async () => {
      attempts += 1;
      try {
        const questions = await getAllVoiceQuestions(reportId);
        if (cancelled) return;
        errorCount = 0;
        const ready =
          questions.length > 0 &&
          questions.every((q) => q.status !== 'PROCESSING');
        if (ready || attempts >= MAX_ATTEMPTS) {
          navigate(`/voice-interview/detail/${reportId}`);
          return;
        }
      } catch {
        // 백엔드 응답 실패가 반복되면 모크 모드로 간주하고 상세로 진행
        errorCount += 1;
        if (errorCount >= 2 || attempts >= MAX_ATTEMPTS) {
          if (!cancelled) navigate(`/voice-interview/detail/${reportId}`);
          return;
        }
      }
      if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate, reportId]);

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">질문 생성 중</p>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="p-12 bg-white border border-sky-100 max-w-md w-full shadow-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Loading Icon */}
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
              </div>

              {/* Loading Text */}
              <div>
                <p className="text-xl text-gray-900 mb-4 font-medium">음성 질문 생성 중...</p>
                <p className="text-sm text-gray-500">
                  음성 면접 질문은 최대 5분이 걸릴 수 있습니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
