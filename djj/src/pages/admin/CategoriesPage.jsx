import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { categoryService } from '../../services/admin/categoryService.js';
import { useToast } from '../../hooks/useToast.js';
import { Modal } from '../../components/common/Modal.jsx';
import { MasterDataHeader } from '../../components/admin/MasterDataHeader.jsx';
import { formatDate } from '../../utils/formatters.js';

// ── Inline form ──────────────────────────────────────────────
function CategoryForm({ initial = {}, loading, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    icon: initial.icon || '',
    isActive: initial.isActive !== undefined ? initial.isActive : true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;
    onSubmit(form);
  };

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{opts.required && <span style={{ color: C.red }}> *</span>}
      </label>
      {opts.textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          placeholder={opts.placeholder}
          style={{ width: '100%', background: C.panel, border: `1px solid ${errors[key] ? C.red : C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={opts.placeholder}
          style={{ width: '100%', background: C.panel, border: `1px solid ${errors[key] ? C.red : C.border}`, borderRadius: '10px', color: C.text, fontSize: '13px', padding: '10px 12px', fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box' }}
        />
      )}
      {errors[key] && <p style={{ color: C.red, fontSize: '11px', margin: '4px 0 0' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {field('Category Name', 'name', { required: true, placeholder: 'e.g. Music & Concerts' })}
      {field('Description', 'description', { placeholder: 'Brief description of this category...', textarea: true })}
      {field('Icon (emoji or icon name)', 'icon', { placeholder: 'e.g. 🎵 or music-note' })}

      {/* isActive toggle — only for edit */}
      {initial.id && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: C.gold }}
            />
            <span style={{ color: C.muted, fontSize: '13px' }}>
              Category is <strong style={{ color: form.isActive ? C.green : C.red }}>{form.isActive ? 'Active' : 'Inactive'}</strong>
            </span>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.borderGold}`, background: C.goldDim, color: C.gold, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : initial.id ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

// ── Delete modal ─────────────────────────────────────────────
function DeleteModal({ category, loading, onConfirm, onCancel }) {
  if (!category) return null;
  return (
    <div style={{ textAlign: 'center', padding: '4px 0 0' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: C.redDim, border: `1px solid ${C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Trash2 size={22} color={C.red} />
      </div>
      <h4 style={{ color: C.text, margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px' }}>
        Delete Category?
      </h4>
      <p style={{ color: C.muted, fontSize: '13px', marginBottom: '22px' }}>
        Are you sure you want to delete <strong style={{ color: C.red }}>{category.name}</strong>?
        <br />This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={onCancel} disabled={loading} style={{ padding: '10px 22px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 22px', borderRadius: '10px', border: `1px solid ${C.red}`, background: C.redDim, color: C.red, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch ──
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
      setCategories(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Filter ──
  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
  });

  const stats = [
    { label: 'Total', value: categories.length, color: C.gold, bg: C.goldDim, border: C.borderGold },
    { label: 'Active', value: categories.filter((c) => c.isActive).length, color: C.green, bg: C.greenDim, border: C.green },
    { label: 'Inactive', value: categories.filter((c) => !c.isActive).length, color: C.red, bg: C.redDim, border: C.red },
  ];

  // ── CRUD ──
  const handleCreate = async (data) => {
    setActionLoading(true);
    try {
      await categoryService.createCategory(data);
      showToast('Category created successfully.', 'success');
      setCreateOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err?.message || 'Unable to create category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setActionLoading(true);
    try {
      await categoryService.updateCategory(editTarget.id, data);
      showToast('Category updated successfully.', 'success');
      setEditTarget(null);
      fetchCategories();
    } catch (err) {
      showToast(err?.message || 'Unable to update category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      showToast('Category deleted successfully.', 'success');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      showToast(err?.message || 'Unable to delete category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const col = { padding: '13px 16px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' };

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <MasterDataHeader
        icon={<Tag size={18} color={C.gold} />}
        title="Category Management"
        subtitle="Manage event categories used throughout the platform."
        onAdd={() => setCreateOpen(true)}
        addLabel="Add Category"
        onRefresh={fetchCategories}
        refreshing={loading}
        search={search}
        onSearch={setSearch}
        placeholder="Search by name, slug, or description..."
        showClear={!!search}
        onClear={() => setSearch('')}
        stats={!loading ? stats : []}
      />

      {/* Error state */}
      {error && !loading && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.red, fontSize: '14px' }}>{error}</span>
          <button onClick={fetchCategories} style={{ background: C.red, border: 'none', borderRadius: '8px', color: '#000', padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Retry</button>
        </div>
      )}

      {/* Summary line */}
      {!loading && !error && (
        <p style={{ color: C.faint, fontSize: '12px', margin: '0 0 12px' }}>
          Showing {filtered.length} of {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          {search && <> matching "<span style={{ color: C.gold }}>{search}</span>"</>}
        </p>
      )}

      {/* Table */}
      <div style={{ borderRadius: '16px', border: `1px solid ${C.border}`, background: C.panel, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,215,0,0.05)', borderBottom: `1px solid ${C.borderGold}` }}>
              {['Category', 'Slug', 'Description', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', color: C.gold, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', border: `2px solid ${C.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Loading categories...
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: C.muted }}>
                <Tag size={36} color={C.faint} style={{ display: 'block', margin: '0 auto 12px' }} />
                {search ? 'No categories match your search.' : 'No categories found. Click "Add Category" to create one.'}
              </td></tr>
            ) : filtered.map((cat, idx) => (
              <tr key={cat.id} style={{ borderBottom: idx === filtered.length - 1 ? 'none' : `1px solid ${C.border}`, transition: 'background 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}>
                <td style={col}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cat.icon && <span style={{ fontSize: '18px' }}>{cat.icon}</span>}
                    <span style={{ color: C.gold, fontWeight: 700 }}>{cat.name}</span>
                  </div>
                </td>
                <td style={{ ...col, color: C.faint, fontFamily: 'monospace', fontSize: '12px' }}>{cat.slug}</td>
                <td style={{ ...col, color: C.muted, maxWidth: '260px' }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat.description || <span style={{ color: C.faint, fontStyle: 'italic' }}>No description</span>}
                  </span>
                </td>
                <td style={col}>
                  {cat.isActive
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: C.greenDim, border: `1px solid ${C.green}`, color: C.green, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}><CheckCircle size={10} /> Active</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: C.redDim, border: `1px solid ${C.red}`, color: C.red, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}><XCircle size={10} /> Inactive</span>}
                </td>
                <td style={{ ...col, color: C.faint, fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(cat.createdAt)}</td>
                <td style={col}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditTarget(cat)} style={{ background: C.blueDim, border: `1px solid ${C.borderBlue}`, borderRadius: '8px', color: C.blue, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', color: C.red, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Category">
        <CategoryForm loading={actionLoading} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit: ${editTarget?.name || ''}`}>
        {editTarget && <CategoryForm initial={editTarget} loading={actionLoading} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Deletion">
        <DeleteModal category={deleteTarget} loading={actionLoading} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
