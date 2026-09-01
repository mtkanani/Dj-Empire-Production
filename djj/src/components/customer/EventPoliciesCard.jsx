import React from 'react';
import { ShieldCheck, FileText, AlertCircle, UserCheck, Camera, FileCheck } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const EventPoliciesCard = ({ policies = null }) => {
  if (!policies) return null;

  const hasContent =
    policies.refundPolicy ||
    policies.entryPolicy ||
    policies.entryRules ||
    policies.cancellationPolicy ||
    policies.cameraPolicy ||
    policies.ageRestriction ||
    policies.ageLimit ||
    policies.termsAndConditions;

  if (!hasContent) return null;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
        <ShieldCheck size={20} />
        <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
          Event Policies, Rules & Guidelines
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13px' }}>
        {/* Refund Policy */}
        {policies.refundPolicy && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px' }}>
            <span style={{ color: C.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileText size={14} /> Refund Policy
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{policies.refundPolicy}</p>
          </div>
        )}

        {/* Entry Policy */}
        {(policies.entryPolicy || policies.entryRules) && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px' }}>
            <span style={{ color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertCircle size={14} /> Entry Requirements
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{policies.entryPolicy || policies.entryRules}</p>
          </div>
        )}

        {/* Cancellation Policy */}
        {policies.cancellationPolicy && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px' }}>
            <span style={{ color: C.red, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertCircle size={14} /> Cancellation Policy
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{policies.cancellationPolicy}</p>
          </div>
        )}

        {/* Camera Policy */}
        {policies.cameraPolicy && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px' }}>
            <span style={{ color: C.purple, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Camera size={14} /> Camera & Recording
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{policies.cameraPolicy}</p>
          </div>
        )}

        {/* Age Restrictions */}
        {(policies.ageRestriction || policies.ageLimit) && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px' }}>
            <span style={{ color: C.blue, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <UserCheck size={14} /> Age Restrictions
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5 }}>{policies.ageRestriction || policies.ageLimit}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        {policies.termsAndConditions && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px', gridColumn: '1 / -1' }}>
            <span style={{ color: C.gold, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileCheck size={14} /> Terms & Conditions
            </span>
            <p style={{ margin: 0, color: C.muted, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{policies.termsAndConditions}</p>
          </div>
        )}
      </div>
    </div>
  );
};
