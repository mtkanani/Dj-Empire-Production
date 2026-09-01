import React, { useState } from 'react';
import { HelpCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { C } from '../../../../constants/theme.js';

export const FAQStep = ({ faqs = [], onAddFAQ, onUpdateFAQ, onDeleteFAQ }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError('Both Question and Answer are required');
      return;
    }
    setError('');
    onAddFAQ({ question: newQuestion.trim(), answer: newAnswer.trim(), displayOrder: faqs.length });
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleSaveEdit = (id) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    onUpdateFAQ(id, { question: editQuestion.trim(), answer: editAnswer.trim() });
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, color: C.gold, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Step 5 — Frequently Asked Questions (FAQ)
      </h3>

      {/* Add New FAQ Form */}
      <form onSubmit={handleAdd} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
        <h4 style={{ margin: '0 0 14px', color: C.text, fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
          Add New Question & Answer
        </h4>

        {error && <span style={{ color: C.red, fontSize: '12px', marginBottom: '10px', display: 'block' }}>{error}</span>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Question: e.g. What time do doors open?"
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

          <textarea
            rows={2}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Answer: e.g. Gates open 2 hours prior to the main show start time."
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

          <button
            type="submit"
            style={{
              alignSelf: 'flex-end',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: C.gold,
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '12px',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} /> Add FAQ Item
          </button>
        </div>
      </form>

      {/* Existing FAQs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0, color: C.muted, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Event FAQ List ({faqs.length})
        </h4>

        {faqs.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: C.muted, fontSize: '13px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: `1px dashed ${C.border}` }}>
            No FAQ items added yet. Use the form above to add questions for your event attendees.
          </div>
        ) : (
          faqs.map((item, idx) => {
            const isEditing = editingId === (item.id || idx);

            return (
              <div
                key={item.id || idx}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                {isEditing ? (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${C.gold}`,
                        borderRadius: '8px',
                        color: C.text,
                        fontSize: '13px',
                      }}
                    />
                    <textarea
                      rows={2}
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${C.gold}`,
                        borderRadius: '8px',
                        color: C.text,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleSaveEdit(item.id || idx)}
                        style={{ padding: '6px 12px', background: C.green, color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ flexGrow: 1 }}>
                    <h5 style={{ margin: '0 0 6px', color: C.text, fontSize: '14px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
                      Q: {item.question}
                    </h5>
                    <p style={{ margin: 0, color: C.muted, fontSize: '13px', lineHeight: 1.5 }}>
                      A: {item.answer}
                    </p>
                  </div>
                )}

                {!isEditing && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingId(item.id || idx);
                        setEditQuestion(item.question);
                        setEditAnswer(item.answer);
                      }}
                      style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px' }}
                      title="Edit FAQ"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteFAQ(item.id || idx)}
                      style={{ background: 'transparent', border: 'none', color: C.red, cursor: 'pointer', padding: '4px' }}
                      title="Delete FAQ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
