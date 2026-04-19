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
    repoName: 'ecommerce-platform',
    createdAt: '2026.01.01',
    content: `# E-Commerce Platform 분석 리포트

## 프로젝트 개요
이 프로젝트는 Node.js와 Express를 기반으로 한 풀스택 전자상거래 플랫폼입니다.

## 주요 기능
- 사용자 인증 및 권한 관리
- 상품 카탈로그 관리
- 장바구니 및 주문 처리
- 결제 게이트웨이 통합
- 관리자 대시보드

## 기술 스택
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Payment**: Stripe API

## 아키텍처 분석
이 프로젝트는 MVC 패턴을 따르고 있으며, 레이어드 아키텍처를 통해 관심사를 명확히 분리하고 있습니다.

### 디렉토리 구조
\`\`\`
/src
  /controllers  - 비즈니스 로직 처리
  /models       - 데이터베이스 모델
  /routes       - API 라우팅
  /middleware   - 인증, 에러 핸들링
  /services     - 외부 서비스 통합
\`\`\`

## 코드 품질
- ESLint를 통한 코드 스타일 관리
- Jest를 활용한 단위 테스트 (커버리지 85%)
- 타입 안정성을 위한 TypeScript 사용

## 개선 제안사항
1. API 문서화 (Swagger/OpenAPI)
2. 로깅 시스템 강화
3. 캐싱 전략 도입 (Redis)
4. CI/CD 파이프라인 구축

## 보안 고려사항
- HTTPS 통신 필수
- SQL Injection 방어
- XSS 공격 방지
- Rate Limiting 적용

## 성능 최적화
- 데이터베이스 인덱싱
- 이미지 최적화 및 CDN 활용
- API 응답 캐싱
- 페이지네이션 구현

## 결론
전반적으로 잘 구조화된 프로젝트이며, 확장 가능한 아키텍처를 가지고 있습니다. 제안된 개선사항들을 적용하면 더욱 견고한 시스템이 될 것으로 예상됩니다.`,
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
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