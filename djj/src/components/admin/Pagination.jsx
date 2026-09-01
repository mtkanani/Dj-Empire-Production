import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
      <div>
        {totalItems !== undefined ? `Showing ${totalItems} records` : `Page ${currentPage} of ${totalPages}`}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: C.panel,
            border: `1px solid ${C.border}`,
            color: currentPage <= 1 ? C.faint : C.text,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        <span style={{ padding: '6px 12px', color: C.gold, fontWeight: 700 }}>
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: C.panel,
            border: `1px solid ${C.border}`,
            color: currentPage >= totalPages ? C.faint : C.text,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
