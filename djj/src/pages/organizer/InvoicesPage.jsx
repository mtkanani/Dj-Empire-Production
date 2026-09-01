import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Eye, Download, Printer } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { organizerBookingService } from '../../services/organizer/organizerBookingService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await organizerBookingService.getOrganizerBookings({ limit: 100 });
        const data = res.data || res;
        const list = Array.isArray(data) ? data : data.bookings || [];
        setBookings(list.filter((b) => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'CheckedIn'));
      } catch (err) {
        setError(err.message || 'Unable to load tax invoices.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = bookings.filter((b) =>
    !search ||
    (b.bookingNumber && b.bookingNumber.toLowerCase().includes(search.toLowerCase())) ||
    (b.customer?.firstName && b.customer.firstName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0, color: C.text }}>
          Tax Invoices & Financial Receipts
        </h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Inspect generated GST tax invoices, line items, and downloadable financial receipts
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ position: 'relative', width: '280px' }}>
        <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search by Invoice or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 12px 8px 36px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading tax invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', color: C.muted }}>
          <FileText size={42} color={C.muted} style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            No Tax Invoices
          </h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Tax invoices will generate automatically upon confirmed booking payment.</p>
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '14px 16px' }}>Invoice Ref</th>
                <th style={{ padding: '14px 16px' }}>Customer Name</th>
                <th style={{ padding: '14px 16px' }}>Subtotal</th>
                <th style={{ padding: '14px 16px' }}>GST Tax (18%)</th>
                <th style={{ padding: '14px 16px' }}>Total Amount</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((b) => {
                const subtotal = b.subtotal || b.totalAmount * 0.8475;
                const gst = b.gstAmount || b.totalAmount - subtotal;

                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 16px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                      #INV-{b.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.text, fontWeight: 600 }}>
                      {b.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName}` : 'Customer'}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>
                      {formatCurrency(subtotal, b.currency)}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.muted }}>
                      {formatCurrency(gst, b.currency)}
                    </td>
                    <td style={{ padding: '14px 16px', color: C.gold, fontWeight: 700 }}>
                      {formatCurrency(b.totalAmount, b.currency)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/invoices/${b.id}`)}
                        style={{ background: C.goldDim, border: `1px solid ${C.borderGold}`, borderRadius: '8px', color: C.gold, padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> View Tax Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
