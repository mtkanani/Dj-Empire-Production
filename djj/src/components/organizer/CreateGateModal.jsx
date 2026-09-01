import React, { useState, useEffect } from 'react';
import { DoorOpen, X, Shield, Plus, Trash2, Key, User, Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const CreateGateModal = ({
  isOpen,
  gate = null,
  eventId = '',
  sections = [],
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(1000);
  const [selectedSections, setSelectedSections] = useState([]);
  
  // Scanner Staff accounts creation list
  const [scannerAccounts, setScannerAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (gate) {
      setName(gate.name || '');
      setCode(gate.code || '');
      setDescription(gate.description || '');
      setCapacity(gate.capacity || 1000);
      setSelectedSections(gate.allowedSections || []);
      setScannerAccounts([]);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setCapacity(1000);
      setSelectedSections([]);
      setScannerAccounts([
        { scannerName: '', scannerEmail: '', password: '' },
      ]);
    }
  }, [gate, isOpen]);

  if (!isOpen) return null;

  const handleSectionToggle = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleAddScannerRow = () => {
    setScannerAccounts((prev) => [
      ...prev,
      { scannerName: '', scannerEmail: '', password: '' },
    ]);
  };

  const handleRemoveScannerRow = (index) => {
    setScannerAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScannerChange = (index, field, value) => {
    setScannerAccounts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Filter out empty scanner entries
      const validScanners = scannerAccounts.filter(
        (s) => s.scannerEmail.trim() && s.password.trim()
      );

      await onSubmit({
        eventId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        capacity: Number(capacity),
        allowedSections: selectedSections,
        scannerAccounts: validScanners,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: C.bgCard,
          border: `1px solid ${C.borderGold}`,
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '620px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${C.border}`,
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: C.gold }}>
            <DoorOpen size={24} />
            <h3
              style={{
                margin: 0,
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                color: C.text,
              }}
            >
              {gate ? 'Edit Entrance Gate' : 'Create Entrance Gate & Scanner Credentials'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Gate Name & Code */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Gate Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Gate 1, VIP Entrance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Gate Code Identifier *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GATE_A, VIP_GATE1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.gold,
                fontSize: '13px',
                fontFamily: 'Space Grotesk, monospace',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Capacity & Description */}
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Max Capacity
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Description / Location Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Main entrance located near West Parking Lot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Section Access Allocation */}
        {sections.length > 0 && (
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
              Assign Section Access (Optional)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sections.map((sec) => {
                const isChecked = selectedSections.includes(sec.id);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSectionToggle(sec.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: isChecked ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isChecked ? C.gold : C.border}`,
                      color: isChecked ? C.gold : C.muted,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sec.color || C.gold }} />
                    {sec.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SCANNER STAFF CREDENTIALS SECTION */}
        <div
          style={{
            background: 'rgba(234, 179, 8, 0.03)',
            border: `1px solid ${C.borderGold}`,
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
              <Shield size={18} />
              <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                Create Dedicated Scanner Staff Logins
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddScannerRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: C.gold,
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Scanner Staff
            </button>
          </div>

          <p style={{ margin: 0, color: C.muted, fontSize: '12px' }}>
            Create Email ID & Password accounts for staff members scanning tickets at this entrance gate.
          </p>

          {scannerAccounts.length === 0 ? (
            <div style={{ color: C.muted, fontSize: '12px', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
              No new scanner accounts added for this gate. Click "Add Scanner Staff" above to create credentials.
            </div>
          ) : (
            scannerAccounts.map((account, idx) => (
              <div
                key={idx}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.gold }}>
                    Scanner Staff Account #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveScannerRow(idx)}
                    style={{ background: 'transparent', border: 'none', color: C.red, cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', color: C.muted, fontSize: '11px', marginBottom: '4px' }}>
                      Staff Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Gate Scanner"
                      value={account.scannerName}
                      onChange={(e) => handleScannerChange(idx, 'scannerName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        color: C.text,
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: C.muted, fontSize: '11px', marginBottom: '4px' }}>
                      Login Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="scanner1@event.com"
                      value={account.scannerEmail}
                      onChange={(e) => handleScannerChange(idx, 'scannerEmail', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        color: C.text,
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: C.muted, fontSize: '11px', marginBottom: '4px' }}>
                      Login Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Password (min 6 chars)"
                      value={account.password}
                      onChange={(e) => handleScannerChange(idx, 'password', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        color: C.text,
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
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
            disabled={submitting}
            style={{
              padding: '10px 24px',
              background: C.gold,
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
            }}
          >
            {submitting ? 'Saving Gate & Scanners...' : gate ? 'Update Gate' : 'Create Gate & Scanners'}
          </button>
        </div>
      </form>
    </div>
  );
};
