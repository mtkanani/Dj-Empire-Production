import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerService } from '../../services/admin/customerService.js';
import { useToast } from '../../hooks/useToast.js';
import { getCustomerDisplayName } from '../../utils/customerUtils.js';

import { CustomerFilters } from '../../components/admin/customers/CustomerFilters.jsx';
import { CustomerTable } from '../../components/admin/customers/CustomerTable.jsx';
import { CustomerSuspendModal } from '../../components/admin/customers/CustomerSuspendModal.jsx';
import { CustomerActivateModal } from '../../components/admin/customers/CustomerActivateModal.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';

const PAGE_SIZE = 15;

export default function CustomersPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);

  // ── Fetch ──
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomers();
      // Backend shape: { success: true, data: [...] }
      const list = res?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = err?.message || 'Unable to load customers. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Client-side filtering ──
  const filtered = customers.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    return (
      name.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.id?.toLowerCase().includes(q)
    );
  });

  // ── Aggregate counts (from full unfiltered list) ──
  const counts = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'ACTIVE').length,
    suspended: customers.filter((c) => c.status === 'SUSPENDED').length,
    pending: customers.filter((c) =>
      c.status === 'PENDING_EMAIL_VERIFICATION' || c.status === 'PENDING_APPROVAL'
    ).length,
  };

  // ── Pagination ──
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (val) => { setSearch(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1); };
  const handleClear = () => { setSearch(''); setStatusFilter('ALL'); setCurrentPage(1); };

  // ── Navigation ──
  const handleView = (customer) => navigate(`/admin/customers/${customer.id}`);

  // ── Suspend ──
  const handleSuspendConfirm = async () => {
    if (!suspendTarget) return;
    setActionLoading(suspendTarget.id);
    try {
      await customerService.suspendCustomer(suspendTarget.id);
      showToast(`${getCustomerDisplayName(suspendTarget)} has been suspended.`, 'warning');
      setSuspendTarget(null);
      fetchCustomers();
    } catch (err) {
      showToast(err?.message || 'Failed to suspend customer.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Activate ──
  const handleActivateConfirm = async () => {
    if (!activateTarget) return;
    setActionLoading(activateTarget.id);
    try {
      await customerService.activateCustomer(activateTarget.id);
      showToast(`${getCustomerDisplayName(activateTarget)} account has been reactivated.`, 'success');
      setActivateTarget(null);
      fetchCustomers();
    } catch (err) {
      showToast(err?.message || 'Failed to activate customer.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: C.blueDim, border: `1px solid ${C.borderBlue}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color={C.blue} />
            </div>
            <h1 style={{ color: C.blue, fontSize: '24px', fontWeight: 700, margin: 0 }}>
              Customer Management
            </h1>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 0 46px' }}>
            Manage and monitor customers across the platform.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.muted,
            padding: '10px 16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <CustomerFilters
          search={search}
          onSearch={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onClear={handleClear}
          counts={!loading ? counts : {}}
        />
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{
          background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '14px',
          padding: '18px 20px', marginBottom: '20px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: C.red, fontSize: '14px' }}>{error}</span>
          <button
            onClick={fetchCustomers}
            style={{
              background: C.red, border: 'none', borderRadius: '8px', color: '#000',
              padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Results summary */}
      {!loading && !error && (
        <div style={{ color: C.faint, fontSize: '12px', marginBottom: '12px' }}>
          Showing {paginated.length} of {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          {search && <> matching "<span style={{ color: C.blue }}>{search}</span>"</>}
          {statusFilter !== 'ALL' && <> · Status: <span style={{ color: C.amber }}>{statusFilter}</span></>}
        </div>
      )}

      {/* Table */}
      <CustomerTable
        customers={paginated}
        loading={loading}
        actionLoading={actionLoading}
        onView={handleView}
        onSuspend={setSuspendTarget}
        onActivate={setActivateTarget}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals */}
      <CustomerSuspendModal
        isOpen={!!suspendTarget}
        customer={suspendTarget}
        loading={actionLoading === suspendTarget?.id}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
      />
      <CustomerActivateModal
        isOpen={!!activateTarget}
        customer={activateTarget}
        loading={actionLoading === activateTarget?.id}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivateConfirm}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
