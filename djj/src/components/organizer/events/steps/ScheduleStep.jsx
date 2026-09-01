import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { C } from '../../../../constants/theme.js';

export const ScheduleStep = ({ data = {}, onChange, errors = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 3 — Event Schedule & Date Settings
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Start Date */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Start Date *
          </label>
          <input
            type="date"
            value={data.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.startDate ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.startDate && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.startDate}</span>}
        </div>

        {/* End Date */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            End Date *
          </label>
          <input
            type="date"
            value={data.endDate || ''}
            onChange={(e) => onChange({ endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.endDate ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.endDate && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.endDate}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Start Time */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            Start Time *
          </label>
          <input
            type="time"
            value={data.startTime || ''}
            onChange={(e) => onChange({ startTime: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.startTime ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.startTime && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.startTime}</span>}
        </div>

        {/* End Time */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            End Time *
          </label>
          <input
            type="time"
            value={data.endTime || ''}
            onChange={(e) => onChange({ endTime: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${errors.endTime ? C.red : C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.endTime && <span style={{ color: C.red, fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.endTime}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Gate Open Time */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Gate Open Time (Optional)
          </label>
          <input
            type="time"
            value={data.gateOpenTime || ''}
            onChange={(e) => onChange({ gateOpenTime: e.target.value })}
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
            }}
          />
        </div>

        {/* Timezone Selection */}
        <div>
          <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
            Event Timezone
          </label>
          <select
            value={data.timezone || 'Asia/Kolkata'}
            onChange={(e) => onChange({ timezone: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
