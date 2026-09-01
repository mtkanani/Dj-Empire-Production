import React from 'react';
import { CheckCircle2, AlertCircle, Rocket, Save, Send } from 'lucide-react';
import { C } from '../../../../constants/theme.js';
import { EventStatusBadge } from '../EventStatusBadge.jsx';

export const PublishEventStep = ({
  event,
  basicInfo = {},
  venue = {},
  schedule = {},
  onPublish,
  onSubmitApproval,
  onSaveDraft,
  publishing = false,
  saving = false,
}) => {
  const isBasicValid = Boolean(basicInfo.title);
  const isVenueValid = Boolean(venue.venueName && venue.city);
  const isScheduleValid = Boolean(schedule.startDate && schedule.endDate);

  const isReadyToPublish = isBasicValid && isVenueValid && isScheduleValid;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 8 — Publish Event & Status Transition
      </h3>

      {/* Current Event Status Bar */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: C.muted, display: 'block', marginBottom: '4px' }}>Current Event Status</span>
          <EventStatusBadge status={event?.status || 'Draft'} />
        </div>

        <button
          onClick={onSaveDraft}
          disabled={saving || publishing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: C.goldDim,
            border: `1px solid ${C.borderGold}`,
            borderRadius: '12px',
            color: C.gold,
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Save size={15} /> {saving ? 'Saving Draft...' : 'Save Draft'}
        </button>
      </div>

      {/* Readiness Checklist */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
        <h4 style={{ margin: '0 0 16px', color: C.text, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
          Publish Readiness Checklist
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: isBasicValid ? C.green : C.muted }}>
            <CheckCircle2 size={18} color={isBasicValid ? C.green : C.muted} />
            <span>Basic Event Title & Description</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: isVenueValid ? C.green : C.muted }}>
            <CheckCircle2 size={18} color={isVenueValid ? C.green : C.muted} />
            <span>Venue Location & Address</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: isScheduleValid ? C.green : C.muted }}>
            <CheckCircle2 size={18} color={isScheduleValid ? C.green : C.muted} />
            <span>Event Dates & Timings Schedule</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={onSubmitApproval}
          disabled={!isReadyToPublish || publishing || saving}
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: C.blueDim,
            border: `1px solid ${C.blue}`,
            borderRadius: '14px',
            color: C.blue,
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: !isReadyToPublish ? 'not-allowed' : 'pointer',
            opacity: !isReadyToPublish ? 0.5 : 1,
          }}
        >
          <Send size={18} /> Submit for Approval
        </button>

        <button
          onClick={onPublish}
          disabled={!isReadyToPublish || publishing || saving}
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: !isReadyToPublish ? 'not-allowed' : 'pointer',
            opacity: !isReadyToPublish ? 0.5 : 1,
          }}
        >
          <Rocket size={18} /> {publishing ? 'Publishing Live...' : 'Publish Event Live'}
        </button>
      </div>
    </div>
  );
};
