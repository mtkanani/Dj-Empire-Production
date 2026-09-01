import React from 'react';
import { C } from '../../constants/theme.js';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'No records found',
  error = null,
}) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        background: C.panel,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Space Grotesk, sans-serif' }}>
        <thead>
          <tr style={{ background: 'rgba(255, 215, 0, 0.06)', borderBottom: `1px solid ${C.borderGold}` }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '14px 18px',
                  color: C.gold,
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '30px', textAlign: 'center', color: C.muted }}>
                Loading records...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '30px', textAlign: 'center', color: C.red }}>
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '30px', textAlign: 'center', color: C.muted }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  borderBottom: rowIdx === data.length - 1 ? 'none' : `1px solid ${C.border}`,
                  transition: 'background 0.2s',
                }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: '14px 18px', fontSize: '13px', color: C.text }}>
                    {col.render ? col.render(row) : row[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
