import React, { useEffect, useState } from 'react';
import '../styles/LeaveList.css';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiSearch,
  FiX,
  FiUser,
  FiBriefcase,
  FiFilter,
  FiChevronDown,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Completing Tasks.json';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const UPDATE_STATUS_API = `${BASE_URL}/update-Leave-status`;

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    icon: <FiCheckCircle />,
    cls: 'status--approved',
  },
  pending: { label: 'Pending', icon: <FiClock />, cls: 'status--pending' },
  rejected: { label: 'Rejected', icon: <FiXCircle />, cls: 'status--rejected' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function leaveTypeClass(type) {
  if (!type) return 'default';
  const t = type.toUpperCase();
  if (t === 'LOP') return 'lop';
  if (t === 'CASUAL') return 'casual';
  if (t === 'SICK') return 'sick';
  if (t === 'EARNED') return 'earned';
  return 'default';
}

/* ── Reason cell: show first 15 words, "Read more" for the rest ── */
function ReasonCell({ text, onReadMore }) {
  if (!text) return <span className="ll-reason-empty">—</span>;
  const words = text.trim().split(/\s+/);
  if (words.length <= 10) {
    return <div className="ll-reason-text">{text}</div>;
  }
  const preview = words.slice(0, 10).join(' ');
  return (
    <div className="ll-reason-text">
      {preview}…{' '}
      <button className="ll-read-more-btn" onClick={() => onReadMore(text)}>
        Read more
      </button>
    </div>
  );
}

/* ── Modal ── */
function ReasonModal({ text, onClose }) {
  if (!text) return null;
  return (
    <div className="ll-modal-overlay" onClick={onClose}>
      <div className="ll-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ll-modal-header">
          <span className="ll-modal-title">Leave Reason</span>
          <button className="ll-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="ll-modal-body">{text}</div>
      </div>
    </div>
  );
}

export default function LeaveList() {
  const [leaves, setLeaves] = useState([]);
  const [meta, setMeta] = useState({ month: '', total: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${BASE_URL}/leave-list?user_id=${dateFilter.user_id}&month=${dateFilter.month}&year=${dateFilter.year}`
        );
        const json = await res.json();
        if (json.success) {
          setLeaves(json.data);
          setMeta({ month: json.month, total: json.total_leaves });
        } else {
          setError('Failed to load leave records.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, [dateFilter]);

  const updateStatus = async (leaveId, newStatus) => {
    if (updatingId) return;
    try {
      setUpdatingId(leaveId);
      const token = localStorage.getItem('token');
      const res = await fetch(UPDATE_STATUS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leave_id: leaveId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l))
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = leaves.filter((l) => {
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    const search = searchTerm.trim().replace(/\s+/g, ' ').toLowerCase();
    const name = (l.name || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const empid = (l.empid || '').toLowerCase();
    return matchStatus && (name.includes(search) || empid.includes(search));
  });

  const counts = {
    all: leaves.length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  function formatDuration(duration) {
    const d = parseFloat(duration);
    if (d === 0.5) return 'Half Day';
    if (d % 1 === 0) return `${d} Day${d > 1 ? 's' : ''}`;
    if (d % 1 === 0.5) {
      const fullDays = Math.floor(d);
      return `${fullDays} Day${fullDays > 1 ? 's' : ''} + Half Day`;
    }
    return duration;
  }

  function formatHalfDay(halfday) {
    if (!halfday) return '—';
    return halfday.charAt(0).toUpperCase() + halfday.slice(1);
  }

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1];
  };

  return (
    <div className="ll-container">
      {/* ── REASON MODAL ── */}
      <ReasonModal text={modalText} onClose={() => setModalText(null)} />

      {/* ── HERO SECTION ── */}
      <div className="ll-hero">
        <div className="ll-hero-content">
          <div className="ll-hero-icon">
            <Lottie animationData={animationData} style={{ width: "56px", height: "56px" }} />
          </div>
          <div>
            <div className="ll-hero-badge">Leave Management</div>
            <h1 className="ll-hero-title">Time Off Requests</h1>
            <p className="ll-hero-subtitle">
              {getMonthName(dateFilter.month)} {dateFilter.year} · {meta.total} request{meta.total !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <div className="ll-hero-stats">
          <div className="ll-hero-stat">
            <span className="ll-hero-stat-value">{counts.all}</span>
            <span className="ll-hero-stat-label">Total</span>
          </div>
          <div className="ll-hero-stat">
            <span className="ll-hero-stat-value">{counts.approved}</span>
            <span className="ll-hero-stat-label">Approved</span>
          </div>
          <div className="ll-hero-stat">
            <span className="ll-hero-stat-value">{counts.pending}</span>
            <span className="ll-hero-stat-label">Pending</span>
          </div>
          <div className="ll-hero-stat">
            <span className="ll-hero-stat-value">{counts.rejected}</span>
            <span className="ll-hero-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="ll-toolbar">
        <div className="ll-toolbar-left">
          <div className="ll-search-box">
            <FiSearch className="ll-search-icon" />
            <input
              type="text"
              className="ll-search-input"
              placeholder="Search by name or employee ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ll-search-clear" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <button 
            className={`ll-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
            {filterStatus !== "all" && (
              <span className="ll-filter-count">1</span>
            )}
          </button>
        </div>

        <div className="ll-toolbar-right">
          <button
            className="ll-refresh-btn"
            onClick={() =>
              setDateFilter({ user_id: '', month: currentMonth, year: currentYear })
            }
            title="Refresh"
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      {showFilters && (
        <div className="ll-filter-bar">
          <div className="ll-filter-row ll-filter-row--date">
            <div className="ll-filter-group">
              <label>Month</label>
              <select name="month" value={dateFilter.month} onChange={handleDate}>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="ll-filter-group">
              <label>Year</label>
              <select name="year" value={dateFilter.year} onChange={handleDate}>
                {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ll-filter-row ll-filter-row--status">
            <span className="ll-filter-label">Status:</span>
            {['all', 'approved', 'pending', 'rejected'].map((s) => (
              <button
                key={s}
                className={`ll-filter-chip ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ll-filter-chip-count">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && leaves.length === 0 && (
        <div className="ll-loader">
          <div className="ll-loader-ring"></div>
          <span>Loading leave records…</span>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="ll-error">
          <FiAlertCircle />
          <span>{error}</span>
          <button
            className="ll-error-btn"
            onClick={() =>
              setDateFilter({ user_id: '', month: currentMonth, year: currentYear })
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* ── RESULTS COUNT ── */}
      {!loading && !error && leaves.length > 0 && (
        <div className="ll-results-count">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          {filterStatus !== "all" && (
            <span className="ll-results-filter">
              · Filtered by {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </span>
          )}
          {searchTerm && (
            <span className="ll-results-filter">
              · Search: "{searchTerm}"
            </span>
          )}
        </div>
      )}

      {/* ── TABLE ── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="ll-empty-state">
              <div className="ll-empty-icon">
                <FiCalendar />
              </div>
              <h3>No requests found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="ll-table-wrapper">
              <div className="ll-table-scroll">
                <table className="ll-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Request ID</th>
                      <th>Employee</th>
                      <th>Leave Date</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Applied</th>
                      <th>Duration</th>
                      <th>Session</th>
                      <th>Status</th>
                      <th className="ll-txt-center">Actions</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((leave, idx) => {
                      const sc = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
                      const isUpdating = updatingId === leave.id;

                      return (
                        <tr key={leave.id} className="ll-row">
                          <td className="ll-col-index">{idx + 1}</td>

                          <td>
                            <span className="ll-id-badge">#{leave.id}</span>
                          </td>

                          <td>
                            <div className="ll-employee-info">
                              <div className="ll-employee-avatar">
                                {leave.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="ll-employee-name">{leave.name}</div>
                                <div className="ll-employee-id">{leave.empid}</div>
                              </div>
                            </div>
                          </td>

                          <td className="ll-col-date">{formatDate(leave.leave_date)}</td>

                          <td>
                            <span className={`ll-type-badge ${leaveTypeClass(leave.leave_type)}`}>
                              {leave.leave_type || '—'}
                            </span>
                          </td>

                          <td className="ll-reason-cell">
                            <ReasonCell
                              text={leave.reason}
                              onReadMore={(t) => setModalText(t)}
                            />
                          </td>

                          <td className="ll-col-applied">{formatDateTime(leave.created_at)}</td>

                          <td className="ll-col-duration">{formatDuration(leave.duration)}</td>

                          <td>{formatHalfDay(leave.half_day)}</td>

                          <td>
                            <span className={`ll-status-badge ${sc.cls}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>

                          <td className="ll-txt-center">
                            {leave.status === 'pending' ? (
                              <select
                                className="ll-action-select"
                                value={leave.status || 'pending'}
                                disabled={isUpdating}
                                onChange={(e) => updateStatus(leave.id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                              </select>
                            ) : (
                              <span className="ll-action-fixed">
                                {sc.icon} {sc.label}
                              </span>
                            )}
                          </td>

                          <td>
                            <span className="ll-approved-badge">
                              {leave.approved_position || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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