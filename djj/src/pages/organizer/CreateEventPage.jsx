import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { C } from '../../constants/theme.js';
import { EventWizard } from '../../components/organizer/events/EventWizard.jsx';

export default function CreateEventPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/organizer/events')}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.muted,
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Back to Events"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
            Create New Event
          </h1>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Multi-step event creation wizard — configure basic details, location, timings, policies, FAQ, and SEO.
          </p>
        </div>
      </div>

      {/* Multi-Step Wizard Component */}
      <EventWizard />
    </div>
  );
}
