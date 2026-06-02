import { Outlet } from 'react-router';
import { useEffect, useState } from 'react';
import { AppSidebar } from '../common/AppSidebar';
import { getMyProfile, getProfileImage } from '../../api/member';
import { NotificationDrawer } from '../../pages/Notification/NotificationPage';
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
    const fetchUserProfile = async () => {
      try {
        // 프로필 정보 조회
        const profileResponse = await getMyProfile();
        const profileData = profileResponse.result;

        // 내 닉네임 저장 — 작성자 본인 여부 판별에 사용.
        // (백엔드가 id 응답에 안 내려줘서 닉네임으로 비교)
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
