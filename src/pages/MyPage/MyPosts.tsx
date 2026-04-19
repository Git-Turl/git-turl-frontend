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
      title: 'E-Commerce Platform Architecture Analysis',
      description: 'Analysis of ecommerce-platform repository, focusing on 2-branch study covering microservices architecture, payment gateway integration, and database optimization strategies.',
      repository: 'ecommerce-platform',
      likes: 24,
      date: '2026.03.15',
      tag: 'Backend',
    },
    {
      id: '2',
      title: 'React Performance Optimization Techniques',
      description: 'Analysis of react-optimization repository studying 3-branch optimization patterns including memo usage, code splitting, and lazy loading implementations.',
      repository: 'react-optimization',
      likes: 42,
      date: '2026.03.10',
      tag: 'Frontend',
    },
    {
      id: '3',
      title: 'GraphQL API Design Best Practices',
      description: 'Analysis of graphql-api repository covering 4-branch study of schema design, resolver optimization, and N+1 query problem solutions.',
      repository: 'graphql-api',
      likes: 18,
      date: '2026.03.05',
      tag: 'Backend',
    },
    {
      id: '4',
      title: 'Kubernetes Deployment Strategies',
      description: 'Analysis of k8s-deploy repository exploring 2-branch deployment patterns including blue-green deployment, canary releases, and rolling updates.',
      repository: 'k8s-deploy',
      likes: 31,
      date: '2026.03.01',
      tag: 'DevOps',
    },
    {
      id: '5',
      title: 'Machine Learning Model Training Pipeline',
      description: 'Analysis of ml-pipeline repository studying 3-branch training workflows with data preprocessing, model evaluation, and hyperparameter tuning.',
      repository: 'ml-pipeline',
      likes: 56,
      date: '2026.02.28',
      tag: 'ML/AI',
    },
    {
      id: '6',
      title: 'Real-time Chat Application with WebSocket',
      description: 'Analysis of chat-app repository covering 2-branch study of WebSocket implementation, message queue handling, and scalability patterns.',
      repository: 'chat-app',
      likes: 28,
      date: '2026.02.25',
      tag: 'Backend',
    },
    {
      id: '7',
      title: 'Responsive UI Component Library',
      description: 'Analysis of ui-components repository exploring 5-branch component architecture with accessibility features, theming system, and documentation.',
      repository: 'ui-components',
      likes: 45,
      date: '2026.02.20',
      tag: 'Frontend',
    },
    {
      id: '8',
      title: 'Database Indexing and Query Optimization',
      description: 'Analysis of db-optimization repository covering 3-branch study of index strategies, query performance tuning, and database normalization.',
      repository: 'db-optimization',
      likes: 22,
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
