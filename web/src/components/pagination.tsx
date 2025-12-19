import "./pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number; // optional, limit number of buttons shown
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const half = Math.floor(maxVisiblePages / 2);

  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, page + half);

  // adjust range if we're at the start or end
  if (end - start + 1 < maxVisiblePages) {
    if (start === 1) {
      end = Math.min(totalPages, start + maxVisiblePages - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
  }

  // generate ellipsis
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="pagination-wrapper">
      {/* Previous arrow, only show if not first page */}
      {page > 1 && (
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page - 1)}
        >
          ←
        </button>
      )}

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={idx}
            className={`pagination-btn ${p === page ? "active" : ""}`}
            onClick={() => onPageChange(p as number)}
          >
            {p}
          </button>
        )
      )}

      {/* Next arrow, only show if not last page */}
      {page < totalPages && (
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
        >
          →
        </button>
      )}
    </div>
  );
}
