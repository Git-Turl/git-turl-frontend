/**
 * JWT 토큰을 디코딩해서 payload 반환
 * 실패하면 null 반환
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
};

/**
 * localStorage에서 토큰 가져와서 payload 반환
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return decodeToken(token);
};