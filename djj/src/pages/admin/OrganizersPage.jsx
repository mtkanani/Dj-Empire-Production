import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building, RefreshCw } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { adminService } from '../../services/admin/adminService.js';
import { useToast } from '../../hooks/useToast.js';

import { OrganizerFilters } from '../../components/admin/organizers/OrganizerFilters.jsx';
import { OrganizerTable } from '../../components/admin/organizers/OrganizerTable.jsx';
import { OrganizerApprovalModal } from '../../components/admin/organizers/OrganizerApprovalModal.jsx';
import { OrganizerRejectModal } from '../../components/admin/organizers/OrganizerRejectModal.jsx';
import { OrganizerSuspendModal } from '../../components/admin/organizers/OrganizerSuspendModal.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';

const PAGE_SIZE = 15;

const STATUS_ALIASES = {
  pending: 'PENDING_APPROVAL',
  PENDING: 'PENDING_APPROVAL',
  active: 'ACTIVE',
  suspended: 'SUSPENDED',
};

function normalizeStatus(value) {
  if (!value || value === 'ALL') return 'ALL';
  return STATUS_ALIASES[value] || STATUS_ALIASES[String(value).toLowerCase()] || value;
}

export default function OrganizersPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => normalizeStatus(searchParams.get('status') || 'ALL'));
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);

  const fetchOrganizers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrganizers();
      const list = res?.data || res?.organizers || [];
      setOrganizers(Array.isArray(list) ? list : []);
    } catch (err) {
      showToast(err?.message || 'Failed to load organizers', 'error');
      setOrganizers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  useEffect(() => {
    const fromUrl = normalizeStatus(searchParams.get('status') || 'ALL');
    if (fromUrl !== statusFilter) setStatusFilter(fromUrl);
  }, [searchParams, statusFilter]);

  // Derived: client-side search + status filter (counts stay based on full list)
  const filtered = organizers.filter((org) => {
    if (statusFilter !== 'ALL' && org.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const profile = org.organizerProfile || {};
    return (
      profile.companyName?.toLowerCase().includes(q) ||
      org.email?.toLowerCase().includes(q) ||
      org.phone?.toLowerCase().includes(q) ||
      org.firstName?.toLowerCase().includes(q) ||
      org.lastName?.toLowerCase().includes(q)
    );
  });

  // Aggregate counts
  const counts = {
    total: organizers.length,
    pendingApproval: organizers.filter((o) => o.status === 'PENDING_APPROVAL').length,
    active: organizers.filter((o) => o.status === 'ACTIVE').length,
    suspended: organizers.filter((o) => o.status === 'SUSPENDED').length,
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    const next = normalizeStatus(val);
    setStatusFilter(next);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'ALL') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', next);
    }
    setSearchParams(nextParams);
  };

  const handleClear = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('status');
    setSearchParams(nextParams);
  };

  // === Action Handlers ===
  const handleView = (org) => navigate(`/admin/organizers/${org.id}`);

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setActionLoading(approveTarget.id);
    try {
      await adminService.approveOrganizer(approveTarget.id);
      const name = approveTarget.organizerProfile?.companyName || approveTarget.firstName || 'Organizer';
      showToast(`${name} has been approved and activated.`, 'success');
      setApproveTarget(null);
      fetchOrganizers();
    } catch (err) {
      showToast(err?.message || 'Failed to approve organizer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id);
    try {
      await adminService.rejectOrganizer(rejectTarget.id, reason);
      const name = rejectTarget.organizerProfile?.companyName || rejectTarget.firstName || 'Organizer';
      showToast(`${name}'s application has been rejected.`, 'warning');
      setRejectTarget(null);
      fetchOrganizers();
    } catch (err) {
      showToast(err?.message || 'Failed to reject organizer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendConfirm = async () => {
    if (!suspendTarget) return;
    setActionLoading(suspendTarget.id);
    try {
      await adminService.suspendOrganizer(suspendTarget.id);
      const name = suspendTarget.organizerProfile?.companyName || suspendTarget.firstName || 'Organizer';
      showToast(`${name}'s account has been suspended.`, 'warning');
      setSuspendTarget(null);
      fetchOrganizers();
    } catch (err) {
      showToast(err?.message || 'Failed to suspend organizer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (org) => {
    // Re-activate a suspended organizer via the approve endpoint
    setApproveTarget(org);
  };

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: C.goldDim, border: `1px solid ${C.borderGold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building size={18} color={C.gold} />
            </div>
            <h1 style={{ color: C.gold, fontSize: '24px', fontWeight: 700, margin: 0 }}>
              Event Organizer Management
            </h1>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 0 46px' }}>
            Review, approve, reject, and manage all event organizer accounts on the platform.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchOrganizers}
          disabled={loading}
          title="Refresh List"
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
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <OrganizerFilters
          search={search}
          onSearch={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onClear={handleClear}
          counts={counts}
        />
      </div>

      {/* Results summary */}
      {!loading && (
        <div style={{ color: C.faint, fontSize: '12px', marginBottom: '12px' }}>
          Showing {paginated.length} of {filtered.length} organizer{filtered.length !== 1 ? 's' : ''}
          {search && <> matching "<span style={{ color: C.gold }}>{search}</span>"</>}
          {statusFilter !== 'ALL' && <> with status <span style={{ color: C.amber }}>{statusFilter}</span></>}
        </div>
      )}

      {/* Table */}
      <OrganizerTable
        organizers={paginated}
        loading={loading}
        actionLoading={actionLoading}
        onView={handleView}
        onApprove={setApproveTarget}
        onReject={setRejectTarget}
        onSuspend={setSuspendTarget}
        onActivate={handleActivate}
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
      <OrganizerApprovalModal
        isOpen={!!approveTarget}
        organizer={approveTarget}
        loading={actionLoading === approveTarget?.id}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />
      <OrganizerRejectModal
        isOpen={!!rejectTarget}
        organizer={rejectTarget}
        loading={actionLoading === rejectTarget?.id}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
      <OrganizerSuspendModal
        isOpen={!!suspendTarget}
        organizer={suspendTarget}
        loading={actionLoading === suspendTarget?.id}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
