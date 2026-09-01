import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Ban, RefreshCcw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { adminService } from '../../services/admin/adminService.js';
import { useToast } from '../../hooks/useToast.js';

import { OrganizerStatusBadge } from '../../components/admin/organizers/OrganizerStatusBadge.jsx';
import { OrganizerProfileCard } from '../../components/admin/organizers/OrganizerProfileCard.jsx';
import { OrganizerStats } from '../../components/admin/organizers/OrganizerStats.jsx';
import { OrganizerEvents } from '../../components/admin/organizers/OrganizerEvents.jsx';
import { OrganizerApprovalModal } from '../../components/admin/organizers/OrganizerApprovalModal.jsx';
import { OrganizerRejectModal } from '../../components/admin/organizers/OrganizerRejectModal.jsx';
import { OrganizerSuspendModal } from '../../components/admin/organizers/OrganizerSuspendModal.jsx';

export default function OrganizerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  const fetchOrganizer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOrganizerById(id);
      setOrganizer(res?.data || res);
    } catch (err) {
      setError(err?.message || 'Failed to load organizer details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganizer();
  }, [fetchOrganizer]);

  // ======= Action Handlers =======
  const handleApproveConfirm = async () => {
    setActionLoading(true);
    try {
      await adminService.approveOrganizer(id);
      showToast('Organizer approved and activated successfully.', 'success');
      setShowApprove(false);
      fetchOrganizer();
    } catch (err) {
      showToast(err?.message || 'Failed to approve organizer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setActionLoading(true);
    try {
      await adminService.rejectOrganizer(id, reason);
      showToast("Organizer's application has been rejected.", 'warning');
      setShowReject(false);
      fetchOrganizer();
    } catch (err) {
      showToast(err?.message || 'Failed to reject organizer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendConfirm = async () => {
    setActionLoading(true);
    try {
      await adminService.suspendOrganizer(id);
      showToast('Organizer account suspended successfully.', 'warning');
      setShowSuspend(false);
      fetchOrganizer();
    } catch (err) {
      showToast(err?.message || 'Failed to suspend organizer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ======= Loading State =======
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: `2px solid ${C.gold}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: C.muted, fontFamily: 'Space Grotesk, sans-serif' }}>Loading organizer details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ======= Error State =======
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: C.red, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => navigate('/admin/organizers')}
          style={{
            background: C.goldDim, border: `1px solid ${C.borderGold}`,
            borderRadius: '12px', color: C.gold, padding: '10px 24px',
            cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
          }}
        >
          ← Back to Organizers
        </button>
      </div>
    );
  }

  if (!organizer) return null;

  const status = organizer.status;
  const companyName = organizer.organizerProfile?.companyName
    || `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
    || 'Organizer';

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', maxWidth: '1100px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/organizers')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: '10px', color: C.muted, padding: '8px 16px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderGold; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <ArrowLeft size={14} /> Back to Organizers
        </button>

        {/* Refresh */}
        <button
          onClick={fetchOrganizer}
          disabled={loading}
          style={{
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: '10px', color: C.muted, padding: '8px 14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Header Banner */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.borderGold}`,
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: `0 4px 30px ${C.goldDim}`,
      }}>
        <div>
          <h1 style={{ color: C.gold, fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>{companyName}</h1>
          <OrganizerStatusBadge status={status} size="lg" />
        </div>

        {/* Contextual Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {status === 'PENDING_APPROVAL' && (
            <>
              <button
                onClick={() => setShowApprove(true)}
                disabled={actionLoading}
                style={{
                  background: C.greenDim, border: `1px solid ${C.green}`,
                  borderRadius: '12px', color: C.green, padding: '10px 20px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={actionLoading}
                style={{
                  background: C.redDim, border: `1px solid ${C.red}`,
                  borderRadius: '12px', color: C.red, padding: '10px 20px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <XCircle size={16} /> Reject
              </button>
            </>
          )}

          {status === 'ACTIVE' && (
            <button
              onClick={() => setShowSuspend(true)}
              disabled={actionLoading}
              style={{
                background: C.amberDim, border: `1px solid ${C.amber}`,
                borderRadius: '12px', color: C.amber, padding: '10px 20px',
                cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Ban size={16} /> Suspend Account
            </button>
          )}

          {status === 'SUSPENDED' && (
            <button
              onClick={() => setShowApprove(true)}
              disabled={actionLoading}
              style={{
                background: C.greenDim, border: `1px solid ${C.green}`,
                borderRadius: '12px', color: C.green, padding: '10px 20px',
                cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <RefreshCcw size={16} /> Reactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Profile Card */}
        <div>
          <OrganizerProfileCard organizer={organizer} />
        </div>

        {/* Right: Stats */}
        <div>
          <OrganizerStats organizer={organizer} />
        </div>
      </div>

      {/* Events Section */}
      <div>
        <h3 style={{
          color: C.gold, fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px', fontWeight: 700, margin: '0 0 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '12px',
        }}>
          Events by {companyName}
          <span style={{
            background: C.blueDim, border: `1px solid ${C.borderBlue}`,
            borderRadius: '999px', padding: '2px 10px',
            color: C.blue, fontSize: '12px', fontWeight: 700,
          }}>
            {organizer.events?.length || 0}
          </span>
        </h3>
        <OrganizerEvents events={organizer.events || []} />
      </div>

      {/* Modals */}
      <OrganizerApprovalModal
        isOpen={showApprove}
        organizer={organizer}
        loading={actionLoading}
        onClose={() => setShowApprove(false)}
        onConfirm={handleApproveConfirm}
      />
      <OrganizerRejectModal
        isOpen={showReject}
        organizer={organizer}
        loading={actionLoading}
        onClose={() => setShowReject(false)}
        onConfirm={handleRejectConfirm}
      />
      <OrganizerSuspendModal
        isOpen={showSuspend}
        organizer={organizer}
        loading={actionLoading}
        onClose={() => setShowSuspend(false)}
        onConfirm={handleSuspendConfirm}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
