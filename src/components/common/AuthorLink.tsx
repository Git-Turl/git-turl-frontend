import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';

// Layout 의 getMyProfile 응답으로 저장된 내 memberId 읽기.
const getMyMemberId = (): number | null => {
  const v = localStorage.getItem('myMemberId');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

type AuthorLinkProps = {
  /** 작성자 memberId. community 응답의 writerId/authorId. */
  writerId?: number | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * 작성자(닉네임/아바타) 클릭 시 프로필 페이지로 이동시키는 래퍼.
 *
 * - writerId 가 있으면 /profile/:writerId 로 이동 (본인이든 타인이든 동일).
 *   본인 클릭 시 OtherProfile 이 자기 데이터로 표시.
 * - writerId 없으면 일반 span (클릭 비활성). 백엔드 응답에 writerId 필드 추가 필요.
 *
 * 부모 onClick 이 있는 카드 안에서 사용되므로 클릭 이벤트 전파를 막는다.
 */
export function AuthorLink({
  writerId,
  className,
  style,
  children,
}: AuthorLinkProps) {
  if (writerId == null) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  const stop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  return (
    <Link
      to={`/profile/${writerId}`}
      onClick={stop}
      className={className}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

// 외부 (예: 자기 자신 판별 로직) 에서도 쓰도록 export
export { getMyMemberId };
