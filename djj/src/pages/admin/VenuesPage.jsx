import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Pencil, Trash2, CheckCircle, XCircle, MapPin, Users } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { venueService } from '../../services/admin/venueService.js';
import { cityService } from '../../services/admin/cityService.js';
import { useToast } from '../../hooks/useToast.js';
import { Modal } from '../../components/common/Modal.jsx';
import { MasterDataHeader } from '../../components/admin/MasterDataHeader.jsx';
import { formatDate } from '../../utils/formatters.js';

/**
 * VenueForm
 * Verified required fields: name(required), address(required), cityId(required),
 *                           capacity(default 100), latitude, longitude, isActive(update only)
 *
 * The city dropdown is populated from GET /admin/cities.
 * cityId is required — backend rejects venues without a valid city.
 */
function VenueForm({ initial = {}, cities = [], loading, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    address: initial.address || '',
    cityId: initial.cityId || '',
    capacity: initial.capacity !== undefined ? String(initial.capacity) : '100',
    latitude: initial.latitude !== undefined ? String(initial.latitude) : '',
    longitude: initial.longitude !== undefined ? String(initial.longitude) : '',
    isActive: initial.isActive !== undefined ? initial.isActive : true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Venue name is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    if (!form.cityId) e.cityId = 'Please select a city.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1) e.capacity = 'Capacity must be a positive integer.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      cityId: form.cityId,
      capacity: parseInt(form.capacity, 10),
      ...(form.latitude ? { latitude: parseFloat(form.latitude) } : {}),
      ...(form.longitude ? { longitude: parseFloat(form.longitude) } : {}),
    };
    if (initial.id) payload.isActive = form.isActive;
    onSubmit(payload);
  };

  const inp = (label, key, opts = {}) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{opts.required && <span style={{ color: C.red }}> *</span>}
      </label>
      <input
        type={opts.type || 'text'}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={opts.placeholder}
        style={{ width: '100%', background: C.panel, border: `1px solid ${errors[key] ? C.red : C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
      />
      {errors[key] && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic info */}
      <div style={{ color: C.gold, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingBottom: '6px', borderBottom: `1px solid ${C.border}` }}>
        Basic Information
      </div>
      {inp('Venue Name', 'name', { required: true, placeholder: 'e.g. Grand Convention Center' })}

      {/* City dropdown */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          City <span style={{ color: C.red }}>*</span>
        </label>
        <select
          value={form.cityId}
          onChange={(e) => setForm({ ...form, cityId: e.target.value })}
          style={{ width: '100%', background: C.panel, border: `1px solid ${errors.cityId ? C.red : C.border}`, borderRadius: '10px', color: form.cityId ? C.text : C.muted, fontSize: '13px', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
        >
          <option value="">Select a city...</option>
          {cities.filter((c) => c.isActive).map((city) => (
            <option key={city.id} value={city.id}>{city.name}{city.state ? `, ${city.state}` : ''}</option>
          ))}
        </select>
        {errors.cityId && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{errors.cityId}</p>}
      </div>

      {/* Address */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Address <span style={{ color: C.red }}>*</span>
        </label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Full venue address..."
          style={{ width: '100%', background: C.panel, border: `1px solid ${errors.address ? C.red : C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        {errors.address && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{errors.address}</p>}
      </div>

      {/* Capacity */}
      <div style={{ color: C.gold, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 10px', paddingBottom: '6px', borderBottom: `1px solid ${C.border}` }}>
        Capacity & Location
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {inp('Max Capacity', 'capacity', { required: true, type: 'number', placeholder: '100' })}
        {inp('Latitude', 'latitude', { type: 'number', placeholder: 'e.g. 19.0760' })}
        {inp('Longitude', 'longitude', { type: 'number', placeholder: 'e.g. 72.8777' })}
      </div>

      {/* isActive (edit only) */}
      {initial.id && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: C.gold }} />
            <span style={{ color: C.muted, fontSize: '13px' }}>Venue is <strong style={{ color: form.isActive ? C.green : C.red }}>{form.isActive ? 'Active' : 'Inactive'}</strong></span>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px' }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.borderGold}`, background: C.goldDim, color: C.gold, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : initial.id ? 'Update Venue' : 'Create Venue'}
        </button>
      </div>
    </form>
  );
}

function DeleteModal({ venue, loading, onConfirm, onCancel }) {
  if (!venue) return null;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.redDim, border: `1px solid ${C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Trash2 size={22} color={C.red} />
      </div>
      <h4 style={{ color: C.text, margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px' }}>Delete Venue?</h4>
      <p style={{ color: C.muted, fontSize: '13px', marginBottom: '22px' }}>
        Are you sure you want to delete <strong style={{ color: C.red }}>{venue.name}</strong>?<br />This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={onCancel} disabled={loading} style={{ padding: '10px 22px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 22px', borderRadius: '10px', border: `1px solid ${C.red}`, background: C.redDim, color: C.red, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Deleting...' : 'Delete Venue'}
        </button>
      </div>
    </div>
  );
}

export default function VenuesPage() {
  const { showToast } = useToast();
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [venuesRes, citiesRes] = await Promise.all([venueService.getVenues(), cityService.getCities()]);
      setVenues(Array.isArray(venuesRes?.data) ? venuesRes.data : []);
      setCities(Array.isArray(citiesRes?.data) ? citiesRes.data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = venues.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.name?.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q) || v.city?.name?.toLowerCase().includes(q);
  });

  const stats = [
    { label: 'Total', value: venues.length, color: C.purple, bg: C.purpleDim, border: C.purple },
    { label: 'Active', value: venues.filter((v) => v.isActive).length, color: C.green, bg: C.greenDim, border: C.green },
    { label: 'Total Capacity', value: venues.reduce((s, v) => s + (v.capacity || 0), 0).toLocaleString('en-IN'), color: C.gold, bg: C.goldDim, border: C.borderGold },
  ];

  const handleCreate = async (data) => {
    setActionLoading(true);
    try {
      await venueService.createVenue(data);
      showToast('Venue created successfully.', 'success');
      setCreateOpen(false);
      fetchData();
    } catch (err) { showToast(err?.message || 'Unable to create venue.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleEdit = async (data) => {
    setActionLoading(true);
    try {
      await venueService.updateVenue(editTarget.id, data);
      showToast('Venue updated successfully.', 'success');
      setEditTarget(null);
      fetchData();
    } catch (err) { showToast(err?.message || 'Unable to update venue.', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await venueService.deleteVenue(deleteTarget.id);
      showToast('Venue deleted successfully.', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (err) { showToast(err?.message || 'Unable to delete venue.', 'error'); }
    finally { setActionLoading(false); }
  };

  const col = { padding: '13px 16px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' };

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <MasterDataHeader
        icon={<Building2 size={18} color={C.gold} />}
        title="Venue Management"
        subtitle="Manage event venues across the platform."
        onAdd={() => setCreateOpen(true)}
        addLabel="Add Venue"
        onRefresh={fetchData}
        refreshing={loading}
        search={search}
        onSearch={setSearch}
        placeholder="Search by venue name, address, or city..."
        showClear={!!search}
        onClear={() => setSearch('')}
        stats={!loading ? stats : []}
      />

      {error && !loading && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.red, fontSize: '14px' }}>{error}</span>
          <button onClick={fetchData} style={{ background: C.red, border: 'none', borderRadius: '8px', color: '#000', padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <p style={{ color: C.faint, fontSize: '12px', margin: '0 0 12px' }}>
          Showing {filtered.length} of {venues.length} venue{venues.length !== 1 ? 's' : ''}
          {search && <> matching "<span style={{ color: C.purple }}>{search}</span>"</>}
        </p>
      )}

      <div style={{ borderRadius: '16px', border: `1px solid ${C.border}`, background: C.panel, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.05)', borderBottom: `1px solid rgba(139,92,246,0.3)` }}>
              {['Venue', 'City', 'Address', 'Capacity', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', color: C.purple, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', border: `2px solid ${C.purple}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Loading venues...
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <Building2 size={36} color={C.faint} style={{ display: 'block', margin: '0 auto 12px' }} />
                {search ? 'No venues match your search.' : 'No venues found. Click "Add Venue" to create one.'}
              </td></tr>
            ) : filtered.map((venue, idx) => (
              <tr key={venue.id} style={{ borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}>
                <td style={col}><strong style={{ color: C.purple }}>{venue.name}</strong></td>
                <td style={{ ...col }}>
                  {venue.city ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color={C.blue} />
                      <span style={{ color: C.blue }}>{venue.city.name}</span>
                    </div>
                  ) : <span style={{ color: C.faint }}>—</span>}
                </td>
                <td style={{ ...col, color: C.muted, maxWidth: '200px', fontSize: '12px' }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{venue.address}</span>
                </td>
                <td style={{ ...col, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <Users size={12} color={C.gold} />
                    <span style={{ color: C.gold, fontWeight: 600 }}>{venue.capacity?.toLocaleString('en-IN')}</span>
                  </div>
                </td>
                <td style={col}>
                  {venue.isActive
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: C.greenDim, border: `1px solid ${C.green}`, color: C.green, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}><CheckCircle size={10} /> Active</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: C.redDim, border: `1px solid ${C.red}`, color: C.red, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}><XCircle size={10} /> Inactive</span>}
                </td>
                <td style={{ ...col, color: C.faint, fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(venue.createdAt)}</td>
                <td style={col}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditTarget(venue)} style={{ background: C.blueDim, border: `1px solid ${C.borderBlue}`, borderRadius: '8px', color: C.blue, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(venue)} style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', color: C.red, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Venue" maxWidth="600px">
        <VenueForm cities={cities} loading={actionLoading} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit: ${editTarget?.name || ''}`} maxWidth="600px">
        {editTarget && <VenueForm initial={editTarget} cities={cities} loading={actionLoading} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />}
      </Modal>
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Deletion">
        <DeleteModal venue={deleteTarget} loading={actionLoading} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
