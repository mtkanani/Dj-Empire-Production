import React, { useState, useEffect } from 'react';
import { UserCheck, X } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const CreateScannerUserModal = ({ isOpen, scanner = null, gates = [], onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGateId, setSelectedGateId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (scanner) {
      setName(scanner.scannerName || '');
      setEmail(scanner.scannerEmail || '');
      setPassword('');
      setSelectedGateId(scanner.assignedGateIds?.[0] || '');
      setIsActive(scanner.isActive ?? true);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setSelectedGateId(gates[0]?.id || '');
      setIsActive(true);
    }
  }, [scanner, isOpen, gates]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        scannerName: name.trim(),
        scannerEmail: email.trim(),
        assignedGateIds: selectedGateId ? [selectedGateId] : [],
        isActive,
      };

      if (password) payload.password = password;

      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '24px', maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
            <UserCheck size={20} />
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
              {scanner ? 'Edit Scanner Staff Account' : 'Create Scanner Staff Account'}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Staff Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Staff Email / Login ID *</label>
          <input
            type="email"
            required
            disabled={!!scanner}
            placeholder="e.g. gate1.scanner@event.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', opacity: scanner ? 0.7 : 1 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>
            {scanner ? 'New Password (leave blank to keep current)' : 'Password *'}
          </label>
          <input
            type="password"
            required={!scanner}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {gates.length > 0 && (
          <div>
            <label style={{ display: 'block', color: C.muted, fontSize: '12px', marginBottom: '6px' }}>Assigned Entrance Gate</label>
            <select
              value={selectedGateId}
              onChange={(e) => setSelectedGateId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            >
              <option value="">All Entrance Gates</option>
              {gates.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="scannerActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ accentColor: C.gold }}
          />
          <label htmlFor="scannerActive" style={{ color: C.text, fontSize: '13px', cursor: 'pointer' }}>
            Account Active for Entrance Scanning
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: C.gold, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Saving...' : scanner ? 'Update Staff Account' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </div>
  );
};
