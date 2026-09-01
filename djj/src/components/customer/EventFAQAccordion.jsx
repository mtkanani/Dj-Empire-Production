import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const EventFAQAccordion = ({ faqs = [] }) => {
  const [openIdx, setOpenIdx] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.gold }}>
        <HelpCircle size={20} />
        <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: C.text }}>
          Frequently Asked Questions
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const question = typeof faq === 'string' ? faq : faq.question || faq.q || 'Question';
          const answer = typeof faq === 'object' ? faq.answer || faq.a || '' : '';

          return (
            <div
              key={idx}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: C.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                <span>{question}</span>
                {isOpen ? <ChevronUp size={16} color={C.gold} /> : <ChevronDown size={16} color={C.muted} />}
              </button>

              {isOpen && answer && (
                <div style={{ padding: '0 16px 14px', color: C.muted, fontSize: '13px', lineHeight: 1.6, borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                  {answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
