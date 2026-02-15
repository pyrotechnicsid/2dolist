import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import './ShareModal.css';

function ShareModal({ listId, listName, onClose }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('edit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShares = useCallback(async () => {
    try {
      const data = await api.getShares(listId);
      setShares(data.shares);
    } catch (err) {
      console.error('Failed to fetch shares:', err);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => { fetchShares(); }, [fetchShares]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await api.shareList(listId, email.trim(), permission);
      setSuccess(`Shared with ${data.share.display_name || data.share.email}`);
      setEmail('');
      fetchShares();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId, displayName) => {
    if (!window.confirm(`Remove ${displayName} from this list?`)) return;
    try {
      await api.unshare(listId, userId);
      setShares((prev) => prev.filter((s) => s.user_id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sm-header">
          <div>
            <h2 className="sm-title">Share list</h2>
            <p className="sm-subtitle">{listName}</p>
          </div>
          <button className="sm-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Invite form */}
        <form className="sm-invite" onSubmit={handleShare}>
          <div className="sm-invite-row">
            <input
              type="email" placeholder="Enter email address"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess(''); }}
              required
            />
            <select value={permission} onChange={(e) => setPermission(e.target.value)}>
              <option value="edit">Can edit</option>
              <option value="view">View only</option>
            </select>
            <button type="submit" className="sm-invite-btn" disabled={submitting || !email.trim()}>
              {submitting ? '...' : 'Share'}
            </button>
          </div>
          {error && <div className="sm-error">{error}</div>}
          {success && <div className="sm-success">{success}</div>}
        </form>

        {/* Collaborators list */}
        <div className="sm-collabs">
          <h3 className="sm-collabs-title">
            Collaborators {shares.length > 0 && `(${shares.length})`}
          </h3>
          {loading ? (
            <div className="sm-loading">Loading...</div>
          ) : shares.length === 0 ? (
            <div className="sm-empty">No collaborators yet. Share this list with someone!</div>
          ) : (
            <div className="sm-collab-list">
              {shares.map((s) => (
                <div key={s.id} className="sm-collab-item">
                  <div className="sm-collab-avatar">
                    {(s.display_name || s.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="sm-collab-info">
                    <span className="sm-collab-name">{s.display_name}</span>
                    <span className="sm-collab-email">{s.email}</span>
                  </div>
                  <span className="sm-collab-perm">{s.permission}</span>
                  <button
                    className="sm-collab-remove"
                    onClick={() => handleRemove(s.user_id, s.display_name)}
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
