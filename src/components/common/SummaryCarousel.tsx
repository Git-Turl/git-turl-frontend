import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Card } from '../ui/card';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { updateReportBookmark } from '../../api/member';

interface Summary {
  id: string;
  title: string;
  repository: string;
  date: string;
  description: string;
  tags: string[];
  bookmarked?: boolean;
}

interface SummaryCarouselProps {
  summaries: Summary[];
  onCardClick?: (id: string) => void;
  // 본인 소유 요약본 목록에서만 true — 타인 요약본은 북마크 불가.
  bookmarkable?: boolean;
}

export function SummaryCarousel({
  summaries,
  onCardClick,
  bookmarkable = false,
}: SummaryCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(summaries.filter((s) => s.bookmarked).map((s) => s.id))
  );
  const itemsPerPage = 2;
  const totalPages = Math.ceil(summaries.length / itemsPerPage);
  
  const currentSummaries = summaries.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleBookmarkToggle = async (
    event: MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    event.stopPropagation();
    const reportId = Number(id);
    if (!Number.isFinite(reportId)) return;

    const wasBookmarked = bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      const response = await updateReportBookmark(reportId);
      if (response.isSuccess && response.result) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (response.result!.bookmarked) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } catch (error) {
      console.error('북마크 변경 실패:', error);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-gray-900">공개 요약본</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={totalPages <= 1}
            className="p-2 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-5 h-5 text-sky-600" />
          </button>
          <button
            onClick={nextPage}
            disabled={totalPages <= 1}
            className="p-2 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-5 h-5 text-sky-600" />
          </button>
        </div>
      </div>
      
      {/* 요약 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSummaries.map((summary) => (
          <Card
            key={summary.id}
            onClick={() => onCardClick?.(summary.id)}
            className="p-5 bg-white shadow-sm border border-sky-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="space-y-3">
              {/* 제목 */}
              <div className="flex items-start justify-between">
                <h4 className="text-gray-900 line-clamp-1">{summary.title}</h4>
                {bookmarkable ? (
                  <button
                    type="button"
                    onClick={(e) => handleBookmarkToggle(e, summary.id)}
                    className="flex-shrink-0 ml-2 p-0.5 rounded hover:bg-sky-50 transition-colors"
                    aria-label={
                      bookmarkedIds.has(summary.id) ? '북마크 해제' : '북마크 추가'
                    }
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        bookmarkedIds.has(summary.id)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-sky-400'
                      }`}
                    />
                  </button>
                ) : (
                  <Star className="w-4 h-4 text-sky-400 flex-shrink-0 ml-2" />
                )}
              </div>
              
              {/* 리포지토리 */}
              <p className="text-sm text-gray-600">{summary.repository}</p>
              
              {/* 날짜 */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{summary.date}</span>
              </div>
              
              {/* 설명 */}
              <p className="text-sm text-gray-500 line-clamp-2">
                {summary.description}
              </p>
              
              {/* 태그 */}
              <div className="flex flex-wrap gap-2">
                {summary.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* 페이지네이션 점 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentPage === index
                  ? 'bg-sky-600 w-6'
                  : 'bg-sky-300 hover:bg-sky-400'
              }`}
              aria-label={`페이지 ${index + 1}으로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}