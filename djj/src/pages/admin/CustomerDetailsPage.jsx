import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Ban, RefreshCcw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerService } from '../../services/admin/customerService.js';
import { useToast } from '../../hooks/useToast.js';
import { getCustomerActions, getCustomerDisplayName } from '../../utils/customerUtils.js';

import { CustomerStatusBadge } from '../../components/admin/customers/CustomerStatusBadge.jsx';
import { CustomerProfileCard } from '../../components/admin/customers/CustomerProfileCard.jsx';
import { CustomerStats } from '../../components/admin/customers/CustomerStats.jsx';
import { CustomerBookings } from '../../components/admin/customers/CustomerBookings.jsx';
import { CustomerActivity } from '../../components/admin/customers/CustomerActivity.jsx';
import { CustomerSuspendModal } from '../../components/admin/customers/CustomerSuspendModal.jsx';
import { CustomerActivateModal } from '../../components/admin/customers/CustomerActivateModal.jsx';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showSuspend, setShowSuspend] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  // ── Fetch customer details ──
  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomerById(id);
      setCustomer(res?.data || res);
    } catch (err) {
      const msg = err?.response?.status === 404
        ? 'Customer not found.'
        : err?.message || 'Unable to load customer information. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // ── Suspend ──
  const handleSuspendConfirm = async () => {
    setActionLoading(true);
    try {
      await customerService.suspendCustomer(id);
      showToast('Customer account suspended successfully.', 'warning');
      setShowSuspend(false);
      fetchCustomer();
    } catch (err) {
      showToast(err?.message || 'Failed to suspend customer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Activate ──
  const handleActivateConfirm = async () => {
    setActionLoading(true);
    try {
      await customerService.activateCustomer(id);
      showToast('Customer account reactivated successfully.', 'success');
      setShowActivate(false);
      fetchCustomer();
    } catch (err) {
      showToast(err?.message || 'Failed to activate customer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: `2px solid ${C.blue}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: C.muted, fontFamily: 'Space Grotesk, sans-serif' }}>Loading customer details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: C.red, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => navigate('/admin/customers')}
          style={{
            background: C.blueDim, border: `1px solid ${C.borderBlue}`,
            borderRadius: '12px', color: C.blue, padding: '10px 24px',
            cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
          }}
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) return null;

  const name = getCustomerDisplayName(customer);
  const { canSuspend, canActivate } = getCustomerActions(customer.status);
  const bookings = customer.bookings || [];

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', maxWidth: '1100px' }}>
      {/* Breadcrumb-style nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/customers')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: '10px', color: C.muted, padding: '8px 16px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderBlue; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <ArrowLeft size={14} /> Back to Customers
        </button>

        <button
          onClick={fetchCustomer}
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

      {/* Header banner */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.borderBlue}`,
        borderRadius: '20px',
        padding: '22px 26px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: `0 4px 30px ${C.blueDim}`,
      }}>
        <div>
          <h1 style={{ color: C.text, fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>{name}</h1>
          <CustomerStatusBadge status={customer.status} size="lg" />
        </div>

        {/* Contextual action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {canSuspend && (
            <button
              onClick={() => setShowSuspend(true)}
              disabled={actionLoading}
              style={{
                background: C.redDim, border: `1px solid ${C.red}`,
                borderRadius: '12px', color: C.red, padding: '10px 20px',
                cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <Ban size={16} /> Suspend Account
            </button>
          )}

          {canActivate && (
            <button
              onClick={() => setShowActivate(true)}
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

      {/* Profile + Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px', marginBottom: '28px' }}>
        <CustomerProfileCard customer={customer} />
        <CustomerStats bookings={bookings} />
      </div>

      {/* Booking History */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          color: C.gold, fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px', fontWeight: 700, margin: '0 0 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '12px',
        }}>
          Booking History
          <span style={{
            background: C.goldDim, border: `1px solid ${C.borderGold}`,
            borderRadius: '999px', padding: '2px 10px',
            color: C.gold, fontSize: '12px', fontWeight: 700,
          }}>
            {bookings.length}
          </span>
        </h3>
        <CustomerBookings bookings={bookings} />
      </div>

      {/* Activity */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          color: C.muted, fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px', fontWeight: 700, margin: '0 0 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '12px',
        }}>
          Customer Activity
        </h3>
        <CustomerActivity />
      </div>

      {/* Modals */}
      <CustomerSuspendModal
        isOpen={showSuspend}
        customer={customer}
        loading={actionLoading}
        onClose={() => setShowSuspend(false)}
        onConfirm={handleSuspendConfirm}
      />
      <CustomerActivateModal
        isOpen={showActivate}
        customer={customer}
        loading={actionLoading}
        onClose={() => setShowActivate(false)}
        onConfirm={handleActivateConfirm}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
