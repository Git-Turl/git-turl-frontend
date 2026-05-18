import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';

export function VoiceInterviewFeedbackLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completedCount = 0, totalCount = 5, interviewId = '1' } = location.state || {};

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/voice-interview/feedback/${interviewId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, interviewId]);

  return (
    <div className="min-h-screen p-8 bg-[#F0F9FF]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">음성 면접</h1>
          <p className="text-gray-600">피드백 생성 중</p>
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
                <p className="text-xl text-gray-900 mb-4 font-medium">피드백 생성 중...</p>
                <p className="text-sm text-gray-500 mb-6">
                  면접 질문은 최대 5분이 걸릴 수 있습니다.
                </p>
              </div>

              {/* Progress Info */}
              <div className="w-full pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">답변 완료</span>
                    <span className="text-sm font-medium text-gray-900">
                      {completedCount} / {totalCount}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">답변 완료율</span>
                    <span className="text-sm font-medium text-sky-700">{completionRate}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className="h-2 rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
