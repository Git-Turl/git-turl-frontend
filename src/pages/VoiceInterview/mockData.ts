import type { QuestionItem, VoiceAnswer } from '../../api/voiceInterview';

// 백엔드 연결 전 UI 확인용 모크 데이터.
// 음성면접 API 호출이 실패하거나 빈 결과일 때 폴백으로 사용
// questionId는 음수로 둬서 실제 데이터와 섞이지 않게

export const MOCK_QUESTIONS: QuestionItem[] = [
  {
    questionId: -101,
    content: 'E-commerce 플랫폼에서 사용한 주요 기술 스택과 각 기술의 선택 이유를 설명해주세요.',
    createdAt: '2026-05-19',
    status: 'DONE',
    time: null,
  },
  {
    questionId: -102,
    content: 'JWT 기반 인증 시스템을 구현할 때 고려한 보안 요소는 무엇인가요?',
    createdAt: '2026-05-19',
    status: 'DONE',
    time: null,
  },
  {
    questionId: -103,
    content: 'CI/CD 파이프라인을 구축하면서 가장 신경 쓴 부분은 무엇인가요?',
    createdAt: '2026-05-19',
    status: 'DONE',
    time: null,
  },
  {
    questionId: -104,
    content: '데이터베이스 스키마를 설계할 때 정규화와 성능 사이에서 어떤 기준으로 결정했나요?',
    createdAt: '2026-05-19',
    status: 'DONE',
    time: null,
  },
  {
    questionId: -105,
    content: '프로젝트를 진행하며 가장 어려웠던 기술적 문제와 그 해결 과정을 설명해주세요.',
    createdAt: '2026-05-19',
    status: 'DONE',
    time: null,
  },
];

export const MOCK_VOICE_ANSWERS: Record<number, VoiceAnswer> = {
  [-101]: {
    answerId: -101,
    content:
      '백엔드는 Node.js와 Express를 사용했고 데이터베이스는 PostgreSQL을 선택했습니다. 프론트엔드는 React와 TypeScript로 구현해 타입 안정성을 확보했습니다.',
    feedback:
      '기술 스택을 명확하게 제시한 점이 좋습니다. 각 기술을 프로젝트 요구사항과 연결해 "왜" 선택했는지 더 구체적으로 설명하면 설득력이 높아집니다.',
    createdAt: '2026-05-19',
    voiceFile: '',
    answerSummary: '확장성과 타입 안정성을 이유로 Node.js·PostgreSQL·React 스택을 선택함.',
    keywords: ['Node.js', 'Express', 'PostgreSQL', 'React'],
    status: 'DONE',
  },
  [-102]: {
    answerId: -102,
    content:
      'JWT 유효 기간을 짧게 설정하고 Refresh Token을 별도로 관리했습니다. HTTPS 통신을 강제하고 토큰을 HttpOnly 쿠키에 저장해 XSS 공격을 방지했습니다.',
    feedback:
      '핵심 보안 요소를 잘 짚었습니다. Secret key 관리나 CORS 설정 같은 부분도 함께 언급하면 더 완성도 높은 답변이 됩니다.',
    createdAt: '2026-05-19',
    voiceFile: '',
    answerSummary: 'JWT 유효기간·Refresh Token·HTTPS·HttpOnly 쿠키로 보안을 강화함.',
    keywords: ['JWT', '보안', 'HTTPS', 'XSS'],
    status: 'DONE',
  },
  [-103]: {
    answerId: -103,
    content:
      'Docker 컨테이너로 배포 환경을 통일하고 GitHub Actions로 테스트를 자동화했습니다. 배포 전 환경 변수 누락 같은 실수를 미리 잡을 수 있었습니다.',
    feedback:
      '안정성에 초점을 맞춘 점은 좋습니다. 보안·성능·모니터링 등 다른 요소도 함께 고려한 계획을 제시하면 더 균형 잡힌 답변이 됩니다.',
    createdAt: '2026-05-19',
    voiceFile: '',
    answerSummary: 'Docker와 GitHub Actions로 환경 통일·테스트 자동화를 강조함.',
    keywords: ['CI/CD', 'Docker', 'GitHub Actions', '자동화'],
    status: 'DONE',
  },
  [-104]: {
    answerId: -104,
    content:
      '조회가 잦은 테이블은 정규화를 일부 완화해 조인을 줄였고, 무결성이 중요한 핵심 테이블은 정규화를 유지했습니다. 인덱스로 성능을 보완했습니다.',
    feedback:
      '정규화와 성능의 트레이드오프를 이해하고 있는 점이 좋습니다. 실제 쿼리 패턴이나 측정한 성능 수치를 함께 제시하면 더 설득력이 있습니다.',
    createdAt: '2026-05-19',
    voiceFile: '',
    answerSummary: '조회 패턴에 따라 정규화 수준을 조절하고 인덱스로 성능을 보완함.',
    keywords: ['정규화', '인덱스', '성능', '스키마 설계'],
    status: 'DONE',
  },
  [-105]: {
    answerId: -105,
    content:
      '동시 요청 시 재고가 음수가 되는 문제가 있었습니다. 비관적 락과 트랜잭션을 적용해 동시성 문제를 해결했습니다.',
    feedback:
      '구체적인 문제 상황과 해결책을 잘 제시했습니다. 비관적 락 대신 낙관적 락을 고려했는지, 성능 영향은 어땠는지도 언급하면 좋습니다.',
    createdAt: '2026-05-19',
    voiceFile: '',
    answerSummary: '재고 동시성 문제를 비관적 락과 트랜잭션으로 해결함.',
    keywords: ['동시성', '비관적 락', '트랜잭션', '재고'],
    status: 'DONE',
  },
};

/**
 * 선택한 질문 개수만큼 모크 질문을 잘라서 반환.
 * count는 1~5 범위로 보정한다.
 */
export function getMockQuestions(count: number): QuestionItem[] {
  const n = Math.max(1, Math.min(count, MOCK_QUESTIONS.length));
  return MOCK_QUESTIONS.slice(0, n);
}
