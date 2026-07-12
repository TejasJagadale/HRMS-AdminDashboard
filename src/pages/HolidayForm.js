import React, { useState, useEffect } from 'react';
import '../styles/HolidayForm.css';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Confetti.json';
import { 
  IoAdd, 
  IoClose, 
  IoCalendarOutline, 
  IoTimeOutline,
  IoNotificationsOutline,
  IoTrashOutline,
  IoListOutline,
  IoGridOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import { 
  FaRegBell, 
  FaThList, 
  FaRegCalendarAlt,
  FaRegClock,
  FaTag,
  FaUsers,
  FaBuilding
} from 'react-icons/fa';
import { MdDeleteOutline, MdOutlineEdit, MdOutlineEvent } from 'react-icons/md';
import { createPortal } from 'react-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ── Holiday type config ── */
const HOLIDAY_TYPE = {
  'W-H': { 
    label: 'Weekend', 
    fullLabel: 'Weekend Holiday', 
    color: '#FF6B35', 
    bg: '#FFF0E8', 
    border: '#FFB088',
    icon: '🏖️'
  },
  'C-H': { 
    label: 'Common', 
    fullLabel: 'Common Holiday', 
    color: '#7C3AED', 
    bg: '#F0EBFF', 
    border: '#C4B5FD',
    icon: '🎉'
  },
  'L-H': { 
    label: 'Local', 
    fullLabel: 'Local Holiday', 
    color: '#0EA5E9', 
    bg: '#E8F6FF', 
    border: '#7DD3FC',
    icon: '📍'
  },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HolidayForm = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    holiday_date: '', 
    description: '', 
    type: '' 
  });

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = now.getFullYear();

  const [dateFilter, setDateFilter] = useState({ 
    month: currentMonth, 
    year: currentYear 
  });
  const [holidays, setHolidays] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listModal, setListModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const monthOptions = [
    { label: 'January', value: '1' }, { label: 'February', value: '2' },
    { label: 'March', value: '3' }, { label: 'April', value: '4' },
    { label: 'May', value: '5' }, { label: 'June', value: '6' },
    { label: 'July', value: '7' }, { label: 'August', value: '8' },
    { label: 'September', value: '9' }, { label: 'October', value: '10' },
    { label: 'November', value: '11' }, { label: 'December', value: '12' },
  ];

  /* ── FETCH ── */
  useEffect(() => {
    setLoading(true);
    const fetchHolidays = async () => {
      try {
        const response = await fetch(`${BASE_URL}/holiday/list?month=${dateFilter.month}&year=${dateFilter.year}`);
        const result = await response.json();
        if (result.success) setHolidays(result.data);
        else setHolidays([]);
      } catch (error) {
        console.error('Error fetching Holidays:', error);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [activeForm, deleteId, dateFilter]);

  /* ── Build holiday map keyed by day number ── */
  const holidayMap = {};
  holidays.forEach(h => {
    const day = parseInt(h.holiday_date.split('-')[2], 10);
    if (!holidayMap[day]) holidayMap[day] = [];
    holidayMap[day].push(h);
  });

  /* ── Calendar grid ── */
  const month = parseInt(dateFilter.month, 10) - 1;
  const year = parseInt(dateFilter.year, 10);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'current' });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, type: 'next' });

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDate = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) submitData.append(key, formData[key]);
    });
    try {
      const response = await fetch(`${BASE_URL}/holiday/create`, { 
        method: 'POST', 
        body: submitData 
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Holiday Created successfully!');
        setFormData({ title: '', holiday_date: '', description: '', type: '' });
        setActiveForm(false);
      } else {
        alert('Failed to create Holiday: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/delete-Holiday/${deleteId}`);
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Holiday Deleted successfully!');
        setDeleteId(null);
      } else {
        alert('Failed to Delete Holiday: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting holiday');
    } finally {
      setDeleteId(null);
    }
  };

  const handleNotification = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('id', notificationId);
    try {
      const response = await fetch(`${BASE_URL}/send-holiday-notification`, { 
        method: 'POST', 
        body: submitData 
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Holiday Notification Send successfully!');
        setNotificationId(null);
      } else {
        alert('Failed to Send Holiday Notification: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error sending holiday notification');
    } finally {
      setNotificationId(null);
    }
  };

  const isToday = (day) => {
    const t = new Date();
    return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  const getCellMeta = (day, isCurrent) => {
    if (!isCurrent) return { cellClass: 'hc-cell--dim', badge: null, holidays: [] };
    const dayHolidays = holidayMap[day] || [];
    if (dayHolidays.length > 0) {
      const h = dayHolidays[0];
      const cfg = HOLIDAY_TYPE[h.type] || HOLIDAY_TYPE['L-H'];
      return {
        cellClass: `hc-cell--${h.type.toLowerCase().replace('-', '')}`,
        badge: cfg.label,
        holidays: dayHolidays,
        type: h.type
      };
    }
    return { cellClass: '', badge: null, holidays: [] };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusCounts = () => {
    const counts = {
      'W-H': 0,
      'C-H': 0,
      'L-H': 0
    };
    holidays.forEach(h => {
      if (counts[h.type] !== undefined) counts[h.type]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="hol-loading">
        <div className="hol-loader">
          <div className="hol-loader-ring"></div>
        </div>
        <p>Loading holiday records…</p>
      </div>
    );
  }

  return (
    <div className="hol-container fade-in-up">

      {/* ── HEADER ── */}
      <div className="hol-header">
        <div className="hol-header-left">
          <div className="hol-header-icon">
            <Lottie animationData={animationData} style={{ width: '56px', height: '56px' }} />
          </div>
          <div>
            <div className="hol-header-badge">Holiday Management</div>
            <h1 className="hol-header-title">Holiday Calendar</h1>
            <p className="hol-header-subtitle">Manage and track all organizational holidays</p>
          </div>
        </div>
        <div className="hol-header-right">
          <div className="hol-header-stat">
            <span className="hol-stat-number">{holidays.length}</span>
            <span className="hol-stat-label">This Month</span>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="hol-stats-bar">
        <div className="hol-stat-item hol-stat--weekend">
          <span className="hol-stat-icon">🏖️</span>
          <div>
            <span className="hol-stat-value">{statusCounts['W-H']}</span>
            <span className="hol-stat-name">Weekend</span>
          </div>
        </div>
        <div className="hol-stat-item hol-stat--common">
          <span className="hol-stat-icon">🎉</span>
          <div>
            <span className="hol-stat-value">{statusCounts['C-H']}</span>
            <span className="hol-stat-name">Common</span>
          </div>
        </div>
        <div className="hol-stat-item hol-stat--local">
          <span className="hol-stat-icon">📍</span>
          <div>
            <span className="hol-stat-value">{statusCounts['L-H']}</span>
            <span className="hol-stat-name">Local</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="hol-toolbar">
        <div className="hol-toolbar-left">
          <div className="hol-filter-group">
            <label className="hol-filter-label">Month</label>
            <select 
              className="hol-filter-select" 
              name="month" 
              value={dateFilter.month} 
              onChange={handleDate}
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="hol-filter-group">
            <label className="hol-filter-label">Year</label>
            <select 
              className="hol-filter-select" 
              name="year" 
              value={dateFilter.year} 
              onChange={handleDate}
            >
              {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hol-toolbar-right">
          <div className="hol-view-toggle">
            <button 
              className={`hol-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <IoGridOutline />
            </button>
            <button 
              className={`hol-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <IoListOutline />
            </button>
          </div>

          <button className="hol-btn hol-btn--list" onClick={() => setListModal(true)}>
            <IoListOutline /> View All
          </button>

          <button className="hol-btn hol-btn--primary" onClick={() => setActiveForm(true)}>
            <IoAdd /> Add Holiday
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="hol-main">
        {/* Calendar */}
        <div className="hol-calendar">
          <div className="hol-calendar-header">
            <h2 className="hol-calendar-title">
              {MONTH_NAMES[month]} {year}
            </h2>
            <span className="hol-calendar-count">{holidays.length} holidays</span>
          </div>

          {/* Day headers */}
          <div className="hol-weekdays">
            {DAY_LABELS.map(d => (
              <div key={d} className="hol-weekday">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="hol-days">
            {cells.map((cell, idx) => {
              const isCurrent = cell.type === 'current';
              const today = isCurrent && isToday(cell.day);
              const { cellClass, badge, holidays: dayHols, type } = getCellMeta(cell.day, isCurrent);
              const hasHoliday = dayHols.length > 0;

              return (
                <div
                  key={idx}
                  className={`hol-day ${cellClass} ${today ? 'hol-day--today' : ''} ${!isCurrent ? 'hol-day--other' : ''} ${hasHoliday ? 'hol-day--has-event' : ''}`}
                  onClick={() => {
                    if (hasHoliday && dayHols.length === 1) {
                      setDetailModal(dayHols[0]);
                    } else if (hasHoliday && dayHols.length > 1) {
                      setDetailModal(dayHols[0]);
                    }
                  }}
                >
                  <span className="hol-day-number">{cell.day}</span>
                  {badge && (
                    <span className="hol-day-badge" style={{
                      background: HOLIDAY_TYPE[type]?.color || '#6B7280'
                    }}>
                      {badge}
                    </span>
                  )}
                  {today && !badge && (
                    <span className="hol-day-today">Today</span>
                  )}
                  {hasHoliday && (
                    <div className="hol-day-dot" style={{
                      background: HOLIDAY_TYPE[type]?.color || '#6B7280'
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="hol-legend">
            <div className="hol-legend-item">
              <span className="hol-legend-dot" style={{ background: '#FF6B35' }} />
              <span className="hol-legend-label">Weekend Holiday</span>
            </div>
            <div className="hol-legend-item">
              <span className="hol-legend-dot" style={{ background: '#7C3AED' }} />
              <span className="hol-legend-label">Common Holiday</span>
            </div>
            <div className="hol-legend-item">
              <span className="hol-legend-dot" style={{ background: '#0EA5E9' }} />
              <span className="hol-legend-label">Local Holiday</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Holidays */}
        <div className="hol-sidebar">
          <div className="hol-sidebar-header">
            <h3>Upcoming Holidays</h3>
            <span className="hol-sidebar-count">{holidays.length}</span>
          </div>
          <div className="hol-sidebar-list">
            {holidays.length === 0 ? (
              <div className="hol-sidebar-empty">
                <IoCalendarOutline size={32} />
                <p>No holidays scheduled</p>
                <span>Add a holiday to get started</span>
              </div>
            ) : (
              holidays.slice(0, 5).map((holiday, idx) => {
                const cfg = HOLIDAY_TYPE[holiday.type] || HOLIDAY_TYPE['L-H'];
                return (
                  <div key={idx} className="hol-sidebar-item">
                    <div className="hol-sidebar-date" style={{ borderColor: cfg.color }}>
                      <span className="hol-sidebar-day">
                        {formatDate(holiday.holiday_date).split('-')[0]}
                      </span>
                      <span className="hol-sidebar-month">
                        {formatDate(holiday.holiday_date).split('-')[1]}
                      </span>
                    </div>
                    <div className="hol-sidebar-info">
                      <span className="hol-sidebar-title">{holiday.title}</span>
                      <span className="hol-sidebar-type" style={{ color: cfg.color }}>
                        {cfg.fullLabel}
                      </span>
                    </div>
                    <button 
                      className="hol-sidebar-action"
                      onClick={() => setDetailModal(holiday)}
                    >
                      <IoInformationCircleOutline />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {detailModal && createPortal(
        <div className="hol-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="hol-modal hol-modal--detail" onClick={e => e.stopPropagation()}>
            <button className="hol-modal-close" onClick={() => setDetailModal(null)}>
              <IoClose />
            </button>
            {(() => {
              const cfg = HOLIDAY_TYPE[detailModal.type] || HOLIDAY_TYPE['L-H'];
              return (
                <>
                  <div className="hol-detail-header" style={{ 
                    background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.bg})`,
                    borderBottom: `2px solid ${cfg.color}`
                  }}>
                    <div className="hol-detail-icon" style={{ background: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <span className="hol-detail-badge" style={{ background: cfg.color }}>
                        {cfg.fullLabel}
                      </span>
                      <h2 className="hol-detail-title">{detailModal.title}</h2>
                    </div>
                  </div>
                  <div className="hol-detail-body">
                    <div className="hol-detail-row">
                      <span className="hol-detail-label">Date</span>
                      <span className="hol-detail-value">
                        <IoCalendarOutline /> {formatDisplayDate(detailModal.holiday_date)}
                      </span>
                    </div>
                    <div className="hol-detail-row">
                      <span className="hol-detail-label">Type</span>
                      <span className="hol-detail-value" style={{ color: cfg.color }}>
                        <FaTag /> {cfg.fullLabel}
                      </span>
                    </div>
                    {detailModal.description && (
                      <div className="hol-detail-row hol-detail-row--full">
                        <span className="hol-detail-label">Description</span>
                        <p className="hol-detail-description">{detailModal.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="hol-detail-actions">
                    <button 
                      className="hol-btn hol-btn--outline"
                      onClick={() => { setNotificationId(detailModal.id); setDetailModal(null); }}
                    >
                      <FaRegBell /> Notify
                    </button>
                    <button 
                      className="hol-btn hol-btn--danger"
                      onClick={() => { setDeleteId(detailModal.id); setDetailModal(null); }}
                    >
                      <IoTrashOutline /> Delete
                    </button>
                    <button 
                      className="hol-btn hol-btn--secondary"
                      onClick={() => setDetailModal(null)}
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE MODAL ── */}
      {activeForm && createPortal(
        <div className="hol-modal-overlay" onClick={() => setActiveForm(false)}>
          <div className="hol-modal hol-modal--form" onClick={e => e.stopPropagation()}>
            <div className="hol-modal-header">
              <div className="hol-modal-icon">
                <IoAdd size={20} color="#fff" />
              </div>
              <div>
                <h2>Add New Holiday</h2>
                <p>Fill in the details to schedule a new holiday</p>
              </div>
              <button className="hol-modal-close" onClick={() => setActiveForm(false)}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="hol-form">
              <div className="hol-form-group">
                <label className="hol-form-label">
                  Holiday Title <span className="hol-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Diwali Celebration"
                  className="hol-form-input"
                  required
                />
              </div>

              <div className="hol-form-group">
                <label className="hol-form-label">
                  Holiday Date <span className="hol-required">*</span>
                </label>
                <input
                  type="date"
                  name="holiday_date"
                  value={formData.holiday_date}
                  onChange={handleChange}
                  className="hol-form-input"
                  required
                />
              </div>

              <div className="hol-form-group">
                <label className="hol-form-label">
                  Holiday Type <span className="hol-required">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="hol-form-select"
                  required
                >
                  <option value="">Select Holiday Type</option>
                  <option value="W-H">🏖️ Weekend Holiday</option>
                  <option value="C-H">🎉 Common Holiday</option>
                  <option value="L-H">📍 Local Holiday</option>
                </select>
              </div>

              <div className="hol-form-group hol-form-group--full">
                <label className="hol-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the holiday and any special instructions…"
                  className="hol-form-textarea"
                />
              </div>

              <div className="hol-form-actions">
                <button type="button" className="hol-btn hol-btn--ghost" onClick={() => setActiveForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="hol-btn hol-btn--primary">
                  <IoAdd /> Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── LIST MODAL ── */}
      {listModal && createPortal(
        <div className="hol-modal-overlay" onClick={() => setListModal(false)}>
          <div className="hol-modal hol-modal--list" onClick={e => e.stopPropagation()}>
            <div className="hol-modal-header">
              <div className="hol-modal-icon">
                <IoListOutline size={20} color="#fff" />
              </div>
              <div>
                <h2>All Holidays</h2>
                <p>{MONTH_NAMES[month]} {year} — {holidays.length} holiday{holidays.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="hol-modal-close" onClick={() => setListModal(false)}>
                <IoClose />
              </button>
            </div>

            <div className="hol-list-scroll">
              {holidays.length === 0 ? (
                <div className="hol-empty-state">
                  <IoCalendarOutline size={48} />
                  <h3>No Holidays Found</h3>
                  <p>No holidays scheduled for this period</p>
                </div>
              ) : (
                <div className="hol-list-items">
                  {holidays.map((holiday, idx) => {
                    const cfg = HOLIDAY_TYPE[holiday.type] || HOLIDAY_TYPE['L-H'];
                    return (
                      <div 
                        key={idx} 
                        className="hol-list-item"
                        style={{ 
                          borderLeftColor: cfg.color,
                          animationDelay: `${idx * 0.05}s`
                        }}
                      >
                        <div className="hol-list-item-left">
                          <div className="hol-list-date" style={{ color: cfg.color }}>
                            <span className="hol-list-day">
                              {formatDate(holiday.holiday_date).split('-')[0]}
                            </span>
                            <span className="hol-list-month">
                              {formatDate(holiday.holiday_date).split('-')[1]}
                            </span>
                          </div>
                          <div className="hol-list-info">
                            <span className="hol-list-title">{holiday.title}</span>
                            <span className="hol-list-type" style={{ color: cfg.color }}>
                              {cfg.fullLabel}
                            </span>
                          </div>
                        </div>
                        <div className="hol-list-item-right">
                          <button 
                            className="hol-list-btn-icon"
                            onClick={() => { setNotificationId(holiday.id); setListModal(false); }}
                            title="Send notification"
                          >
                            <FaRegBell />
                          </button>
                          <button 
                            className="hol-list-btn-icon hol-list-btn-icon--delete"
                            onClick={() => { setDeleteId(holiday.id); setListModal(false); }}
                            title="Delete"
                          >
                            <IoTrashOutline />
                          </button>
                          <button 
                            className="hol-list-btn-icon"
                            onClick={() => { setDetailModal(holiday); setListModal(false); }}
                            title="View details"
                          >
                            <IoInformationCircleOutline />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && createPortal(
        <div className="hol-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="hol-modal hol-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="hol-confirm-icon hol-confirm-icon--danger">
              <IoTrashOutline size={32} />
            </div>
            <h2 className="hol-confirm-title">Delete Holiday?</h2>
            <p className="hol-confirm-text">This action cannot be undone. The holiday will be permanently removed from the system.</p>
            <div className="hol-confirm-actions">
              <button className="hol-btn hol-btn--ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="hol-btn hol-btn--danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── NOTIFICATION CONFIRM ── */}
      {notificationId && createPortal(
        <div className="hol-modal-overlay" onClick={() => setNotificationId(null)}>
          <div className="hol-modal hol-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="hol-confirm-icon hol-confirm-icon--send">
              <FaRegBell size={32} />
            </div>
            <h2 className="hol-confirm-title">Send Notification?</h2>
            <p className="hol-confirm-text">This will immediately push the holiday notification to all recipients in your organization.</p>
            <div className="hol-confirm-actions">
              <button className="hol-btn hol-btn--ghost" onClick={() => setNotificationId(null)}>
                Cancel
              </button>
              <button className="hol-btn hol-btn--send" onClick={handleNotification}>
                Send Now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default HolidayForm;