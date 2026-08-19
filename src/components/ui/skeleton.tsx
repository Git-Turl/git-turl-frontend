import { cn } from './utils';

/**
 * 콘텐츠 로딩 시 표시되는 스켈레톤 플레이스홀더.
 * `className` 으로 크기/모양(width, height, rounded 등)을 지정해서 사용한다.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };
