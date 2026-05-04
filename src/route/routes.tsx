import { createBrowserRouter, Navigate } from 'react-router';
import { Onboarding } from '../pages/Onboarding/Onboarding';
import { Login } from '../pages/Auth/Login';
import { Loading } from '../pages/Auth/Loading';
import { SignUp } from '../pages/SignUp/SignUp';
import { Home } from '../pages/Home/Home';
import { Layout } from '../components/layout/Layout';

export const router = createBrowserRouter([
  //  접속 시 /onboarding으로 자동 이동
  {
    path: '/',
    element: <Navigate to="/onboarding" replace />,
  },
  // 랜딩 페이지
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  // 로그인
  {
    path: '/login',
    Component: Login,
  },
  // OAuth 콜백 (토큰 받는 곳)
  {
    path: '/login/loading',
    Component: Loading,
  },
  // 프로필 설정
  {
    path: '/signup',
    Component: SignUp,
  },
  // 인증 후 페이지: AppSidebar 포함된 Layout 사용
  {
    Component: Layout,
    children: [
      { path: '/home', Component: Home },
    ],
  },
]);
