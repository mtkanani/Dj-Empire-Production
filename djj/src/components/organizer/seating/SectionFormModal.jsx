import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Grid, Box, ShieldCheck } from 'lucide-react';
import { C } from '../../../constants/theme.js';
import { DEFAULT_SECTION_COLORS } from '../../../utils/seatMapUtils.js';

export const SectionFormModal = ({
  isOpen = false,
  initialValues = null,
  onSubmit,
  onClose,
  saving = false,
  error = null,
}) => {
  const [name, setName] = useState('');
  const [layoutType, setLayoutType] = useState('GRID'); // 'GRID' (Seated Chairs) or 'GROUND_BOX' (Standing Ground Zone)
  const [capacity, setCapacity] = useState(100);
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setLayoutType(initialValues.layoutType || 'GRID');
      setCapacity(initialValues.capacity || 100);
      setColor(initialValues.color || '#3B82F6');
      setDescription(initialValues.description || '');
      setDisplayOrder(initialValues.displayOrder || 0);
    } else {
      setName('');
      setLayoutType('GRID');
      setCapacity(100);
      setColor('#3B82F6');
      setDescription('');
      setDisplayOrder(0);
    }
    setFieldErrors({});
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Section name is required (e.g. VIP Lounge, Fan Pit Box A)';
    if (!capacity || capacity <= 0) errs.capacity = 'Capacity must be a positive number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      layoutType,
      capacity: parseInt(capacity, 10) || 100,
      color,
      description: description.trim() || undefined,
      displayOrder: parseInt(displayOrder, 10) || 0,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '540px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
            {initialValues ? 'Edit Event Section' : 'Create Custom Section / Ground Zone'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div style={{ padding: '10px 14px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '10px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Layout & Seating Mode Selector */}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
              Select Seating & Layout Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setLayoutType('GRID')}
                style={{
                  padding: '14px',
                  background: layoutType === 'GRID' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${layoutType === 'GRID' ? C.blue : C.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: layoutType === 'GRID' ? C.blue : C.text, fontWeight: 700, fontSize: '13px' }}>
                  <Grid size={18} /> Numbered Chair Grid
                </div>
                <span style={{ fontSize: '11px', color: C.muted, lineHeight: '1.4' }}>
                  Fixed row & seat numbers (Rows A-E, Seats 1-20) for assigned theater/stadium seating.
                </span>
              </div>

              <div
                onClick={() => setLayoutType('GROUND_BOX')}
                style={{
                  padding: '14px',
                  background: layoutType === 'GROUND_BOX' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${layoutType === 'GROUND_BOX' ? C.gold : C.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: layoutType === 'GROUND_BOX' ? C.gold : C.text, fontWeight: 700, fontSize: '13px' }}>
                  <Box size={18} /> Standing Ground Box
                </div>
                <span style={{ fontSize: '11px', color: C.muted, lineHeight: '1.4' }}>
                  Open ground standing zone or box enclosure for open lawns, festivals, & standing pits.
                </span>
              </div>
            </div>
          </div>

          {/* Section Name */}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
              Section / Ground Box Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={layoutType === 'GRID' ? 'e.g. VIP Row Section A' : 'e.g. Fan Pit Box A, General Lawn Zone B'}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${fieldErrors.name ? C.red : C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {fieldErrors.name && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.name}</span>}
          </div>

          {/* Total Capacity */}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
              {layoutType === 'GRID' ? 'Total Number of Seats *' : 'Standing Ground Capacity *'}
            </label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="100"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${fieldErrors.capacity ? C.red : C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {fieldErrors.capacity && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.capacity}</span>}
          </div>

          {/* Color Selector */}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
              Section Badge Color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DEFAULT_SECTION_COLORS.map((hexColor) => (
                <button
                  key={hexColor}
                  type="button"
                  onClick={() => setColor(hexColor)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: hexColor,
                    border: color === hexColor ? '2px solid #FFFFFF' : 'none',
                    cursor: 'pointer',
                    boxShadow: color === hexColor ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                  }}
                  title={hexColor}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
              Description & Access Perks (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Ground standing zone right in front of stage with fast-track entry."
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.muted,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: C.gold,
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : initialValues ? 'Save Changes' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
