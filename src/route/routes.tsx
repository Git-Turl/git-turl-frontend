import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { MyPage } from '../pages/MyPage/MyPage';
import { MyPosts } from '../pages/MyPage/MyPosts';
import { MyComments } from '../pages/MyPage/MyComments';
import { Analytics } from '../pages/Analysis/Analytics';
import { AnalyticsNew } from '../pages/Analysis/AnalyticsNew';
import { AnalyticsLoading } from '../pages/Analysis/AnalyticsLoading';
import { AnalyticsDetail } from '../pages/Analysis/AnalyticsDetail';
import { Interview } from '../pages/Interview/Interview';
import { InterviewNew } from '../pages/Interview/InterviewNew';
import { InterviewLoading } from '../pages/Interview/InterviewLoading';
import { InterviewDetail } from '../pages/Interview/InterviewDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: MyPage,
      },
      {
        path: 'community',
        Component: MyPosts,
      },
      {
        path: 'my-comments',
        Component: MyComments,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
      {
        path: 'analytics/new',
        Component: AnalyticsNew,
      },
      {
        path: 'analytics/loading',
        Component: AnalyticsLoading,
      },
      {
        path: 'analytics/detail/:id',
        Component: AnalyticsDetail,
      },
      {
        path: 'interview',
        Component: Interview,
      },
      {
        path: 'interview/new',
        Component: InterviewNew,
      },
      {
        path: 'interview/loading',
        Component: InterviewLoading,
      },
      {
        path: 'interview/detail/:id',
        Component: InterviewDetail,
      },
      {
        path: 'notifications',
        element: <div className="p-8"><h1 className="text-2xl">Notifications Page</h1></div>,
      },
    ],
  },
]);