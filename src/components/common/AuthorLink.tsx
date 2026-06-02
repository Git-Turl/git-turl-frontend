import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';

// Layout 의 getMyProfile 응답으로 저장된 내 닉네임 읽기.
const getMyNickname = (): string | null => {
  return localStorage.getItem('myNickname');
};

type AuthorLinkProps = {
  /** 작성자 닉네임. community 응답의 writerName/authorName. */
  writerName?: string | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * 작성자(닉네임/아바타) 클릭 시 타인 프로필 페이지로 이동시키는 래퍼.
 *
 * - writerName 이 없거나 내 닉네임과 같으면 일반 span 으로 렌더 (클릭 비활성).
 * - 그 외엔 /profile/:nickname 로 이동하는 Link.
 *
 * 부모에 onClick 이 있는 카드 안에서 사용될 수 있으므로
 * 클릭 이벤트 전파를 막아 부모 핸들러가 실행되지 않게 한다.
 */
export function AuthorLink({
  writerName,
  className,
  style,
  children,
}: AuthorLinkProps) {
  const myNickname = getMyNickname();
  const isOther =
    !!writerName && writerName.length > 0 && writerName !== myNickname;

  if (!isOther) {
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
      to={`/profile/${encodeURIComponent(writerName)}`}
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
