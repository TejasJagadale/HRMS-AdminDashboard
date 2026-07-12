import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Notification Bell.json';
import { 
  IoAdd, 
  IoClose, 
  IoNotificationsOutline, 
  IoTimeOutline,
  IoCalendarOutline,
  IoTrashOutline,
  IoSendOutline,
  IoInformationCircleOutline,
  IoGridOutline,
  IoListOutline
} from 'react-icons/io5';
import { 
  FaRegBell, 
  FaBell, 
  FaClock,
  FaTag,
  FaUsers,
  FaBuilding
} from 'react-icons/fa';
import { MdDeleteOutline, MdOutlineEdit, MdOutlineNotificationsActive } from 'react-icons/md';
import { createPortal } from 'react-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Notification = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    desc: '',
  });

  const [notifications, setNotification] = useState([]);
  const [activeForm, setActiveForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const getCurrentMonth = () => String(new Date().getMonth() + 1).padStart(2, '0');
  const getCurrentYear = () => String(new Date().getFullYear());

  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());

  /* ================= FETCH NOTIFICATION ================= */
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`${BASE_URL}/notifications?month=${month}&year=${year}`);
        const result = await response.json();
        if (result.success) setNotification(result.data);
      } catch (error) {
        console.error('Error fetching Notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [activeForm, deleteId, month, year]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= NOTIFICATION FORM SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) submitData.append(key, formData[key]);
    });
    try {
      const response = await fetch(`${BASE_URL}/notification/create`, { 
        method: 'POST', 
        body: submitData 
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Notification Created successfully!');
        setFormData({ title: '', type: '', desc: '' });
        setActiveForm(false);
      } else {
        alert('Failed to create Notification: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveForm(false);
    }
  };

  /* ================= NOTIFICATION DELETE ================= */
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/notification-delete?id=${deleteId}`);
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Notification Deleted successfully!');
        setDeleteId(null);
      } else {
        alert('Failed to Delete Notification: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification');
    } finally {
      setDeleteId(null);
    }
  };

  /* ================= SEND NOTIFICATION ================= */
  const handleNotification = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('id', notificationId);
    try {
      const response = await fetch(`${BASE_URL}/notification/send`, { 
        method: 'POST', 
        body: submitData 
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Notification Send successfully!');
        setNotificationId(null);
      } else {
        alert('Failed to Send Notification: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error in sending notification:', error);
      alert('Error sending notification');
    } finally {
      setNotificationId(null);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="notif-loading">
        <div className="notif-loader">
          <div className="notif-loader-ring"></div>
        </div>
        <p>Loading notifications…</p>
      </div>
    );
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const getStatusCounts = () => {
    const today = new Date();
    const counts = {
      upcoming: 0,
      today: 0,
      past: 0
    };
    notifications.forEach(n => {
      const notifDate = new Date(n.type);
      if (notifDate.toDateString() === today.toDateString()) {
        counts.today++;
      } else if (notifDate > today) {
        counts.upcoming++;
      } else {
        counts.past++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="notif-container fade-in-up">

      {/* ── HEADER ── */}
      <div className="notif-header">
        <div className="notif-header-left">
          <div className="notif-header-icon">
            <Lottie animationData={animationData} style={{ width: '56px', height: '56px' }} />
          </div>
          <div>
            <div className="notif-header-badge">Communication Center</div>
            <h1 className="notif-header-title">Notification Hub</h1>
            <p className="notif-header-subtitle">Create and manage organization-wide notifications</p>
          </div>
        </div>
        <div className="notif-header-right">
          <div className="notif-header-stat">
            <span className="notif-stat-number">{notifications.length}</span>
            <span className="notif-stat-label">Scheduled</span>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="notif-stats-bar">
        <div className="notif-stat-item notif-stat--upcoming">
          <div className="notif-stat-icon">
            <FaClock />
          </div>
          <div>
            <span className="notif-stat-value">{statusCounts.upcoming}</span>
            <span className="notif-stat-name">Upcoming</span>
          </div>
        </div>
        <div className="notif-stat-item notif-stat--today">
          <div className="notif-stat-icon">
            <FaBell />
          </div>
          <div>
            <span className="notif-stat-value">{statusCounts.today}</span>
            <span className="notif-stat-name">Today</span>
          </div>
        </div>
        <div className="notif-stat-item notif-stat--past">
          <div className="notif-stat-icon">
            <IoTimeOutline />
          </div>
          <div>
            <span className="notif-stat-value">{statusCounts.past}</span>
            <span className="notif-stat-name">Past</span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="notif-toolbar">
        <div className="notif-toolbar-left">
          <div className="notif-filter-group">
            <label className="notif-filter-label">Month</label>
            <select 
              className="notif-filter-select" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
            >
              {monthNames.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
              ))}
            </select>
          </div>
          <div className="notif-filter-group">
            <label className="notif-filter-label">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="notif-filter-input"
            />
          </div>
        </div>

        <div className="notif-toolbar-right">
          <div className="notif-view-toggle">
            <button 
              className={`notif-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <IoGridOutline />
            </button>
            <button 
              className={`notif-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <IoListOutline />
            </button>
          </div>

          <button className="notif-btn notif-btn--primary" onClick={() => setActiveForm(true)}>
            <IoAdd /> New Notification
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="notif-main">
        {notifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              <IoNotificationsOutline size={48} />
            </div>
            <h3>No Notifications Scheduled</h3>
            <p>Get started by creating your first notification</p>
            <button className="notif-btn notif-btn--primary" onClick={() => setActiveForm(true)}>
              <IoAdd /> Create Notification
            </button>
          </div>
        ) : (
          <div className={`notif-grid ${viewMode === 'list' ? 'notif-grid--list' : ''}`}>
            {notifications.map((data, idx) => {
              const date = new Date(data.type);
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date() && !isToday;
              
              return (
                <div 
                  className={`notif-card ${isPast ? 'notif-card--past' : ''} ${isToday ? 'notif-card--today' : ''}`} 
                  key={data.id} 
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="notif-card-header">
                    <div className="notif-card-status">
                      <span className={`notif-card-badge ${isPast ? 'notif-card-badge--past' : isToday ? 'notif-card-badge--today' : 'notif-card-badge--upcoming'}`}>
                        {isPast ? 'Past' : isToday ? 'Today' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="notif-card-actions">
                      <button 
                        className="notif-card-btn notif-card-btn--send" 
                        onClick={() => setNotificationId(data.id)} 
                        title="Send notification"
                      >
                        <IoSendOutline />
                      </button>
                      <button 
                        className="notif-card-btn notif-card-btn--delete" 
                        onClick={() => setDeleteId(data.id)} 
                        title="Delete"
                      >
                        <IoTrashOutline />
                      </button>
                      <button 
                        className="notif-card-btn" 
                        onClick={() => setDetailModal(data)}
                        title="View details"
                      >
                        <IoInformationCircleOutline />
                      </button>
                    </div>
                  </div>

                  <div className="notif-card-body">
                    <h3 className="notif-card-title">{data.title}</h3>
                    <p className="notif-card-description">{data.description}</p>
                  </div>

                  <div className="notif-card-footer">
                    <div className="notif-card-meta">
                      <div className="notif-card-meta-item">
                        <IoCalendarOutline />
                        <span>{date.toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                      <div className="notif-card-meta-item">
                        <FaTag />
                        <span>{data.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {detailModal && createPortal(
        <div className="notif-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="notif-modal notif-modal--detail" onClick={e => e.stopPropagation()}>
            <button className="notif-modal-close" onClick={() => setDetailModal(null)}>
              <IoClose />
            </button>
            
            <div className="notif-detail-header">
              <div className="notif-detail-icon">
                <MdOutlineNotificationsActive size={24} />
              </div>
              <div>
                <span className="notif-detail-badge">
                  {new Date(detailModal.type) > new Date() ? 'Upcoming' : 'Past'}
                </span>
                <h2 className="notif-detail-title">{detailModal.title}</h2>
              </div>
            </div>

            <div className="notif-detail-body">
              <div className="notif-detail-row">
                <span className="notif-detail-label">Date</span>
                <span className="notif-detail-value">
                  <IoCalendarOutline /> 
                  {new Date(detailModal.type).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="notif-detail-row">
                <span className="notif-detail-label">Type</span>
                <span className="notif-detail-value">
                  <FaTag /> {detailModal.type}
                </span>
              </div>
              <div className="notif-detail-row notif-detail-row--full">
                <span className="notif-detail-label">Description</span>
                <p className="notif-detail-description">{detailModal.description}</p>
              </div>
            </div>

            <div className="notif-detail-actions">
              <button 
                className="notif-btn notif-btn--outline"
                onClick={() => { setNotificationId(detailModal.id); setDetailModal(null); }}
              >
                <IoSendOutline /> Send Now
              </button>
              <button 
                className="notif-btn notif-btn--danger"
                onClick={() => { setDeleteId(detailModal.id); setDetailModal(null); }}
              >
                <IoTrashOutline /> Delete
              </button>
              <button 
                className="notif-btn notif-btn--secondary"
                onClick={() => setDetailModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE MODAL ── */}
      {activeForm && createPortal(
        <div className="notif-modal-overlay" onClick={() => setActiveForm(false)}>
          <div className="notif-modal notif-modal--form" onClick={e => e.stopPropagation()}>
            <div className="notif-modal-header">
              <div className="notif-modal-icon">
                <IoAdd size={20} color="#fff" />
              </div>
              <div>
                <h2>Schedule Notification</h2>
                <p>Create a new notification for your organization</p>
              </div>
              <button className="notif-modal-close" onClick={() => setActiveForm(false)}>
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="notif-form">
              <div className="notif-form-group">
                <label className="notif-form-label">
                  Title <span className="notif-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Monthly Team Meeting"
                  className="notif-form-input"
                  required
                />
              </div>

              <div className="notif-form-group">
                <label className="notif-form-label">
                  Schedule Date <span className="notif-required">*</span>
                </label>
                <input
                  type="date"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="notif-form-input"
                  required
                />
              </div>

              <div className="notif-form-group notif-form-group--full">
                <label className="notif-form-label">
                  Description <span className="notif-required">*</span>
                </label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the notification content in detail…"
                  className="notif-form-textarea"
                  required
                />
              </div>

              <div className="notif-form-actions">
                <button type="button" className="notif-btn notif-btn--ghost" onClick={() => setActiveForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="notif-btn notif-btn--primary">
                  <IoAdd /> Schedule Notification
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && createPortal(
        <div className="notif-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="notif-modal notif-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="notif-confirm-icon notif-confirm-icon--danger">
              <IoTrashOutline size={32} />
            </div>
            <h2 className="notif-confirm-title">Delete Notification?</h2>
            <p className="notif-confirm-text">This action cannot be undone. The notification will be permanently removed.</p>
            <div className="notif-confirm-actions">
              <button className="notif-btn notif-btn--ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="notif-btn notif-btn--danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── SEND CONFIRM ── */}
      {notificationId && createPortal(
        <div className="notif-modal-overlay" onClick={() => setNotificationId(null)}>
          <div className="notif-modal notif-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="notif-confirm-icon notif-confirm-icon--send">
              <IoSendOutline size={32} />
            </div>
            <h2 className="notif-confirm-title">Send Notification?</h2>
            <p className="notif-confirm-text">This will immediately push the notification to all recipients in your organization.</p>
            <div className="notif-confirm-actions">
              <button className="notif-btn notif-btn--ghost" onClick={() => setNotificationId(null)}>
                Cancel
              </button>
              <button className="notif-btn notif-btn--send" onClick={handleNotification}>
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

export default Notification;