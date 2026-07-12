import React, { useState, useEffect } from 'react';
import '../styles/RaiseTicket.css';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Ticket.json';
import { IoAdd, IoClose, IoSearch, IoFilter, IoCalendarOutline, IoTimeOutline, IoPersonOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { FiCheckCircle, FiClock, FiXCircle, FiUser, FiMail, FiMapPin } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import { FaRegClock, FaRegCalendarAlt, FaTag, FaInfoCircle } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    type: '',
    time: '',
    reason: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = now.getFullYear();

  const [dateFilter, setDateFilter] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const [raiseTicket, setRaiseTicket] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const STATUS_CONFIG = {
    approved: {
      label: 'Approved',
      icon: <FiCheckCircle />,
      cls: 'status--approved',
    },
    pending: { label: 'Pending', icon: <FiClock />, cls: 'status--pending' },
    rejected: {
      label: 'Rejected',
      icon: <FiXCircle />,
      cls: 'status--rejected',
    },
  };

  // FORMAT TIME
  const formatTime = (timeString) => {
    if (!timeString || timeString === '00:00:00') return '--';
    const [hour, minute] = timeString.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // GET USER INITIALS
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.substring(0, 2).toUpperCase();
  };

  // GET USER COLOR
  const getUserColor = (name) => {
    const colors = ['#4f7af8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  /* ================= FETCH EMPLOYEES ================= */
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await fetch(`${BASE_URL}/employee-List`);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
    setLoadingEmployees(false);
  };

  /* ================= FETCH RAISE TICKET ================= */
  useEffect(() => {
    const fetchRaiseTicket = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/tickets?month=${dateFilter.month}&year=${dateFilter.year}`
        );
        const result = await response.json();
        if (result.success) {
          setRaiseTicket(result.data);
        }
      } catch (error) {
        console.error('Error fetching Raise Ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaiseTicket();
    fetchEmployees();
  }, [activeForm, deleteId, dateFilter, updatingId]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDate = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= RAISE TICKET FORM SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    try {
      const response = await fetch(`${BASE_URL}/ticket/create`, {
        method: 'POST',
        body: submitData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Created successfully!');
        setFormData({ user_id: '', date: '', type: '', time: '', reason: '' });
      } else {
        alert('Failed to create Ticket: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  /* ================= UPDATE TICKET STATUS ================= */
  const handleStatusUpdate = async (id, status) => {
    const submitData = new FormData();
    submitData.append('id', id);
    submitData.append('status', status);
    if (updatingId) return;
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/ticket/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: submitData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Status Updated successfully!');
      } else {
        alert('Failed to Update Ticket Status: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error Updating Ticket Status:', error);
      alert('Error Updating Ticket Status');
    } finally {
      setDeleteId(null);
      setUpdatingId(null);
    }
  };

  /* ================= TICKET DELETE ================= */
  const handleDelete = async (e) => {
    e.preventDefault();
    console.log(deleteId);
    const submitData = new FormData();
    submitData.append('id', deleteId);
    try {
      const response = await fetch(`${BASE_URL}/delete-Holida/${deleteId}`);
      const result = await response.json();
      if (response.ok) {
        console.log(result);
        alert(result.message || 'Ticket Deleted successfully!');
      } else {
        alert('Failed to Delete Ticket: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting Ticket:', error);
      alert('Error deleting Ticket');
    } finally {
      setDeleteId(null);
    }
  };

  /* ================= NOTIFICATION ================= */
  const handleNotification = async (e) => {
    e.preventDefault();
    console.log(notificationId);
    const submitData = new FormData();
    submitData.append('id', notificationId);
    try {
      const response = await fetch(`${BASE_URL}/notification/send`, {
        method: 'POST',
        body: submitData,
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result);
        alert(result.message || 'Notification Send successfully!');
      } else {
        alert('Failed to Send Notification: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error in sending notification:', error);
      alert('Error sending notificaiton');
    } finally {
      setNotificationId(null);
    }
  };

  // Filter tickets
  const filteredTickets = raiseTicket.filter(ticket => {
    const matchesSearch = ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status counts
  const statusCounts = {
    all: raiseTicket.length,
    pending: raiseTicket.filter(t => t.status === 'pending').length,
    approved: raiseTicket.filter(t => t.status === 'approved').length,
    rejected: raiseTicket.filter(t => t.status === 'rejected').length,
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="rt-loading-container">
        <div className="rt-loader-pulse"></div>
        <p className="rt-loading-text">Loading Ticket records...</p>
      </div>
    );
  }

  return (
    <div className="rt-page fade-in-up">

      {/* ── HEADER ── */}
      <div className="rt-page-header">
        <div className="rt-header-left">
          <div className="rt-lottie-wrap">
            <Lottie animationData={animationData} style={{ width: "64px", height: "64px" }} />
          </div>
          <div>
            <h1 className="rt-page-title">Ticket Management</h1>
            <p className="rt-page-sub">
              Raise tickets and monitor their progress to keep everything running smoothly
            </p>
          </div>
        </div>
        <div className="rt-header-right">
          <button
            className="rt-raise-btn"
            onClick={() => setActiveForm((prev) => !prev)}
          >
            <IoAdd className="rt-raise-icon" />
            Raise Ticket
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="rt-stats-grid">
        <div className="rt-stat-card-modern">
          <div className="rt-stat-icon-wrap" style={{ background: '#eef2ff' }}>
            <FiClock style={{ color: '#4f7af8' }} />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-number">{statusCounts.all}</span>
            <span className="rt-stat-label-modern">Total Tickets</span>
          </div>
        </div>
        <div className="rt-stat-card-modern">
          <div className="rt-stat-icon-wrap" style={{ background: '#fef3c7' }}>
            <FiClock style={{ color: '#d97706' }} />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-number">{statusCounts.pending}</span>
            <span className="rt-stat-label-modern">Pending</span>
          </div>
        </div>
        <div className="rt-stat-card-modern">
          <div className="rt-stat-icon-wrap" style={{ background: '#d1fae5' }}>
            <FiCheckCircle style={{ color: '#059669' }} />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-number">{statusCounts.approved}</span>
            <span className="rt-stat-label-modern">Approved</span>
          </div>
        </div>
        <div className="rt-stat-card-modern">
          <div className="rt-stat-icon-wrap" style={{ background: '#fee2e2' }}>
            <FiXCircle style={{ color: '#dc2626' }} />
          </div>
          <div className="rt-stat-content">
            <span className="rt-stat-number">{statusCounts.rejected}</span>
            <span className="rt-stat-label-modern">Rejected</span>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="rt-filter-bar">
        <div className="rt-filter-left">
          <div className="rt-search-box">
            <IoSearch className="rt-search-icon" />
            <input
              type="text"
              placeholder="Search by employee or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rt-search-input"
            />
          </div>
          <div className="rt-filter-group">
            <select
              className="rt-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="rt-filter-right">
          <div className="rt-filter-group">
            <label className="rt-filter-label">Month</label>
            <select
              className="rt-filter-select"
              name="month"
              value={dateFilter.month}
              onChange={handleDate}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rt-filter-group">
            <label className="rt-filter-label">Year</label>
            <select
              className="rt-filter-select"
              name="year"
              value={dateFilter.year}
              onChange={handleDate}
            >
              {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── TICKET GRID ── */}
      <div className="rt-section">
        <div className="rt-section-header">
          <h2 className="rt-section-title">Ticket Records</h2>
          <span className="rt-section-count">{filteredTickets.length} tickets found</span>
        </div>
        
        <div className="rt-ticket-grid">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((record) => {
              const sc = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
              const isUpdating = updatingId === record.id;
              const userColor = getUserColor(record.user?.name || '');

              return (
                <div className="rt-ticket-card" key={record.id}>
                  <div className="rt-ticket-header">
                    <div className="rt-ticket-user">
                      <div 
                        className="rt-ticket-avatar" 
                        style={{ background: userColor }}
                      >
                        {getInitials(record.user?.name)}
                      </div>
                      <div className="rt-ticket-user-info">
                        <span className="rt-ticket-username">{record.user?.name || 'Unknown User'}</span>
                        <span className="rt-ticket-user-email">{record.user?.email || ''}</span>
                      </div>
                    </div>
                    <span className={`rt-ticket-status ${record.status}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  <div className="rt-ticket-body">
                    <div className="rt-ticket-details">
                      <div className="rt-ticket-detail">
                        <FaRegCalendarAlt />
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className="rt-ticket-detail">
                        <FaRegClock />
                        <span>{formatTime(record.time)}</span>
                      </div>
                      <div className="rt-ticket-detail">
                        <FaTag />
                        <span className={`rt-ticket-type ${record.type}`}>
                          {record.type === 'clock_in' ? 'Check In' : 'Check Out'}
                        </span>
                      </div>
                    </div>
                    <div className="rt-ticket-reason">
                      <FaInfoCircle className="rt-ticket-reason-icon" />
                      <p>{record.reason}</p>
                    </div>
                  </div>

                  <div className="rt-ticket-footer">
                    {record.status === 'pending' ? (
                      <select
                        className="rt-action-select"
                        value={record.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="approved">✅ Approve</option>
                        <option value="rejected">❌ Reject</option>
                      </select>
                    ) : (
                      <span className="rt-status-fixed">
                        {sc.icon} {sc.label}
                      </span>
                    )}
                    {record.late_checkin === 1 && (
                      <span className="rt-late-badge" title={`Late by ${record.late_checkin_time}`}>
                        ⏰ Late
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rt-empty-state">
              <div className="rt-empty-icon">🎫</div>
              <h3>No tickets found</h3>
              <p>There are no ticket records matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RAISE TICKET MODAL ── */}
      {activeForm &&
        createPortal(
          <div className="rt-modal-overlay" onClick={() => setActiveForm(false)}>
            <div className="rt-modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="rt-modal-close" onClick={() => setActiveForm(false)}>
                <IoClose />
              </button>
              <div className="rt-modal-header">
                <div className="rt-modal-icon-wrap">🎫</div>
                <h2 className="rt-modal-title">Raise a Ticket</h2>
                <p className="rt-modal-sub">Fill in the details to submit a correction request</p>
              </div>

              <form onSubmit={handleSubmit} className="rt-form-grid">
                <div className="rt-form-group">
                  <label className="rt-label">
                    <IoPersonOutline /> Employee
                  </label>
                  <select
                    className="rt-input"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {loadingEmployees ? 'Loading...' : 'Select Employee'}
                    </option>
                    {employees.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="rt-form-group">
                  <label className="rt-label">
                    <IoCalendarOutline /> Date
                  </label>
                  <input
                    className="rt-input"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="rt-form-group">
                  <label className="rt-label">
                    <FaTag /> Type
                  </label>
                  <select
                    className="rt-input"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="clock_in">Check In</option>
                    <option value="clock_out">Check Out</option>
                  </select>
                </div>

                <div className="rt-form-group">
                  <label className="rt-label">
                    <IoTimeOutline /> Time
                  </label>
                  <input
                    className="rt-input"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="rt-form-group rt-full-width">
                  <label className="rt-label">
                    <IoDocumentTextOutline /> Reason
                  </label>
                  <textarea
                    className="rt-input rt-textarea"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the reason for this ticket..."
                    required
                  />
                </div>

                <div className="rt-form-group rt-full-width">
                  <button type="submit" className="rt-submit-btn">
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId &&
        createPortal(
          <div className="rt-modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="rt-confirm-box" onClick={(e) => e.stopPropagation()}>
              <button className="rt-modal-close" onClick={() => setDeleteId(null)}>
                <IoClose />
              </button>
              <div className="rt-confirm-icon rt-confirm-danger">🗑️</div>
              <h2 className="rt-confirm-title">Delete Ticket</h2>
              <p className="rt-confirm-text">Are you sure you want to delete this ticket? This action cannot be undone.</p>
              <div className="rt-confirm-actions">
                <button className="rt-btn rt-btn-secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="rt-btn rt-btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── NOTIFICATION CONFIRM MODAL ── */}
      {notificationId &&
        createPortal(
          <div className="rt-modal-overlay" onClick={() => setNotificationId(null)}>
            <div className="rt-confirm-box" onClick={(e) => e.stopPropagation()}>
              <button className="rt-modal-close" onClick={() => setNotificationId(null)}>
                <IoClose />
              </button>
              <div className="rt-confirm-icon rt-confirm-info">🔔</div>
              <h2 className="rt-confirm-title">Send Notification</h2>
              <p className="rt-confirm-text">Are you sure you want to send this notification?</p>
              <div className="rt-confirm-actions">
                <button className="rt-btn rt-btn-secondary" onClick={() => setNotificationId(null)}>
                  Cancel
                </button>
                <button className="rt-btn rt-btn-primary" onClick={handleNotification}>
                  Send
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default RaiseTicket;