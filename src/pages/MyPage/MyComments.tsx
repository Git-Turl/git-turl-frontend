import { Link } from 'react-router';
import { ChevronRight, Heart, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface Comment {
  id: string;
  postTitle: string;
  postDescription: string;
  commentText: string;
  category: string;
  likes: number;
  date: string;
}

export function MyComments() {
  // 댓글 임시 데이터
  const comments: Comment[] = [
    {
      id: '1',
      postTitle: 'React Hooks 스터디 모집',
      postDescription: 'useEffect, useMemo 중심으로 같이 정리하실 분 구합니다',
      commentText: '저 참여하고 싶습니다! Hooks 쓸 때 의존성 배열 항상 헷갈려서 같이 공부해보고 싶어요.',
      category: '스터디',
      likes: 7,
      date: '2026.03.15',
    },
    {
      id: '2',
      postTitle: 'TypeScript 적용 고민',
      postDescription: '기존 JS 프로젝트 TS로 전환 중입니다',
      commentText: '저도 비슷한 경험 있는데 타입 정의하는 부분이 제일 어렵더라구요… 혹시 기준 어떻게 잡으셨나요?',
      category: '스터디',
      likes: 5,
      date: '2026.03.14',
    },
    {
      id: '3',
      postTitle: '백엔드 구조 어떻게 나누시나요?',
      postDescription: 'Controller-Service 구조 고민 중입니다',
      commentText: '저도 최근에 구조 분리했는데 오히려 더 복잡해진 느낌이 있어서 고민이네요 ㅠ',
      category: '스터디',
      likes: 9,
      date: '2026.03.12',
    },
    {
      id: '4',
      postTitle: '알고리즘 스터디 구합니다',
      postDescription: '주 3회 문제 풀이',
      commentText: '혼자 하니까 자꾸 미루게 돼서… 같이 하면 좋을 것 같아요!',
      category: '스터디',
      likes: 11,
      date: '2026.03.10',
    },
    {
      id: '5',
      postTitle: 'GraphQL 입문 질문',
      postDescription: 'REST에서 넘어가려고 합니다',
      commentText: 'Query랑 Mutation 구분은 이해했는데 실제로 언제 쓰는지 감이 잘 안 잡히네요',
      category: '스터디',
      likes: 6,
      date: '2026.03.08',
    },
    {
      id: '6',
      postTitle: 'AWS 배포 경험 공유',
      postDescription: 'EC2 + Nginx 설정',
      commentText: '저도 배포하다가 CORS 때문에 하루 날렸는데… 혹시 설정 어떻게 하셨나요?',
      category: '스터디',
      likes: 10,
      date: '2026.03.05',
    },
    {
      id: '7',
      postTitle: 'UI/UX 고민',
      postDescription: '포트폴리오 디자인 피드백 요청',
      commentText: '저도 지금 포폴 만들고 있는데 레이아웃 잡는 게 제일 어렵네요',
      category: '스터디',
      likes: 8,
      date: '2026.03.03',
    },
    {
      id: '8',
      postTitle: 'DB 성능 개선 질문',
      postDescription: '쿼리 속도 개선 관련',
      commentText: '인덱스 걸었는데도 크게 차이가 안 나는데 혹시 다른 방법 있을까요?',
      category: '스터디',
      likes: 13,
      date: '2026.03.01',
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
          <span className="text-gray-600">My Comments</span>
        </div>

        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-8 text-gray-900">My Comments</h1>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card
              key={comment.id}
              className="p-6 bg-white border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                {/* 카테고리 배지 */}
                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
                  {comment.category}
                </Badge>

                {/* 원본 게시글 제목 */}
                <h2 className="text-lg text-gray-900 group-hover:text-sky-700 transition-colors">
                  {comment.postTitle}
                </h2>

                {/* 원본 게시글 설명 */}
                <p className="text-sm text-gray-400">
                  {comment.postDescription}
                </p>

                {/* 댓글 내용 + 답글 화살표 */}
                <div className="flex gap-2 items-start">
                  <span className="text-sky-600 flex-shrink-0">↳</span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {comment.commentText}
                  </p>
                </div>

                {/* 메타데이터 */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {/* 좋아요 */}
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span>{comment.likes}</span>
                  </div>

                  {/* 작성일 */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>작성일</span>
                    <span>/</span>
                    <span>{comment.date}</span>
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
