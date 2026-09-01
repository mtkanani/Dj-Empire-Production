import React, { useState } from 'react';
import { Save, ArrowLeft, Ticket, DollarSign, AlertCircle, MapPin, Layers } from 'lucide-react';
import { C } from '../../../constants/theme.js';

export const TicketForm = ({
  initialValues = {},
  sections = [],
  onSubmit,
  onCancel,
  mode = 'create',
  saving = false,
  error = null,
}) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [pricingType, setPricingType] = useState(initialValues.pricingType || 'REGULAR');
  const [sectionId, setSectionId] = useState(initialValues.sectionId || '');
  const [price, setPrice] = useState(initialValues.price !== undefined ? initialValues.price : 0.0);
  const [quantityTotal, setQuantityTotal] = useState(initialValues.quantityTotal || 100);
  const [isActive, setIsActive] = useState(initialValues.isActive ?? true);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Ticket tier name is required (e.g. VIP Pass, Early Bird)';
    }
    if (price < 0) {
      errs.price = 'Price cannot be negative';
    }
    if (!quantityTotal || quantityTotal <= 0) {
      errs.quantityTotal = 'Quantity must be a positive integer';
    }
    if (sections.length > 0 && !sectionId) {
      errs.sectionId = 'Assign this ticket to a section (Gold, VIP, Silver, or any zone you created)';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      pricingType,
      sectionId: sectionId || undefined,
      price: parseFloat(price) || 0.0,
      quantityTotal: parseInt(quantityTotal, 10) || 100,
    };

    if (mode === 'edit') {
      payload.isActive = isActive;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Error Alert */}
      {error && (
        <div style={{ padding: '14px 18px', background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Ticket Name */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          Ticket Tier Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fan Pit Pass, General Ground Pass, VIP Lounge Pass"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${fieldErrors.name ? C.red : C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {fieldErrors.name && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.name}</span>}
      </div>

      {/* Ground Zone / Event Section Dropdown */}
      {sections.length > 0 && (
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Assigned Section / Zone *
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: C.bgCard,
              border: `1px solid ${fieldErrors.sectionId ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: C.bgCard }}>Select section (Gold, VIP, Silver, ...)</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id} style={{ background: C.bgCard }}>
                {sec.name} (Capacity: {sec.capacity} attendees)
              </option>
            ))}
          </select>
          {fieldErrors.sectionId && (
            <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.sectionId}</span>
          )}
          <span style={{ fontSize: '11px', color: C.muted, marginTop: '4px', display: 'block' }}>
            Each ticket type is bound to one organizer-named zone. Buying this ticket only updates that zone’s seats and capacity.
          </span>
        </div>
      )}

      {/* Pricing Type Selector */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          Pricing Type / Pricing Strategy *
        </label>
        <select
          value={pricingType}
          onChange={(e) => setPricingType(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="REGULAR" style={{ background: C.bgCard }}>🎫 Regular Pricing (Standard Tier)</option>
          <option value="EARLY_BIRD" style={{ background: C.bgCard }}>🐣 Early Bird (Discounted Advance Sales)</option>
          <option value="LAST_MINUTE" style={{ background: C.bgCard }}>⏰ Last Minute (Late Booking Premium)</option>
          <option value="FLASH_SALE" style={{ background: C.bgCard }}>⚡ Flash Sale (Limited Time Discount)</option>
          <option value="WEEKEND" style={{ background: C.bgCard }}>🏖️ Weekend Pricing (Saturday / Sunday)</option>
          <option value="HOLIDAY" style={{ background: C.bgCard }}>🎉 Holiday Pricing (Special Festival / Holiday)</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
          Description & Perks
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Includes front-stage standing pit access, welcome drink, and express gate entrance."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Price & Quantity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Ticket Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00 for Free Ticket"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${fieldErrors.price ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {price === '0' || price === 0 ? (
            <span style={{ color: C.green, fontSize: '11px', marginTop: '4px', display: 'block' }}>Free Entry Ticket</span>
          ) : null}
          {fieldErrors.price && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.price}</span>}
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Total Ticket Capacity / Stock *
          </label>
          <input
            type="number"
            min="1"
            value={quantityTotal}
            onChange={(e) => setQuantityTotal(e.target.value)}
            placeholder="e.g. 100"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${fieldErrors.quantityTotal ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.quantityTotal && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{fieldErrors.quantityTotal}</span>}
        </div>
      </div>

      {/* Active Status Checkbox (Edit Mode Only) */}
      {mode === 'edit' && (
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '13px',
              color: C.text,
              width: 'fit-content',
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ accentColor: C.gold, width: '16px', height: '16px' }}
            />
            Ticket Tier Active & Available for Booking
          </label>
        </div>
      )}

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: '10px 18px',
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
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
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
          <Save size={16} /> {saving ? 'Saving...' : mode === 'create' ? 'Create Ticket Tier' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
