import { useState } from 'react';
import { Pencil, FileText, MessageCircle } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { SettingsModal } from './SettingsModal';
import { updateProfile } from '../../api/member';
import { fieldToJobType, stacksToEnumList } from '../../utils/stackMapping';

interface ProfileCardProps {
  profileImage: string;
  nickname: string;
  githubId: string;
  techStack: string;
  preferredStacks?: string[];
}

export function ProfileCard({
  profileImage,
  nickname,
  githubId,
  techStack,
  preferredStacks = [],
}: ProfileCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname,
    profileImage,
    techStack,
    preferredStacks,
    notificationsEnabled: true,
    commentNotificationsEnabled: true,
  });

  const handleSaveSettings = async (data: typeof profileData) => {
    try {
      const jobType = fieldToJobType(data.techStack);
      if (!jobType) {
        alert('희망분야 값이 올바르지 않습니다.');
        return;
      }

      const newTechStackList = stacksToEnumList(data.preferredStacks);
      const prevTechStackList = stacksToEnumList(profileData.preferredStacks);
      const stacksChanged =
        JSON.stringify([...newTechStackList].sort()) !==
        JSON.stringify([...prevTechStackList].sort());

      const response = await updateProfile({
        nickname: data.nickname !== profileData.nickname ? data.nickname : null,
        jobType: data.techStack !== profileData.techStack ? jobType : null,
        techStackList: stacksChanged ? newTechStackList : null,
      });

      if (response.isSuccess) {
        setProfileData(data);
        localStorage.setItem('myNickname', data.nickname);
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: { name: data.nickname } }));
        alert('프로필이 성공적으로 수정되었습니다.');
      } else {
        alert(response.message || '프로필 수정에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '프로필 수정 중 오류가 발생했습니다.';
      alert(errorMessage);
      console.error('프로필 수정 실패:', error);
    }
  };

  const handleImageUpdate = (imageUrl: string) => {
    setProfileData((prev) => ({ ...prev, profileImage: imageUrl }));
  };

  return (
    <div className="space-y-4">
      {/* 프로필 정보 카드 */}
      <Card className="p-6 bg-white shadow-sm border border-sky-100">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4 text-sky-500" />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          {/* 프로필 이미지 */}
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-sky-100">
            <img
              src={profileData.profileImage}
              alt={profileData.nickname}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 닉네임 */}
          <h2 className="text-xl mb-1">{profileData.nickname}</h2>

          {/* GitHub ID */}
          <p className="text-sm text-gray-500 mb-3">@{githubId}</p>

          {/* Tech Stack 배지 */}
          <Badge
            variant="secondary"
            className="bg-sky-100 text-sky-700 hover:bg-sky-100"
          >
            {profileData.techStack === 'frontend'
              ? '프론트엔드'
              : profileData.techStack === 'backend'
              ? '백엔드'
              : 'AI'}
          </Badge>
        </div>
      </Card>
      
      {/* 네비게이션 링크 */}
      <Card className="p-4 bg-white shadow-sm border border-sky-100">
        <nav className="space-y-2">
          <Link
            to="/my-posts"
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-sky-600" />
            <span className="text-gray-700">My Posts</span>
          </Link>
          
          <Link
            to="/my-comments"
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
          >
            <MessageCircle className="w-5 h-5 text-sky-600" />
            <span className="text-gray-700">My Comments</span>
          </Link>
        </nav>
      </Card>

      {/* 설정 모달 — 열릴 때마다 새로 마운트해 최신 profileData로 초기화 */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentProfile={profileData}
          onSave={handleSaveSettings}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </div>
  );
}