import { Outlet } from 'react-router';
import { useEffect, useState } from 'react';
import { AppSidebar } from '../common/AppSidebar';
import { getMyProfile, getProfileImage } from '../../api/member';
import { NotificationDrawer } from '../../pages/Notification/NotificationPage';
import { getCurrentUser } from '../../utils/token';
import defaultProfile from '../../assets/img/img_profile.svg';

export function Layout() {
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: '로딩 중...',
    email: '',
    avatar: defaultProfile,
  });

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    // 내 memberId 저장 — JWT 토큰 sub 클레임에 들어있음 (백엔드가 프로필 응답에 id 안 줘도 사용 가능).
    // 작성자 본인 여부 판별(글/댓글 메뉴 표시)에 사용.
    const jwtPayload = getCurrentUser();
    const sub = jwtPayload?.sub;
    if (sub != null) {
      // sub 가 문자열 "6" 형태일 수도, 숫자일 수도 있어 그대로 문자열화해서 저장.
      localStorage.setItem('myMemberId', String(sub));
    }

    const fetchUserProfile = async () => {
      try {
        // 프로필 정보 조회
        const profileResponse = await getMyProfile();
        const profileData = profileResponse.result;

        // 백엔드 응답에 id 가 있으면 JWT 값 덮어쓰기 (드물지만 더 신뢰).
        const myId = profileData?.id ?? profileData?.memberId;
        if (myId != null) {
          localStorage.setItem('myMemberId', String(myId));
        }
        // 닉네임도 같이 저장 (헤더/사이드바 표시용)
        if (profileData?.nickname) {
          localStorage.setItem('myNickname', profileData.nickname);
        }

        // 프로필 이미지 조회
        let imageUrl = defaultProfile;
        try {
          const imageResponse = await getProfileImage();
          if (imageResponse.result?.profileImage) {
            imageUrl = imageResponse.result.profileImage;
          }
        } catch (imageError) {
          console.log('프로필 이미지가 없습니다. 기본 이미지를 사용합니다.');
        }

        setUserProfile({
          name: profileData?.nickname || '사용자',
          email: profileData?.githubId || '',
          avatar: imageUrl,
        });
      } catch (error) {
        console.error('프로필 정보를 불러오는데 실패했습니다:', error);
        setUserProfile({
          name: '사용자',
          email: '',
          avatar: defaultProfile,
        });
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { name, avatar } = (e as CustomEvent<{ name?: string; avatar?: string }>).detail;
      setUserProfile((prev) => ({
        ...prev,
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
      }));
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  return (
    <div className="min-h-screen bg-sky-50">
      <AppSidebar
        userProfile={userProfile}
        isNotificationOpen={isNotifOpen}
        onNotificationClick={() => setIsNotifOpen((v) => !v)}
      />
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
}
