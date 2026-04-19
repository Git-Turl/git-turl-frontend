import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    nickname: string;
    profileImage: string;
    techStack: string;
    preferredStacks: string[];
    notificationsEnabled: boolean;
    commentNotificationsEnabled: boolean;
  };
  onSave: (data: {
    nickname: string;
    profileImage: string;
    techStack: string;
    preferredStacks: string[];
    notificationsEnabled: boolean;
    commentNotificationsEnabled: boolean;
  }) => void;
}

type TabType = 'profile' | 'notification';

export function SettingsModal({ isOpen, onClose, currentProfile, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [nickname, setNickname] = useState(currentProfile.nickname);
  const [profileImage, setProfileImage] = useState(currentProfile.profileImage);
  const [techStack, setTechStack] = useState(currentProfile.techStack);
  const [preferredStacks, setPreferredStacks] = useState<string[]>(currentProfile.preferredStacks || []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(currentProfile.notificationsEnabled);
  const [commentNotificationsEnabled, setCommentNotificationsEnabled] = useState(currentProfile.commentNotificationsEnabled);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const stackCategories = {
    '백엔드': ['PHP', 'Node.js', 'Nest.js', 'SpringBoot', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'ASP.NET', 'Go', 'Rust'],
    '프론트엔드': ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'Next.js', 'Svelte', 'jQuery', 'HTML/CSS', 'Tailwind CSS'],
    '모바일': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin'],
    '데이터베이스': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite'],
    'DevOps/인프라': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'GitHub Actions'],
    '기타': ['Git', 'RESTful API', 'GraphQL', 'WebSocket', 'Microservices'],
  };

  if (!isOpen) return null;

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setNickname(value);
      setNicknameChecked(false);
    }
  };

  const handleCheckNickname = () => {
    // Mock duplicate check - 실제 앱에서는 API 호출이어야 함
    setNicknameChecked(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePreferredStack = (stack: string) => {
    setPreferredStacks((prev) =>
      prev.includes(stack)
        ? prev.filter((s) => s !== stack)
        : [...prev, stack]
    );
  };

  const isProfileValid = nickname.trim().length > 0 && nicknameChecked && techStack;

  const handleSave = () => {
    if (isProfileValid) {
      onSave({
        nickname,
        profileImage,
        techStack,
        preferredStacks,
        notificationsEnabled,
        commentNotificationsEnabled,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-3xl shadow-2xl flex overflow-hidden" style={{ width: '1100px', maxHeight: '90vh' }}>
        {/* 왼쪽 사이드바 */}
        <div className="w-56 bg-white p-8 flex flex-col">
          <h2 className="text-3xl mb-10 text-gray-900">설정</h2>
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-sky-100 text-sky-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              프로필 설정
            </button>
            <button
              onClick={() => setActiveTab('notification')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'notification'
                  ? 'bg-sky-100 text-sky-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              알림 설정
            </button>
          </nav>
        </div>

        {/* 구분선 */}
        <div className="w-px bg-gray-200 my-8" />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-10 relative">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {/* 프로필 설정 탭 */}
          {activeTab === 'profile' && (
            <div className="flex flex-col" style={{ height: 'calc(90vh - 80px)' }}>
              <h3 className="text-2xl text-gray-900 mb-6">프로필 설정</h3>

              <div className="space-y-6 overflow-y-auto flex-1 pr-2">

              {/* 프로필 이미지 업로드 */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-sky-100">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 닉네임 입력 */}
              <div>
                <label className="block mb-2 text-gray-700">
                  닉네임 <span className="text-xs text-gray-500">(최대 10글자)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    placeholder="닉네임을 입력해주세요"
                    maxLength={10}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCheckNickname}
                    disabled={!nickname.trim()}
                    className={`px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                      nickname.trim()
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    중복확인
                  </button>
                </div>
                {nicknameChecked && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ 사용 가능한 닉네임입니다.
                  </p>
                )}
              </div>

              {/* 희망분야 선택 */}
              <div>
                <label className="block mb-2 text-gray-700">희망분야</label>
                <div className="flex gap-3">
                  {['frontend', 'backend', 'AI'].map((stack) => (
                    <button
                      key={stack}
                      onClick={() => setTechStack(stack)}
                      className={`flex-1 py-2.5 rounded-lg transition-colors font-medium ${
                        techStack === stack
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {stack === 'frontend'
                        ? '프론트엔드'
                        : stack === 'backend'
                        ? '백엔드'
                        : 'AI'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 선호 스택 */}
              <div>
                <label className="block mb-3 text-gray-700">선호 스택</label>
                <div className="space-y-4">
                  {Object.entries(stackCategories).map(([category, stacks]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {stacks.map((stack) => (
                          <button
                            key={stack}
                            onClick={() => togglePreferredStack(stack)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              preferredStacks.includes(stack)
                                ? 'bg-sky-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {stack}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>

              {/* 액션 버튼 - 하단 고정 */}
              <div className="pt-6 border-t border-gray-200 mt-4 flex justify-between">
                <button
                  onClick={() => {
                    if (confirm('정말로 회원 탈퇴하시겠습니까?')) {
                      console.log('Account deletion requested');
                    }
                  }}
                  className="w-32 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  회원탈퇴
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isProfileValid}
                  className={`w-32 py-2.5 rounded-lg transition-colors ${
                    isProfileValid
                      ? 'bg-sky-500 hover:bg-sky-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* 알림 설정 탭 */}
          {activeTab === 'notification' && (
            <div className="flex flex-col" style={{ height: 'calc(90vh - 80px)' }}>
              <h3 className="text-2xl text-gray-900 mb-6">알림 설정</h3>

              <div className="space-y-6">

              {/* 댓글 알림 */}
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">댓글 알림</h4>
                  <p className="text-sm text-gray-600">
                    내 게시글에 댓글이 달릴 때 알림을 받습니다
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCommentNotificationsEnabled(!commentNotificationsEnabled)
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                    commentNotificationsEnabled ? 'bg-sky-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      commentNotificationsEnabled
                        ? 'translate-x-8'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
