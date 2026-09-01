import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { C } from '../../../constants/theme.js';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'PENDING_EMAIL_VERIFICATION', label: 'Pending Email' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

/**
 * Props:
 *   search        string
 *   onSearch      (value: string) => void
 *   statusFilter  string
 *   onStatusChange (value: string) => void
 *   onClear       () => void
 *   counts        { total, pendingApproval, active, suspended }
 */
export function OrganizerFilters({
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
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      {/* Aggregate count chips */}
      {counts.total !== undefined && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { label: 'Total', value: counts.total, color: C.blue, bg: C.blueDim, border: C.borderBlue, status: 'ALL' },
            { label: 'Pending', value: counts.pendingApproval, color: C.amber, bg: C.amberDim, border: C.amber, status: 'PENDING_APPROVAL' },
            { label: 'Active', value: counts.active, color: C.green, bg: C.greenDim, border: C.green, status: 'ACTIVE' },
            { label: 'Suspended', value: counts.suspended, color: C.red, bg: C.redDim, border: C.red, status: 'SUSPENDED' },
          ].map(({ label, value, color, bg, border, status }) => (
            <button
              key={label}
              type="button"
              onClick={() => onStatusChange?.(status)}
              style={{
                background: bg,
                border: `1px solid ${statusFilter === status ? color : border}`,
                borderRadius: '10px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span style={{ color, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                {value ?? '—'}
              </span>
              <span style={{ color: C.muted, fontSize: '12px' }}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter bar */}
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
            placeholder="Search by company, email, or phone..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: '38px' }}
          />
        </div>

        {/* Status filter */}
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
            type="button"
            onClick={onClear}
            title="Clear Filters"
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
