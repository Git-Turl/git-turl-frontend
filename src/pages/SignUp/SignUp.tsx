import { useState, useRef } from 'react';
import { CircleCheck, CircleX, User, Camera } from 'lucide-react';
import { StackSelectModal } from '../StackSelectModal.tsx';
import {
  submitOnboarding,
  checkNickname,
  updateProfileImage,
} from '../../api/member';
import { fieldToJobType, stacksToEnumList } from '../../utils/stackMapping';

export function SignUp() {
  const [nickname, setNickname] = useState('');
  const [nicknameCheck, setNicknameCheck] = useState<null | boolean>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // 업로드할 실제 파일 (미리보기용 objectURL 과 별개).
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDuplicateCheck = async () => {
    if (!nickname.trim() || nickname.length > 20) {
      setNicknameCheck(false);
      return;
    }
    if (isCheckingNickname) return;

    setIsCheckingNickname(true);
    try {
      const res = await checkNickname({ nickname: nickname.trim() });
      // ⚠️ 백엔드가 중복이어도 isSuccess:true 를 주고 code 로 구분함.
      //   MEMBER200_8 = "사용 할 수 없는 닉네임입니다" (중복/사용불가) → X
      //   그 외 성공 코드 → 사용 가능 → 체크
      const available = res.isSuccess && res.code !== 'MEMBER200_8';
      setNicknameCheck(available);
    } catch {
      setNicknameCheck(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드 가능합니다.');
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    setProfileFile(file);
  };

  // 저장하기 핸들러
  const handleSaveProfile = async () => {
    // 유효성 검사
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (nickname.length > 20) {
      alert('닉네임은 20자 이하여야 합니다.');
      return;
    }
    if (nicknameCheck !== true) {
      alert('닉네임 중복확인을 해주세요.');
      return;
    }
    if (!selectedField) {
      alert('희망분야를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    const jobType = fieldToJobType(selectedField);
    if (!jobType) {
      alert('희망분야 값이 올바르지 않습니다.');
      setIsSubmitting(false);
      return;
    }
    const techStackList = stacksToEnumList(selectedStacks);

    try {
      const response = await submitOnboarding({
        nickname,
        jobType,
        techStackList,
      });
      if (response.isSuccess) {
        // 온보딩 성공 후 선택한 프로필 사진 업로드 (별도 multipart API).
        if (profileFile) {
          try {
            const imgRes = await updateProfileImage(profileFile);
            if (!imgRes.isSuccess) {
              alert(imgRes.message || '프로필 사진 저장에 실패했습니다.');
            }
          } catch {
            alert('프로필 사진 저장 중 오류가 발생했습니다.');
          }
        }
        window.location.href = '/home';
      } else {
        alert(response.message || '저장에 실패했습니다.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || '저장 중 오류가 발생했습니다.';
      alert(errorMessage);
      console.error('프로필 저장 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달에서 스택 저장 시 호출될 콜백
  const handleStacksChange = (stacks: string[]) => {
    setSelectedStacks(stacks);
  };

  const fields = ['프론트', '백엔드', '기타'];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#F0F9FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        padding: '40px 0',
      }}
    >
      <div style={{ width: 1000, position: 'relative' }}>
        <div
          style={{
            textAlign: 'center',
            color: '#0E2248',
            fontSize: 35,
            fontFamily: 'Inter',
            fontWeight: 450,
            marginBottom: 30,
          }}
        >
          프로필 정보 설정
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 20,
            border: '1px solid #B8E6FE',
            padding: '50px 0',
          }}
        >
          {/* 프로필 이미지 */}
          <div
            style={{
              width: 200,
              height: 200,
              margin: '0 auto 40px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                background: '#F0F9FF',
                borderRadius: '50%',
                border: '1px solid #B8E6FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User
                  color="#00AEEF"
                  size={90}
                  strokeWidth={2}
                  fill="#00AEEF"
                />
              )}
            </div>

            <div
              onClick={handleCameraClick}
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 50,
                height: 50,
                background: '#00AEEF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid white',
              }}
            >
              <Camera color="white" size={24} />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* 닉네임 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 120,
                textAlign: 'right',
                fontSize: 27,
                fontFamily: 'Inter',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              닉네임
            </div>
            <div style={{ position: 'relative', width: 430 }}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value.slice(0, 20));
                  setNicknameCheck(null);
                }}
                placeholder="입력해주세요"
                maxLength={20}
                style={{
                  width: '100%',
                  height: 65,
                  padding: '0 120px 0 30px',
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid #B8E6FE',
                  fontSize: 23,
                  fontFamily: 'Inter',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleDuplicateCheck}
                disabled={isCheckingNickname}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 100,
                  height: 50,
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid #B8E6FE',
                  color: '#00AEEF',
                  fontSize: 17,
                  fontFamily: 'Inter',
                  cursor: isCheckingNickname ? 'not-allowed' : 'pointer',
                }}
              >
                {isCheckingNickname ? '확인 중' : '중복확인'}
              </button>
            </div>
            <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
              {nicknameCheck === true && (
                <CircleCheck color="white" fill="#5BCFA6" size={32} />
              )}
              {nicknameCheck === false && (
                <CircleX color="white" fill="#FF5353" size={32} />
              )}
            </div>
          </div>

          {/* 희망분야 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 120,
                textAlign: 'right',
                fontSize: 27,
                fontFamily: 'Inter',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              희망분야
            </div>
            <div style={{ display: 'flex', gap: 10, width: 470 }}>
              {fields.map((field) => {
                const isSelected = selectedField === field;
                return (
                  <button
                    key={field}
                    onClick={() => setSelectedField(field)}
                    style={{
                      width: 140,
                      height: 60,
                      background: isSelected ? '#F0F9FF' : 'white',
                      borderRadius: 20,
                      border: isSelected
                        ? '2px solid #00AEEF'
                        : '1px solid #B8E6FE',
                      color: isSelected ? '#00AEEF' : '#828282',
                      fontSize: 24,
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      letterSpacing: 3,
                      cursor: 'pointer',
                    }}
                  >
                    {field}
                  </button>
                );
              })}
            </div>
            <div style={{ width: 40 }} />
          </div>

          {/* 기술스택 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 265,
                textAlign: 'right',
                fontSize: 27,
                fontFamily: 'Inter',
                fontWeight: 500,
              }}
            >
              기술스택 / 선호기술
            </div>
            <div style={{ width: 430 }}>
              <button
                onClick={() => setIsStackModalOpen(true)}
                style={{
                  width: 310,
                  height: 65,
                  background: '#EDEDED',
                  borderRadius: 9,
                  border: '1px solid #A6A6A6',
                  color: '#5B5B5B',
                  fontSize: 23,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  letterSpacing: 8,
                  cursor: 'pointer',
                }}
              >
                {selectedStacks.length > 0
                  ? `${selectedStacks.length}개 선택됨`
                  : '선택하기'}
              </button>
            </div>
            <div style={{ width: 40 }} />
          </div>

          {/* 저장하기 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              style={{
                width: 260,
                height: 60,
                background: isSubmitting ? '#B8E6FE' : '#00AEEF',
                borderRadius: 100,
                border: 'none',
                color: 'white',
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: 600,
                letterSpacing: 5,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>

      <StackSelectModal
        isOpen={isStackModalOpen}
        onClose={() => setIsStackModalOpen(false)}
        onSave={handleStacksChange}
      />
    </div>
  );
}