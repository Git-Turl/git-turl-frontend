import { Link } from 'react-router';
import { ChevronRight, Heart, Calendar, Folder } from 'lucide-react';
import { Card } from '../../components/ui/card';

interface Post {
  id: string;
  title: string;
  description: string;
  repository: string;
  likes: number;
  date: string;
  tag: string;
}

export function MyPosts() {
  // 포스트 임시 데이터
  const posts: Post[] = [
    {
      id: '1',
      title: '쇼핑몰 클론코딩 하면서 겪은 문제 정리',
      description: '로그인, 장바구니 구현하면서 상태 관리가 꼬였던 부분 정리했습니다. 특히 로그인 이후 상태 유지하는 부분에서 많이 헤맸습니다.',
      repository: '쇼핑몰-클론코딩',
      likes: 12,
      date: '2026.03.15',
      tag: 'Backend',
    },
    {
      id: '2',
      title: 'React 리렌더링 줄이려고 해본 것들',
      description: '불필요한 리렌더링 때문에 useMemo, useCallback 적용해봤습니다. 적용 전후 차이랑 언제 써야 하는지 정리했습니다.',
      repository: '리액트-렌더링-최적화',
      likes: 18,
      date: '2026.03.10',
      tag: 'Frontend',
    },
    {
      id: '3',
      title: 'GraphQL 처음 써보면서 헷갈렸던 점',
      description: 'REST랑 뭐가 다른지 감이 안 와서 직접 API 만들어보면서 정리했습니다. resolver 구조 이해하는 데 오래 걸렸습니다.',
      repository: 'graphql-연습',
      likes: 9,
      date: '2026.03.05',
      tag: 'Backend',
    },
    {
      id: '4',
      title: 'Docker로 배포하다가 막혔던 부분 기록',
      description: '이미지는 만들었는데 EC2에서 실행이 안 돼서 삽질했습니다. 포트 설정이랑 환경변수 때문에 오래 걸렸습니다.',
      repository: 'docker-배포-연습',
      likes: 14,
      date: '2026.03.01',
      tag: 'DevOps',
    },
    {
      id: '5',
      title: '간단한 추천 알고리즘 구현해본 기록',
      description: '영화 추천 로직 만들어보면서 협업 필터링 개념을 처음 이해했습니다. 정확도보다는 흐름 이해에 집중했습니다.',
      repository: '간단-추천모델',
      likes: 11,
      date: '2026.02.28',
      tag: 'ML/AI',
    },
    {
      id: '6',
      title: 'Socket.io로 채팅 기능 구현해보기',
      description: '실시간으로 메시지 주고받는 구조를 이해하려고 만들어봤습니다. 이벤트 흐름 정리하면서 많이 배웠습니다.',
      repository: '채팅앱-토이프로젝트',
      likes: 13,
      date: '2026.02.25',
      tag: 'Backend',
    },
    {
      id: '7',
      title: '포트폴리오 만들면서 UI 고민한 부분',
      description: '컴포넌트 나누는 기준이 애매해서 여러 번 수정했습니다. 반응형 처리도 생각보다 어려웠습니다.',
      repository: '포트폴리오-사이트',
      likes: 16,
      date: '2026.02.20',
      tag: 'Frontend',
    },
    {
      id: '8',
      title: 'DB 인덱스 적용해보고 느낀 점',
      description: '쿼리 속도 개선하려고 인덱스 걸어봤는데 생각보다 차이가 크지 않았습니다. 어떤 경우에 효과 있는지 정리했습니다.',
      repository: 'db-optimization',
      likes: 10,
      date: '2026.02.15',
      tag: 'Database',
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* 네비게이션 경로 */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link
            to="/"
            className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
          >
            My Page
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">My Posts</span>
        </div>

        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-8 text-gray-900">My Posts</h1>

        {/* 포스트 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-6 bg-white border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                {/* 제목 */}
                <h2 className="text-xl text-gray-900 group-hover:text-sky-700 transition-colors">
                  {post.title}
                </h2>

                {/* 설명 */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {post.description}
                </p>

                {/* 메타데이터 */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {/* 태그 */}
                  <div className="flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-sky-500" />
                    <span className="text-sky-600">{post.tag}</span>
                  </div>

                  {/* 좋아요 */}
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span>{post.likes}</span>
                  </div>

                  {/* 날짜 */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
