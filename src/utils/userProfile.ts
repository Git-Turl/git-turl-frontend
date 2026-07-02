import { getMyProfile, getProfileImage } from '../api/member';

export type StoredUserInfo = {
  name: string;
  nickname: string;
  email: string;
  githubId: string;
  avatar: string;
  profileImage: string;
};

export type FetchProfileResult =
  | { ok: true; userInfo: StoredUserInfo }
  | { ok: false; needsOnboarding: boolean; reason: string };

function extractProfile(raw: unknown): Record<string, any> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, any>;
  if ('result' in obj && obj.result && typeof obj.result === 'object') {
    return obj.result as Record<string, any>;
  }
  if ('data' in obj && obj.data && typeof obj.data === 'object') {
    return obj.data as Record<string, any>;
  }
  return obj;
}

function pick(obj: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return '';
}

/**
 * 백엔드에서 프로필을 받아와서 표준 형식으로 변환 + localStorage 저장.
 * 프로필이 비어있거나 404면 needsOnboarding: true 반환.
 */
export async function fetchAndStoreUserInfo(): Promise<FetchProfileResult> {
  let profile: Record<string, any> | null = null;

  try {
    const res = await getMyProfile();
    profile = extractProfile(res);
  } catch (err: any) {
    const status = err?.response?.status;
    console.error('프로필 조회 실패:', status, err?.message);
    if (status === 404) {
      return { ok: false, needsOnboarding: true, reason: 'profile-not-found' };
    }
    return { ok: false, needsOnboarding: false, reason: `error-${status ?? 'unknown'}` };
  }

  if (!profile) {
    return { ok: false, needsOnboarding: true, reason: 'empty-profile' };
  }

  const name = pick(profile, ['name', 'nickname', 'username']);
  // 닉네임이 없으면 온보딩 미완료로 간주
  if (!name) {
    return { ok: false, needsOnboarding: true, reason: 'no-nickname' };
  }

  // 프로필 사진 별도 조회 (실패해도 무시)
  let profileImageUrl = '';
  try {
    const imgRes = await getProfileImage();
    const imgPayload = extractProfile(imgRes);
    if (imgPayload) {
      profileImageUrl = pick(imgPayload, [
        'profileImage',
        'profileImageUrl',
        'imageUrl',
        'avatar',
        'url',
      ]);
    }
  } catch {
    // 프로필 사진 조회 실패는 무시 — name/email은 이미 받았음
  }

  const email = pick(profile, ['githubId']); 
  const githubId = pick(profile, [
    'githubId',
    'github_id',
    'githubLogin',
    'githubLoginId',
    'login',
  ]);
  const avatar =
    profileImageUrl ||
    pick(profile, [
      'profileImage',
      'profileImageUrl',
      'avatar',
      'avatarUrl',
      'imageUrl',
    ]);

  const userInfo: StoredUserInfo = {
    name,
    nickname: name,
    email,
    githubId,
    avatar,
    profileImage: avatar,
  };

  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  return { ok: true, userInfo };
}

export function readUserInfo(): StoredUserInfo | null {
  const saved = localStorage.getItem('userInfo');
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as Partial<StoredUserInfo>;
    if (!parsed?.name && !parsed?.nickname && !parsed?.githubId) return null;
    return {
      name: parsed.name || parsed.nickname || '',
      nickname: parsed.nickname || parsed.name || '',
      email: parsed.email || '',
      githubId: parsed.githubId || '',
      avatar: parsed.avatar || parsed.profileImage || '',
      profileImage: parsed.profileImage || parsed.avatar || '',
    };
  } catch {
    return null;
  }
}
