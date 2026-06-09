import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from '../components/layout/Layout';

// 인증 및 온보딩
import { Onboarding } from '../pages/Onboarding/Onboarding';
import { Login } from '../pages/Auth/Login';
import { Loading } from '../pages/Auth/Loading';
import { SignUp } from '../pages/SignUp/SignUp';

// 메인 페이지
import { Home } from '../pages/Home/Home';
import { MyPage } from '../pages/MyPage/MyPage';
import { MyPosts } from '../pages/MyPage/MyPosts';
import { MyComments } from '../pages/MyPage/MyComments';
import { OtherProfile } from '../pages/Profile/OtherProfile';
import { OtherPosts } from '../pages/Profile/OtherPosts';
import { OtherComments } from '../pages/Profile/OtherComments';

// 커뮤니티
import { CommunityList } from '../pages/Community/CommunityList';
import { CommunityDetail } from '../pages/Community/CommunityDetail';
import { CommunityWrite } from '../pages/Community/CommunityWrite';

// 분석
import { Analytics } from '../pages/Analysis/Analytics';
import { AnalyticsNew } from '../pages/Analysis/AnalyticsNew';
import { AnalyticsLoading } from '../pages/Analysis/AnalyticsLoading';
import { AnalyticsDetail } from '../pages/Analysis/AnalyticsDetail';

// 인터뷰
import { Interview } from '../pages/Interview/Interview';
import { InterviewNew } from '../pages/Interview/InterviewNew';
import { InterviewLoading } from '../pages/Interview/InterviewLoading';
import { InterviewDetail } from '../pages/Interview/InterviewDetail';

// 음성면접
import { VoiceInterview } from '../pages/VoiceInterview/VoiceInterview';
import { VoiceInterviewNew } from '../pages/VoiceInterview/VoiceInterviewNew';
import { VoiceInterviewLoading } from '../pages/VoiceInterview/VoiceInterviewLoading';
import { VoiceInterviewDetail } from '../pages/VoiceInterview/VoiceInterviewDetail';
import { VoiceInterviewFeedbackLoading } from '../pages/VoiceInterview/VoiceInterviewFeedbackLoading';
import { VoiceInterviewFeedback } from '../pages/VoiceInterview/VoiceInterviewFeedback';

export const router = createBrowserRouter([
  // 루트에서 온보딩으로 리다이렉트
  {
    path: '/',
    element: <Navigate to="/onboarding" replace />,
  },

  // 인증 및 온보딩 라우트 (레이아웃 없음)
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/login/loading',
    Component: Loading,
  },
  {
    path: '/signup',
    Component: SignUp,
  },

  // 메인 앱 라우트 (레이아웃 포함)
  {
    path: '/',
    Component: Layout,
    children: [
      // 홈
      {
        path: 'home',
        Component: Home,
      },

      // 마이페이지
      {
        path: 'mypage',
        Component: MyPage,
      },
      {
        path: 'my-posts',
        Component: MyPosts,
      },
      {
        path: 'my-comments',
        Component: MyComments,
      },

      // 타인 프로필 (memberId 기반)
      {
        path: 'profile/:memberId',
        Component: OtherProfile,
      },
      {
        path: 'profile/:memberId/posts',
        Component: OtherPosts,
      },
      {
        path: 'profile/:memberId/comments',
        Component: OtherComments,
      },

      // 커뮤니티
      {
        path: 'community',
        Component: CommunityList,
      },
      {
        path: 'community/write',
        Component: CommunityWrite,
      },
      {
        path: 'community/:id',
        Component: CommunityDetail,
      },

      // 분석 라우트
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

      // 인터뷰 라우트
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

      // 음성면접 라우트
      {
        path: 'voice-interview',
        Component: VoiceInterview,
      },
      {
        path: 'voice-interview/new',
        Component: VoiceInterviewNew,
      },
      {
        path: 'voice-interview/loading',
        Component: VoiceInterviewLoading,
      },
      {
        path: 'voice-interview/detail/:id',
        Component: VoiceInterviewDetail,
      },
      {
        path: 'voice-interview/feedback-loading',
        Component: VoiceInterviewFeedbackLoading,
      },
      {
        path: 'voice-interview/feedback/:id',
        Component: VoiceInterviewFeedback,
      },
    ],
  },
]);