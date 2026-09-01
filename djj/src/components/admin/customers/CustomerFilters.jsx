import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { C } from '../../../constants/theme.js';

/**
 * NOTE: The backend GET /admin/customers does NOT support server-side search or filter params.
 * All filtering is done client-side after fetching the full list.
 *
 * Props:
 *   search          string
 *   onSearch        (val: string) => void
 *   statusFilter    string ('ALL' | 'ACTIVE' | 'SUSPENDED' | etc.)
 *   onStatusChange  (val: string) => void
 *   onClear         () => void
 *   counts          { total, active, suspended, pendingEmail }
 */
export function CustomerFilters({
  search,
  onSearch,
  statusFilter,
  onStatusChange,
  onClear,
  counts = {},
}) {
  const hasFilter = search || statusFilter !== 'ALL';

  const inputStyle = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    color: C.text,
    fontSize: '13px',
    padding: '10px 14px',
    fontFamily: 'Space Grotesk, sans-serif',
    outline: 'none',
  };

  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING_EMAIL_VERIFICATION', label: 'Pending Email' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  ];

  const countChips = [
    { label: 'Total', value: counts.total, color: C.blue, bg: C.blueDim, border: C.borderBlue },
    { label: 'Active', value: counts.active, color: C.green, bg: C.greenDim, border: C.green },
    { label: 'Suspended', value: counts.suspended, color: C.red, bg: C.redDim, border: C.red },
    { label: 'Pending', value: counts.pending, color: C.amber, bg: C.amberDim, border: C.amber },
  ];

  return (
    <div>
      {/* Count chips */}
      {counts.total !== undefined && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {countChips.map(({ label, value, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '10px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                {value ?? '—'}
              </span>
              <span style={{ color: C.muted, fontSize: '12px' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter bar */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
          <Search
            size={15}
            color={C.muted}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color={C.muted} />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ ...inputStyle, minWidth: '170px', cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear button */}
        {hasFilter && (
          <button
            onClick={onClear}
            style={{
              background: C.redDim,
              border: `1px solid ${C.red}`,
              borderRadius: '10px',
              color: C.red,
              padding: '8px 14px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
