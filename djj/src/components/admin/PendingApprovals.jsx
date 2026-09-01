import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { Button } from '../common/Button.jsx';
import { adminService } from '../../services/admin/adminService.js';
import { useToast } from '../../hooks/useToast.js';

function organizerName(event) {
  return (
    event?.organizer?.organizerProfile?.companyName ||
    `${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`.trim() ||
    event?.organizer?.email ||
    'Organizer'
  );
}

export const PendingApprovals = ({ events = [], onRefresh }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState(null);

  const pendingList = events.filter((e) => e.status === 'PendingApproval');

  const handleApprove = async (id, title) => {
    setActionLoading(id);
    try {
      await adminService.approveEvent(id);
      showToast(`Approved event "${title}"`, 'success');
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Failed to approve event', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, title) => {
    const reason = window.prompt(`Reason for rejecting "${title}"?`);
    if (!reason?.trim()) return;
    setActionLoading(id);
    try {
      await adminService.rejectEvent(id, reason.trim());
      showToast(`Rejected event "${title}"`, 'warning');
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Failed to reject event', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: '20px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color={C.gold} /> Pending Event Approvals ({pendingList.length})
        </h3>

        <button
          type="button"
          onClick={() => navigate('/admin/events?status=PendingApproval')}
          style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {pendingList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: C.muted, fontSize: '13px' }}>
          No events awaiting approval. Organizer submissions will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pendingList.slice(0, 5).map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px',
                background: C.panel,
                borderRadius: '14px',
                border: `1px solid ${C.border}`,
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <strong style={{ color: C.text, display: 'block', fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {event.title || 'Untitled Event'}
                </strong>
                <span style={{ fontSize: '12px', color: C.muted }}>
                  by {organizerName(event)}
                  {event.category?.name ? ` • ${event.category.name}` : ''}
                  {event.city?.name ? ` • ${event.city.name}` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  loading={actionLoading === event.id}
                  onClick={() => handleApprove(event.id, event.title)}
                >
                  <CheckCircle size={14} /> Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionLoading === event.id}
                  onClick={() => handleReject(event.id, event.title)}
                >
                  <XCircle size={14} /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
