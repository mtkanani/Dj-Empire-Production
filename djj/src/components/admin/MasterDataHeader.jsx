import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, RefreshCw, Plus } from 'lucide-react';
import { C } from '../../constants/theme.js';

/**
 * MasterDataHeader — shared page header for all master-data list pages.
 *
 * Props:
 *   icon         ReactNode
 *   title        string
 *   subtitle     string
 *   onAdd        () => void
 *   addLabel     string
 *   onRefresh    () => void
 *   refreshing   boolean
 *
 *   search         string
 *   onSearch       (val: string) => void
 *   placeholder    string
 *   extraFilters   ReactNode — optional additional filter controls
 *   showClear      boolean
 *   onClear        () => void
 *
 *   stats          Array<{ label, value, color, bg, border }>
 */
export function MasterDataHeader({
  icon,
  title,
  subtitle,
  onAdd,
  addLabel = 'Add',
  onRefresh,
  refreshing = false,
  search = '',
  onSearch,
  placeholder = 'Search...',
  extraFilters,
  showClear = false,
  onClear,
  stats = [],
}) {
  const debounceRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(search);

  // Sync if parent resets
  useEffect(() => { setLocalSearch(search); }, [search]);

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch?.(val), 350);
  };

  const inputStyle = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    color: C.text,
    fontSize: '13px',
    padding: '10px 14px',
    fontFamily: 'Space Grotesk, sans-serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: '24px', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && (
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: C.goldDim, border: `1px solid ${C.borderGold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
          <div>
            <h1 style={{ color: C.gold, fontSize: '22px', fontWeight: 700, margin: 0 }}>{title}</h1>
            {subtitle && <p style={{ color: C.muted, fontSize: '13px', margin: '2px 0 0' }}>{subtitle}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              background: C.panel, border: `1px solid ${C.border}`, borderRadius: '10px',
              color: C.muted, padding: '9px 14px', cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
            }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>

          {onAdd && (
            <button
              onClick={onAdd}
              style={{
                background: C.goldDim, border: `1px solid ${C.borderGold}`,
                borderRadius: '10px', color: C.gold, padding: '9px 18px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 700,
              }}
            >
              <Plus size={14} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Stats chips */}
      {stats.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {stats.map(({ label, value, color, bg, border }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border}`,
              borderRadius: '10px', padding: '6px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color, fontSize: '18px', fontWeight: 700 }}>{value ?? '—'}</span>
              <span style={{ color: C.muted, fontSize: '12px' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search + extra filters */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px',
        padding: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
          <Search size={14} color={C.muted}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, paddingLeft: '36px' }}
          />
        </div>

        {extraFilters}

        {showClear && (
          <button onClick={onClear} style={{
            background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '10px',
            color: C.red, padding: '9px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
