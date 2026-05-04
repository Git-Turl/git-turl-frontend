import type { JobType, TechStack } from '../api/member';

// 한글 분야 → API enum 변환
export const fieldToJobType = (field: string | null): JobType | null => {
  if (!field) return null;
  const map: Record<string, JobType> = {
    프론트: 'FRONTEND',
    백엔드: 'BACKEND',
    AI: 'AI',
  };
  return map[field] || null;
};

// 기술 스택 이름 → API enum 변환
export const stackToEnum = (stack: string): TechStack => {
  const map: Record<string, TechStack> = {
    // 백엔드
    PHP: 'PHP',
    'Node.js': 'NODE_JS',
    'Nest.js': 'NEST_JS',
    SpringBoot: 'SPRING_BOOT',
    Django: 'DJANGO',
    // 프론트
    React: 'REACT',
    TypeScript: 'TYPESCRIPT',
    Kotlin: 'KOTLIN',
    Swift: 'SWIFT',
    JavaScript: 'JAVASCRIPT',
  };
  // 매핑에 없는 건 모두 ETC
  return map[stack] || 'ETC';
};

// 여러 스택을 enum 배열로 변환 (중복 ETC는 하나로 합침)
export const stacksToEnumList = (stacks: string[]): TechStack[] => {
  const enums = stacks.map(stackToEnum);
  // 중복 제거 (ETC가 여러 개일 수 있음)
  return Array.from(new Set(enums));
};
