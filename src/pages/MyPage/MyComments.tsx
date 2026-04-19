import { Link } from 'react-router';
import { ChevronRight, Heart, Calendar, MessageSquare } from 'lucide-react';
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
      postTitle: 'React Hooks Deep Dive Study',
      postDescription: 'Looking for 2-3 developers to study React Hooks patterns together...',
      commentText: '저도 참여하고 싶습니다! 주말에 시간 괜찮으시면 좋겠어요.',
      category: '스터디',
      likes: 12,
      date: '2026.03.15',
    },
    {
      id: '2',
      postTitle: 'TypeScript Best Practices Analysis',
      postDescription: 'Analysis of typescript-patterns repository covering 3-branch study...',
      commentText: '저 관심있어요. 특히 Generic 부분 더 자세히 공부하고 싶습니다.',
      category: '스터디',
      likes: 8,
      date: '2026.03.14',
    },
    {
      id: '3',
      postTitle: 'Backend Architecture Study Group',
      postDescription: 'Studying microservices architecture with Node.js and Docker...',
      commentText: '이 부분 정말 유용한 정보네요! 제 프로젝트에도 적용해보겠습니다.',
      category: '스터디',
      likes: 15,
      date: '2026.03.12',
    },
    {
      id: '4',
      postTitle: 'Algorithm Problem Solving Group',
      postDescription: 'Daily algorithm practice with LeetCode and Programmers...',
      commentText: '매일 한 문제씩 풀고 있는데, 같이 하면 더 동기부여 될 것 같아요!',
      category: '스터디',
      likes: 20,
      date: '2026.03.10',
    },
    {
      id: '5',
      postTitle: 'GraphQL and Apollo Client Study',
      postDescription: 'Learning GraphQL fundamentals and Apollo Client integration...',
      commentText: '저도 GraphQL 공부 중인데 같이 스터디하면 좋을 것 같습니다.',
      category: '스터디',
      likes: 10,
      date: '2026.03.08',
    },
    {
      id: '6',
      postTitle: 'AWS Cloud Services Deep Dive',
      postDescription: 'Exploring AWS services including EC2, S3, Lambda, and RDS...',
      commentText: '실무에서 바로 사용할 수 있는 내용이라 정말 도움됩니다!',
      category: '스터디',
      likes: 18,
      date: '2026.03.05',
    },
    {
      id: '7',
      postTitle: 'UI/UX Design Patterns Study',
      postDescription: 'Studying modern design patterns and user experience principles...',
      commentText: '디자인 시스템 구축 부분 공유해주셔서 감사합니다.',
      category: '스터디',
      likes: 14,
      date: '2026.03.03',
    },
    {
      id: '8',
      postTitle: 'Database Optimization Techniques',
      postDescription: 'Learning about indexing, query optimization, and performance tuning...',
      commentText: '인덱스 설계 방법이 정말 인상 깊었어요. 제 DB에도 적용해봐야겠습니다.',
      category: '스터디',
      likes: 22,
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
