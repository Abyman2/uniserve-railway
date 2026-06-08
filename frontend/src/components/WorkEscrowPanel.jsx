import React, { useState, useEffect } from 'react';
import { Upload, Wallet, FileCheck, Download, Plus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiFetch } from '../api';

export default function WorkEscrowPanel({ booking, role, onPaymentComplete }) {
  const { token, user, refreshUser } = useAuth();
  const { notify } = useNotification();

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [depositing, setDepositing] = useState(false);

  const currentPayStatus = booking?.paymentStatus || 'UNPAID';

  // Fetch delivery files
  useEffect(() => {
    if (!booking?.id || !token) return;
    apiFetch(`/api/bookings/${booking.id}/delivery`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      if (res.ok) setFiles(await res.json());
    }).catch(() => {});
  }, [booking?.id, token]);

  if (!booking || !['ACCEPTED', 'COMPLETED', 'PENDING'].includes(booking.status)) return null;

  // Pay into escrow
  const handlePay = async () => {
    setPaying(true); setPayError('');
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}/pay`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        notify('Funds escrowed', `${booking.price} ETB held by UniServe`, 'booking');
        refreshUser();
        onPaymentComplete?.();
      } else {
        const d = await res.json().catch(() => ({}));
        setPayError(d.message || 'Payment failed');
      }
    } catch { setPayError('Network error'); }
    finally { setPaying(false); }
  };

  // Deposit fake money
  const handleDeposit = async () => {
    setDepositing(true);
    try {
      const res = await apiFetch('/api/users/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: 500 }),
      });
      if (res.ok) { notify('Deposit done', '500 ETB added to your wallet', 'info'); refreshUser(); }
    } catch { /* ignore */ }
    finally { setDepositing(false); }
  };

  // Upload delivery file
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const f = await res.json();
        setFiles((prev) => [...prev, f]);
        notify('File delivered', `${file.name} uploaded`, 'booking');
      }
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const downloadUrl = (fileId) =>
    `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/bookings/${booking.id}/delivery/download/${fileId}`;

  return (
    <div className="work-escrow-panel">
      <h4><FileCheck size={16} /> Work & Payment</h4>

      {/* Wallet balance row */}
      {user && (
        <div className="wallet-row">
          <Wallet size={14} />
          <span>Balance:</span>
          <span className="wallet-balance">{Number(user.balance || 0).toFixed(2)} ETB</span>
          {role === 'customer' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDeposit}
              disabled={depositing}
              style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
            >
              {depositing ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
              Deposit 500 ETB
            </button>
          )}
        </div>
      )}

      {/* Customer: pay button */}
      {role === 'customer' && (
        <div className="escrow-row" style={{ marginBottom: '0.75rem' }}>
          {currentPayStatus === 'UNPAID' ? (
            <button className="btn btn-primary btn-sm" onClick={handlePay} disabled={paying}>
              {paying
                ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                : <Wallet size={14} />
              }
              {paying ? 'Processing...' : `Pay ${booking.price} ETB to platform`}
            </button>
          ) : (
            <span className={`status-badge status-${currentPayStatus.toLowerCase()}`}>
              {currentPayStatus === 'ESCROWED' && '🔒 Funds in escrow'}
              {currentPayStatus === 'RELEASED' && '✅ Payment released to provider'}
              {currentPayStatus === 'REFUNDED' && '↩ Payment refunded to you'}
            </span>
          )}
        </div>
      )}

      {payError && <div className="alert-error" style={{ marginBottom: '0.5rem' }}>{payError}</div>}

      {/* Provider: file upload */}
      {role === 'provider' && (
        <label
          className="drop-zone"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={dragging ? { borderColor: 'var(--violet)', background: 'var(--violet-dim)' } : {}}
        >
          {uploading
            ? <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
            : <Upload size={22} />
          }
          <span style={{ fontSize: '0.83rem' }}>
            {uploading ? 'Uploading...' : 'Drag & drop or click to upload finished work'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>PDF, ZIP, PNG, JPG — max 10 MB</span>
          <input type="file" hidden onChange={(e) => handleFileUpload(e.target.files?.[0])} />
        </label>
      )}

      {/* Delivered files list (visible to both) */}
      {files.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '0.4rem', fontWeight: 600 }}>DELIVERED FILES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {files.map((f) => (
              <a
                key={f.id}
                href={downloadUrl(f.id)}
                target="_blank"
                rel="noreferrer"
                download={f.fileName}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', gap: '0.5rem', textDecoration: 'none' }}
              >
                <Download size={13} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.fileName}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}