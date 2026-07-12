import React, { useState, useEffect } from 'react';
import '../styles/PermissionList.css';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiSearch,
  FiX,
  FiUser,
  FiFilter,
  FiCalendar,
  FiBriefcase,
} from 'react-icons/fi';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Allow Permission.json';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    icon: <FiCheckCircle />,
    cls: 'pl-status-approved',
  },
  pending: { label: 'Pending', icon: <FiClock />, cls: 'pl-status-pending' },
  rejected: {
    label: 'Rejected',
    icon: <FiXCircle />,
    cls: 'pl-status-rejected',
  },
};

/* ── Reason cell: show first 15 words, "Read more" for the rest ── */
function ReasonCell({ text, onReadMore }) {
  if (!text) return <span className="pl-reason-empty">—</span>;
  const words = text.trim().split(/\s+/);
  if (words.length <= 10) {
    return <div className="pl-reason-text">{text}</div>;
  }
  const preview = words.slice(0, 10).join(' ');
  return (
    <div className="pl-reason-text">
      {preview}…{' '}
      <button className="pl-read-more-btn" onClick={() => onReadMore(text)}>
        Read more
      </button>
    </div>
  );
}

/* ── Modal ── */
function ReasonModal({ text, onClose }) {
  if (!text) return null;
  return (
    <div className="pl-modal-overlay" onClick={onClose}>
      <div className="pl-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="pl-modal-header">
          <span className="pl-modal-title">Permission Reason</span>
          <button className="pl-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="pl-modal-body">{text}</div>
      </div>
    </div>
  );
}

export default function PermissionList() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [modalText, setModalText] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = now.getFullYear();

  const [dateFilter, setDateFilter] = useState({
    user_id: '',
    month: currentMonth,
    year: currentYear,
  });

  const monthOptions = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const handleDate = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  const updateStatus = async (id, newStatus) => {
    if (updatingId) return;
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/approve-permission/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${BASE_URL}/premissionlist?user_id=${dateFilter.user_id}&month=${dateFilter.month}&year=${dateFilter.year}`
        );
        const json = await res.json();
        if (json.success) {
          setPermissions(json.data || []);
        } else {
          setError('Failed to fetch permission list');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [dateFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '00:00:00') return '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const filtered = permissions.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const search = searchTerm.trim().replace(/\s+/g, ' ').toLowerCase();
    const name = (p.name || '').trim().replace(/\s+/g, ' ').toLowerCase();
    return matchesStatus && name.includes(search);
  });

  const counts = {
    all: permissions.length,
    approved: permissions.filter((p) => p.status === 'approved').length,
    pending: permissions.filter((p) => p.status === 'pending').length,
    rejected: permissions.filter((p) => p.status === 'rejected').length,
  };

  const formatMinutes = (minutes) => {
    const totalMinutes = Math.round(parseFloat(minutes));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1];
  };

  return (
    <div className="pl-container">
      {/* ── REASON MODAL ── */}
      <ReasonModal text={modalText} onClose={() => setModalText(null)} />

      {/* ── HERO SECTION ── */}
      <div className="pl-hero">
        <div className="pl-hero-content">
          <div className="pl-hero-icon">
            <Lottie animationData={animationData} style={{ width: "56px", height: "56px" }} />
          </div>
          <div>
            <div className="pl-hero-badge">Permission Management</div>
            <h1 className="pl-hero-title">Time Off Requests</h1>
            <p className="pl-hero-subtitle">
              {getMonthName(dateFilter.month)} {dateFilter.year} · {counts.all} request{counts.all !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <div className="pl-hero-stats">
          <div className="pl-hero-stat">
            <span className="pl-hero-stat-value">{counts.all}</span>
            <span className="pl-hero-stat-label">Total</span>
          </div>
          <div className="pl-hero-stat">
            <span className="pl-hero-stat-value">{counts.approved}</span>
            <span className="pl-hero-stat-label">Approved</span>
          </div>
          <div className="pl-hero-stat">
            <span className="pl-hero-stat-value">{counts.pending}</span>
            <span className="pl-hero-stat-label">Pending</span>
          </div>
          <div className="pl-hero-stat">
            <span className="pl-hero-stat-value">{counts.rejected}</span>
            <span className="pl-hero-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="pl-toolbar">
        <div className="pl-toolbar-left">
          <div className="pl-search-box">
            <FiSearch className="pl-search-icon" />
            <input
              type="text"
              className="pl-search-input"
              placeholder="Search by name or reason…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="pl-search-clear" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <button 
            className={`pl-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
            {filterStatus !== "all" && (
              <span className="pl-filter-count">1</span>
            )}
          </button>
        </div>

        <div className="pl-toolbar-right">
          <button
            className="pl-refresh-btn"
            onClick={() =>
              setDateFilter({ user_id: '', month: currentMonth, year: currentYear })
            }
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      {showFilters && (
        <div className="pl-filter-bar">
          <div className="pl-filter-row pl-filter-row--date">
            <div className="pl-filter-group">
              <label>Month</label>
              <select name="month" value={dateFilter.month} onChange={handleDate}>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="pl-filter-group">
              <label>Year</label>
              <select name="year" value={dateFilter.year} onChange={handleDate}>
                {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pl-filter-row pl-filter-row--status">
            <span className="pl-filter-label">Status:</span>
            {['all', 'approved', 'pending', 'rejected'].map((s) => (
              <button
                key={s}
                className={`pl-filter-chip ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="pl-filter-chip-count">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && permissions.length === 0 && (
        <div className="pl-loader">
          <div className="pl-loader-ring"></div>
          <span>Loading permission requests…</span>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="pl-error">
          <FiAlertCircle />
          <span>{error}</span>
          <button
            className="pl-error-btn"
            onClick={() =>
              setDateFilter({ user_id: '', month: currentMonth, year: currentYear })
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* ── RESULTS COUNT ── */}
      {!loading && !error && permissions.length > 0 && (
        <div className="pl-results-count">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          {filterStatus !== "all" && (
            <span className="pl-results-filter">
              · Filtered by {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </span>
          )}
          {searchTerm && (
            <span className="pl-results-filter">
              · Search: "{searchTerm}"
            </span>
          )}
        </div>
      )}

      {/* ── TABLE ── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="pl-empty-state">
              <div className="pl-empty-icon">
                <FiCalendar />
              </div>
              <h3>No requests found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="pl-table-wrapper">
              <div className="pl-table-scroll">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Request ID</th>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th className="pl-txt-center">Actions</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((p, idx) => {
                        const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={p.id}>
                            <td className="pl-col-index">{idx + 1}</td>

                            <td>
                              <span className="pl-id-badge">#{p.id}</span>
                            </td>

                            <td>
                              <div className="pl-employee-info">
                                <div className="pl-employee-avatar">
                                  {p.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="pl-employee-name">{p.name}</span>
                              </div>
                            </td>

                            <td className="pl-col-date">{formatDate(p.attendance_date)}</td>

                            <td>
                              <span className="pl-time-badge">
                                {formatTime(p.start_time)} – {formatTime(p.end_time)}
                              </span>
                            </td>

                            <td>
                              <span className="pl-duration-badge">
                                {formatMinutes(p.permission_hours)}
                              </span>
                            </td>

                            <td className="pl-reason-cell">
                              <ReasonCell
                                text={p.reason}
                                onReadMore={(t) => setModalText(t)}
                              />
                            </td>

                            <td>
                              <span className={`pl-status-badge ${sc.cls}`}>
                                {sc.icon} {sc.label}
                              </span>
                            </td>

                            <td className="pl-col-applied">{formatDate(p.created_at)}</td>

                            <td className="pl-txt-center">
                              {p.status === 'pending' ? (
                                <select
                                  className="pl-action-select"
                                  value={p.status}
                                  disabled={updatingId === p.id}
                                  onChange={(e) => updateStatus(p.id, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approve</option>
                                  <option value="rejected">Reject</option>
                                </select>
                              ) : (
                                <span className="pl-action-fixed">
                                  {sc.icon} {sc.label}
                                </span>
                              )}
                            </td>

                            <td>
                              <span className="pl-approved-badge">
                                {p.approved_position || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="11" className="pl-empty-cell">
                          No permission records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}