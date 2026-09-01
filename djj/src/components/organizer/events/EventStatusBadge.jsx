import React from 'react';
import { getEventStatusBadgeProps } from '../../../utils/eventStateUtils.js';

export const EventStatusBadge = ({ status }) => {
  const props = getEventStatusBadgeProps(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'Space Grotesk, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        background: props.bg,
        color: props.color,
        border: `1px solid ${props.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: props.color,
        }}
      />
      {props.label}
    </span>
  );
};
