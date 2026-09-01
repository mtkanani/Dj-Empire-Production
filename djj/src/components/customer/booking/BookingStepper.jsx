import React from 'react';
import { Ticket, User, FileText, CreditCard, CheckCircle2 } from 'lucide-react';
import { C } from '../../../constants/theme.js';

export const BookingStepper = ({ currentStep = 1 }) => {
  const steps = [
    { num: 1, label: 'Tickets', icon: Ticket },
    { num: 2, label: 'Details', icon: User },
    { num: 3, label: 'Summary', icon: FileText },
    { num: 4, label: 'Payment', icon: CreditCard },
    { num: 5, label: 'Confirmation', icon: CheckCircle2 },
  ];

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
      }}
    >
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isCompleted ? C.green : isActive ? C.gold : 'rgba(255,255,255,0.04)',
                  color: isCompleted || isActive ? '#000000' : C.muted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? C.gold : isCompleted ? C.text : C.muted,
                  whiteSpace: 'nowrap',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div style={{ flexGrow: 1, height: '2px', background: isCompleted ? C.green : 'rgba(255,255,255,0.06)', margin: '0 12px', minWidth: '20px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
