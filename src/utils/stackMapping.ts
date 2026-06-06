import type { JobType, TechStack } from '../api/member';

// 한글 분야 → API enum 변환
export const fieldToJobType = (field: string | null): JobType | null => {
  if (!field) return null;
  const map: Record<string, JobType> = {
    프론트: 'FRONTEND',
    frontend: 'FRONTEND',
    백엔드: 'BACKEND',
    backend: 'BACKEND',
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
    Flask: 'FLASK',
    'Fast API': 'FAST_API',
    'Ruby on Rails': 'RUBY_ON_RAILS',
    'ASP.NET': 'ASP_NET',
    Go: 'GO',
    Rust: 'RUST',
    // 프론트
    React: 'REACT',
    'Vue.js': 'VUE_JS',
    Angular: 'ANGULAR',
    TypeScript: 'TYPESCRIPT',
    JavaScript: 'JAVASCRIPT',
    'Next.js': 'NEXT_JS',
    Svelte: 'SVELTE',
    jQuery: 'JQUERY',
    'HTML/CSS': 'HTML_CSS',
    'Tailwind CSS': 'TAILWIND_CSS',
    // 모바일
    'React Native': 'REACT_NATIVE',
    Flutter: 'FLUTTER',
    Swift: 'SWIFT',
    Kotlin: 'KOTLIN',
    Xamarin: 'XAMARIN',
    // 데이터베이스
    MySQL: 'MYSQL',
    PostgreSQL: 'POSTGRESQL',
    MongoDB: 'MONGODB',
    Redis: 'REDIS',
    Oracle: 'ORACLE',
    SQLite: 'SQLITE',
    // DevOps/인프라
    Docker: 'DOCKER',
    Kubernetes: 'KUBERNETES',
    AWS: 'AWS',
    Azure: 'AZURE',
    GCP: 'GCP',
    Jenkins: 'JENKINS',
    'GitHub Actions': 'GITHUB_ACTIONS',
    // 기타
    Git: 'GIT',
    'RESTful API': 'RESTFUL_API',
    GraphQL: 'GRAPHQL',
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

// API enum → 표시명 역방향 변환
const enumToStackMap: Partial<Record<TechStack, string>> = Object.fromEntries(
  Object.entries(stackToEnum).map(([display, enumVal]) => [enumVal, display])
) as Partial<Record<TechStack, string>>;

export const enumToStack = (enumVal: TechStack): string =>
  enumToStackMap[enumVal] ?? enumVal;

export const enumListToStacks = (enums: TechStack[]): string[] =>
  enums.map(enumToStack);
