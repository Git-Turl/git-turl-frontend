import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronRight, FileDown } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function AnalyticsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(false);

  // Mock data
  const analysisData = {
    repoName: '쇼핑몰-클론코딩',
    createdAt: '2026.01.01',
    content: `# 레포지토리 분석 결과

## 프로젝트 개요
Node.js와 Express 기반의 쇼핑몰 형태 프로젝트로 보입니다. 
사용자 인증, 상품 조회, 장바구니 기능이 구현되어 있는 것으로 추정됩니다.

## 주요 기능 (추정)
- JWT 기반 로그인/회원가입
- 상품 목록 조회 API
- 장바구니 추가/삭제 기능
- 간단한 주문 처리 로직

※ 일부 기능은 코드 구조 기준으로 추정된 내용입니다.

## 기술 스택
- Backend: Node.js, Express
- Database: PostgreSQL (ORM 사용 여부는 확인 필요)
- Authentication: JWT

## 코드 구조 분석
프로젝트는 다음과 같은 구조를 따르는 것으로 보입니다.

- controllers: 요청 처리 로직
- routes: API 라우팅
- middleware: 인증 및 에러 처리
- services: 비즈니스 로직 분리 시도

전반적으로 MVC 패턴을 참고하여 구성한 것으로 보이나, 일부 로직이 controller에 집중된 부분도 확인됩니다.

## 확인된 개선 포인트
- 에러 처리 로직이 일관되지 않은 부분이 있습니다.
- API 응답 형식이 통일되지 않은 것으로 보입니다.
- 환경변수 관리(.env)가 일부 하드코딩되어 있을 가능성이 있습니다.

## 추가로 개선해볼 수 있는 부분
- API 응답 포맷 통일 (success/data/error 구조)
- 서비스 레이어 분리 강화
- 간단한 테스트 코드 추가

## 총평
기본적인 CRUD 흐름은 잘 구현되어 있으며, 
실제 서비스 구조를 연습하기 위한 프로젝트로 적절해 보입니다. 
다만 코드 구조를 조금 더 정리하면 유지보수성이 좋아질 것으로 보입니다.`
  };

  const handleDownloadPDF = () => {
    alert('PDF 다운로드 기능이 실행됩니다.');
  };

  const handleGenerateInterview = () => {
    navigate('/interview');
  };

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
                작성일: {analysisData.createdAt}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {/* 공개/비공개 토글 스위치 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isPublic ? 'text-green-700' : 'text-gray-700'}`}>
                  {isPublic ? '공개' : '비공개'}
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
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                {analysisData.content}
              </pre>
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