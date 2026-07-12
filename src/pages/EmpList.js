import React, { useEffect, useState } from 'react';
import '../styles/EmpList.css';
import { 
  FiEdit2, FiX, FiSave, FiSearch, FiChevronDown, FiUserPlus, 
  FiUsers, FiKey, FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiClock, FiAward, FiDollarSign, FiTag, FiMoreVertical,
  FiTrash2, FiRefreshCw, FiFilter, FiGrid, FiList
} from 'react-icons/fi';
import { 
  FaUserCircle, FaBriefcase, FaGraduationCap, 
  FaBuilding, FaCalendarAlt, FaClock, FaIdCard,
  FaUserCheck, FaUserTimes, FaUserCog
} from 'react-icons/fa';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Employee Search.json';
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_URL = `${BASE_URL}/employee-List`;
const UPDATE_URL = `${BASE_URL}/update-profile`;
const INACTIVE_URL = `${BASE_URL}/employees/inactive`;
const INTERN_ACTIVE_URL = `${BASE_URL}/employee-List-roles`;
const INTERN_INACTIVE_URL = `${BASE_URL}/employees/inactive/roles`;
const DELETE_URL = `${BASE_URL}/remove-user`;
const TEAM_LIST_URL = 'https://mps.mpdatahub.com/api/teams/team-list';
const TEAM_BY_ID_URL = 'https://mps.mpdatahub.com/api/team-by-id';

export default function EmpList() {
  /* ───────── Employee lists ───────── */
  const [employees, setEmployees] = useState([]);
  const [inactiveEmployees, setInactiveEmployees] = useState([]);
  const [activeInterns, setActiveInterns] = useState([]);
  const [inactiveInterns, setInactiveInterns] = useState([]);

  const navigate = useNavigate();

  /* ───────── Team state ───────── */
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  /* ───────── UI state ───────── */
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [viewMode, setViewMode] = useState('grid');

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pwdConfirmModal, setPwdConfirmModal] = useState(false);
  const [pwdEmailModal, setPwdEmailModal] = useState(false);
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdSending, setPwdSending] = useState(false);
  const [pwdSendError, setPwdSendError] = useState('');
  const [pwdSendSuccess, setPwdSendSuccess] = useState('');
  const [pwdTargetEmp, setPwdTargetEmp] = useState(null);

  const [saveError, setSaveError] = useState('');
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  /* ═══════════════════════════════════════════
     FETCH HELPERS
  ═══════════════════════════════════════════ */
  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.success) setEmployees(json.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchInactiveEmployees = async () => {
    try {
      const res = await fetch(INACTIVE_URL);
      const json = await res.json();
      if (json.success) setInactiveEmployees(json.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchActiveInterns = async () => {
    try {
      const res = await fetch(INTERN_ACTIVE_URL);
      const json = await res.json();
      if (json.success) setActiveInterns(json.data);
    } catch (err) { console.log(err); }
  };

  const fetchInactiveInterns = async () => {
    try {
      const res = await fetch(INTERN_INACTIVE_URL);
      const json = await res.json();
      if (json.success) setInactiveInterns(json.data);
    } catch (err) { console.log(err); }
  };

  const fetchTeamList = async () => {
    try {
      const res = await fetch(TEAM_LIST_URL);
      const json = await res.json();
      if (json.success) setTeamList(json.data);
    } catch (err) { console.log(err); }
  };

  const fetchTeamById = async (teamId) => {
    setTeamLoading(true);
    try {
      const res = await fetch(`${TEAM_BY_ID_URL}?team_id=${teamId}`);
      const json = await res.json();
      if (json.success) setTeamMembers(json.data);
      else setTeamMembers([]);
    } catch (err) {
      console.log(err);
      setTeamMembers([]);
    }
    setTeamLoading(false);
  };

  const refreshAll = () => {
    fetchEmployees();
    fetchInactiveEmployees();
    fetchActiveInterns();
    fetchInactiveInterns();
    if (selectedTeam !== 'all') fetchTeamById(selectedTeam);
  };

  /* ───────── Initial load ───────── */
  useEffect(() => {
    fetchEmployees();
    fetchInactiveEmployees();
    fetchActiveInterns();
    fetchInactiveInterns();
    fetchTeamList();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await fetch('https://mps.mpdatahub.com/api/roles');
        const result = await response.json();
        if (result.success) {
          setRoles(result.data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
      setLoadingRoles(false);
    };
    fetchRoles();
  }, []);

  /* ───────── Team selection change ───────── */
  const handleTeamChange = (e) => {
    const val = e.target.value;
    setSelectedTeam(val);
    setSearchTerm('');
    if (val === 'all') {
      setTeamMembers([]);
      setFilterStatus('active');
    } else {
      fetchTeamById(val);
    }
  };

  /* ═══════════════════════════════════════════
     DELETE
  ═══════════════════════════════════════════ */
  const openDelete = (id) => { setDeleteId(id); setDeleteModal(true); };

  const deleteEmployee = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteModal(false);
    setDeleteId(null);
    try {
      setLoading(true);
      const res = await fetch(`${DELETE_URL}?id=${id}`);
      const json = await res.json();
      if (json.success) refreshAll();
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  /* ═══════════════════════════════════════════
     STATUS TOGGLE
  ═══════════════════════════════════════════ */
  const updateEmployeeStatus = async (id, status) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/update-Employee-Status?user_id=${id}&status=${status}`);
      const json = await res.json();
      if (json.success) refreshAll();
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleToggle = (id, status) => updateEmployeeStatus(id, status === 0 ? 1 : 0);

  /* ═══════════════════════════════════════════
     EDIT
  ═══════════════════════════════════════════ */
  const openEdit = (emp) => {
    setEditData({
      id: emp.id,
      name: emp.name || '',
      empid: emp.empid || '',
      email: emp.email || '',
      mobile: emp.mobile || '',
      position: emp.position || '',
      address: emp.address || '',
      dob: emp.dob || '',
      designation: emp.designation || '',
      qualification: emp.qualification || '',
      joining_date: emp.joining_date || '',
      experience: emp.experience || '',
      employee_status: emp.employee_status || '',
      salary: emp.salary || '',
      start_time: emp.start_time ? emp.start_time.slice(0, 5) : '',
      end_time: emp.end_time ? emp.end_time.slice(0, 5) : '',
      role_id: emp.role_id || '',
      profile_img: null
    });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editData?.id) { setSaveError('ID missing'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      const toHMS = (t) => (!t ? '' : t.length === 8 ? t : t + ':00');
      formData.append('id', editData.id);
      if (editData.name) formData.append('name', editData.name);
      if (editData.empid) formData.append('empid', editData.empid);
      if (editData.email) formData.append('email', editData.email);
      if (editData.mobile) formData.append('mobile', editData.mobile);
      if (editData.position) formData.append('position', editData.position);
      if (editData.address) formData.append('address', editData.address);
      if (editData.dob) formData.append('dob', editData.dob);
      if (editData.start_time) formData.append('start_time', toHMS(editData.start_time));
      if (editData.end_time) formData.append('end_time', toHMS(editData.end_time));
      if (editData.designation) formData.append('designation', editData.designation);
      if (editData.qualification) formData.append('qualification', editData.qualification);
      if (editData.joining_date) formData.append('joining_date', editData.joining_date);
      if (editData.experience) formData.append('experience', editData.experience);
      if (editData.employee_status) formData.append('employee_status', editData.employee_status);
      if (editData.salary) formData.append('salary', editData.salary);
      if (editData.role_id) formData.append('role_id', editData.role_id);
      if (editData.profile_img) {
        formData.append('profile_img', editData.profile_img);
      }

      const res = await fetch(UPDATE_URL, { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success) {
        await refreshAll();
        setEditModal(false);
      } else {
        setSaveError(json.message || 'Update failed');
      }
    } catch {
      setSaveError('Network error');
    }
    setSaving(false);
  };

  const sendPasswordReset = async () => {
    if (!pwdEmail.trim()) { setPwdSendError('Please enter an email.'); return; }
    setPwdSending(true);
    setPwdSendError('');
    setPwdSendSuccess('');
    try {
      const res = await fetch('https://mps.mpdatahub.com/api/forgot-Password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pwdEmail }),
      });
      const json = await res.json();
      if (json.success) {
        setPwdSendSuccess('Password reset email sent successfully!');
        setTimeout(() => {
          setPwdEmailModal(false);
          setPwdEmail('');
          setPwdSendSuccess('');
        }, 2000);
      } else {
        setPwdSendError(json.message || 'Failed to send email.');
      }
    } catch {
      setPwdSendError('Network error. Please try again.');
    }
    setPwdSending(false);
  };

  /* ═══════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════ */
  const formatTime = (time) => {
    if (!time) return '—';
    const [hour, minute] = time.split(':');
    let h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  const getDesignationLabel = (des) => {
    if (des === 'TL') return 'Team Lead';
    if (des === 'TM') return 'Team Member';
    return des || '—';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    if (status === 1) return 'active';
    return 'inactive';
  };

  /* ═══════════════════════════════════════════
     SEARCH FILTER
  ═══════════════════════════════════════════ */
  const normalize = (str) =>
    str.toLowerCase().replace(/\s+/g, ' ').trim();

  const search = (arr) =>
    arr.filter((emp) => {
      const term = normalize(searchTerm);
      return (
        normalize(emp.name || '').includes(term) ||
        normalize(emp.empid || '').includes(term) ||
        normalize(emp.email || '').includes(term)
      );
    });

  const active = search(employees);
  const inactive = search(inactiveEmployees);
  const activeInternFiltered = search(activeInterns);
  const inactiveInternFiltered = search(inactiveInterns);

  const counts = {
    active: employees.length,
    inactive: inactiveEmployees.length,
    activeIntern: activeInterns.length,
    inactiveIntern: inactiveInterns.length,
  };

  const tabMeta = {
    active: { label: 'Active', icon: <FaUserCheck /> },
    inactive: { label: 'Inactive', icon: <FaUserTimes /> },
    activeIntern: { label: 'Interns · Active', icon: <FaUserCog /> },
    inactiveIntern: { label: 'Interns · Inactive', icon: <FaUserTimes /> },
  };

  const currentTabList =
    filterStatus === 'active' ? active
      : filterStatus === 'inactive' ? inactive
        : filterStatus === 'activeIntern' ? activeInternFiltered
          : inactiveInternFiltered;

  /* ═══════════════════════════════════════════
     TEAM VIEW
  ═══════════════════════════════════════════ */
  const teamLeads = teamMembers.filter((m) => m.designation === 'TL');
  const teamMembersFiltered = teamMembers.filter((m) => m.designation !== 'TL');

  /* ═══════════════════════════════════════════
     EMPLOYEE CARD
  ═══════════════════════════════════════════ */
  const EmployeeCard = ({ emp, showDelete }) => {
    const statusClass = showDelete ? 'inactive' : emp.designation === 'TL' ? 'lead' : 'active';
    const statusLabel = emp.status === 1 ? 'Active' : 'Inactive';

    return (
      <div className={`emp-card ${statusClass}`}>
        <div className="emp-card-header">
          <div className="emp-avatar-section">
            <div className="emp-avatar">
              {emp.profile_img ? (
                <img src={emp.profile_img} alt={emp.name} />
              ) : (
                <div className="emp-avatar-fallback" style={{ background: `hsl(${Math.random() * 360}, 70%, 60%)` }}>
                  {getInitials(emp.name)}
                </div>
              )}
            </div>
            <div className="emp-status-badge status-${statusClass}">
              {statusLabel}
            </div>
          </div>
          <div className="emp-card-title">
            <h3>{emp.name || 'Unnamed'}</h3>
            <span className="emp-id">{emp.empid || '—'}</span>
          </div>
        </div>

        <div className="emp-card-body">
          <div className="emp-details-grid">
            <div className="emp-detail">
              <FiMail className="detail-icon" />
              <span>{emp.email || '—'}</span>
            </div>
            <div className="emp-detail">
              <FiPhone className="detail-icon" />
              <span>{emp.mobile || '—'}</span>
            </div>
            <div className="emp-detail">
              <FaBriefcase className="detail-icon" />
              <span>{emp.position || '—'}</span>
            </div>
            <div className="emp-detail">
              <FiTag className="detail-icon" />
              <span className={`designation-badge ${emp.designation === 'TL' ? 'tl' : 'tm'}`}>
                {getDesignationLabel(emp.designation)}
              </span>
            </div>
            <div className="emp-detail">
              <FiCalendar className="detail-icon" />
              <span>{emp.joining_date || '—'}</span>
            </div>
            <div className="emp-detail">
              <FiClock className="detail-icon" />
              <span>{formatTime(emp.start_time)} – {formatTime(emp.end_time)}</span>
            </div>
          </div>
        </div>

        <div className="emp-card-footer">
          <div className="emp-actions">
            <button className="btn-action btn-edit" onClick={() => openEdit(emp)}>
              <FiEdit2 /> Edit
            </button>
            {showDelete && (
              <button className="btn-action btn-delete" onClick={() => openDelete(emp.id)}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
          <label className="status-toggle">
            <input
              type="checkbox"
              checked={emp.status === 1}
              onChange={() => handleToggle(emp.id, emp.status)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="emp-page">
      <div className="emp-container">

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="emp-sidebar">
          <div className="sidebar-brand">
            <Lottie animationData={animationData} style={{ width: 46, height: 46 }} />
            <div>
              <span className="brand-subtitle">HR · Directory</span>
              <h1>Employees</h1>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn-primary" onClick={() => navigate("/admin/add-employee")}>
              <FiUserPlus /> Add Employee
            </button>
            <button className="btn-secondary" onClick={() => navigate("/admin/add-team")}>
              <FiUsers /> Add Team
            </button>
          </div>

          <div className="sidebar-section">
            <label className="section-label">Team</label>
            <div className="select-wrapper">
              <select className="select-input" value={selectedTeam} onChange={handleTeamChange}>
                <option value="all">All Teams</option>
                {teamList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <FiChevronDown className="select-icon" />
            </div>
          </div>

          {selectedTeam === 'all' && (
            <div className="sidebar-section">
              <label className="section-label">Status</label>
              <div className="tab-list">
                {['active', 'inactive', 'activeIntern', 'inactiveIntern'].map((s) => (
                  <button
                    key={s}
                    className={`tab-item ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    <span className="tab-icon">{tabMeta[s].icon}</span>
                    <span>{tabMeta[s].label}</span>
                    <span className="tab-count">{counts[s]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <FiKey />
            <p>Card color indicates status — active roster, team leads, and inactive employees.</p>
          </div>
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <main className="emp-main">
          <div className="main-toolbar">
            <div className="toolbar-left">
              <h2>{employees.length} Employees</h2>
              <span className="toolbar-subtitle">
                {selectedTeam === 'all'
                  ? `Showing ${tabMeta[filterStatus].label.toLowerCase()}`
                  : 'Showing selected team'}
              </span>
            </div>

            <div className="toolbar-right">
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={refreshAll}>
                <FiRefreshCw />
              </button>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>

          {loading && <div className="loading-state">Loading employees...</div>}

          {/* ── ALL TEAMS VIEW ── */}
          {selectedTeam === 'all' && (
            <div className={`employee-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {loading ? (
                <div className="empty-state"><p>Loading employees…</p></div>
              ) : currentTabList.length === 0 ? (
                <div className="empty-state">
                  <FaUserCircle className="empty-icon" />
                  <h3>No employees found</h3>
                  <p>Try adjusting your search or filter settings</p>
                </div>
              ) : (
                currentTabList.map((emp) => (
                  <EmployeeCard key={emp.id} emp={emp} showDelete={filterStatus === 'inactive' || filterStatus === 'inactiveIntern'} />
                ))
              )}
            </div>
          )}

          {/* ── SPECIFIC TEAM VIEW ── */}
          {selectedTeam !== 'all' && (
            <>
              {teamLoading ? (
                <div className="empty-state"><p>Loading team…</p></div>
              ) : (
                <>
                  {teamLeads.length > 0 && (
                    <section className="team-section">
                      <div className="team-section-header">
                        <span className="section-badge lead">TL</span>
                        <h3>Team Lead</h3>
                        <span className="section-count">{teamLeads.length}</span>
                      </div>
                      <div className={`employee-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                        {teamLeads
                          .filter(
                            (emp) =>
                              emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              emp.empid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((emp) => (
                            <EmployeeCard key={emp.id} emp={emp} showDelete={false} />
                          ))}
                      </div>
                    </section>
                  )}

                  {teamMembersFiltered.length > 0 && (
                    <section className="team-section">
                      <div className="team-section-header">
                        <span className="section-badge member">TM</span>
                        <h3>Team Members</h3>
                        <span className="section-count">{teamMembersFiltered.length}</span>
                      </div>
                      <div className={`employee-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                        {teamMembersFiltered
                          .filter(
                            (emp) =>
                              emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              emp.empid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((emp) => (
                            <EmployeeCard key={emp.id} emp={emp} showDelete={false} />
                          ))}
                      </div>
                    </section>
                  )}

                  {teamLeads.length === 0 && teamMembersFiltered.length === 0 && (
                    <div className="empty-state">
                      <FaUserCircle className="empty-icon" />
                      <h3>No members in this team</h3>
                      <p>Add team members to get started</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ════════════════════════════════════
          EDIT MODAL
      ════════════════════════════════════ */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Employee</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>
                <FiX />
              </button>
            </div>

            {saveError && <div className="modal-error">{saveError}</div>}

            <div className="modal-form">
              <div className="form-field">
                <label>Full Name</label>
                <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Full name" />
              </div>

              <div className="form-field">
                <label>Employee ID</label>
                <input name="empid" value={editData.empid} onChange={handleEditChange} placeholder="Emp ID" />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input name="email" value={editData.email} onChange={handleEditChange} placeholder="Email" />
              </div>

              <div className="form-field">
                <label>Mobile</label>
                <input name="mobile" value={editData.mobile} onChange={handleEditChange} placeholder="Mobile" />
              </div>

              <div className="form-field">
                <label>Position</label>
                <input name="position" value={editData.position} onChange={handleEditChange} placeholder="Position" />
              </div>

              <div className="form-field">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={editData.dob} onChange={handleEditChange} />
              </div>

              <div className="form-field full-width">
                <label>Address</label>
                <input name="address" value={editData.address} onChange={handleEditChange} placeholder="Address" />
              </div>

              <div className="form-field">
                <label>Start Time</label>
                <input type="time" name="start_time" value={editData.start_time} onChange={handleEditChange} />
              </div>

              <div className="form-field">
                <label>End Time</label>
                <input type="time" name="end_time" value={editData.end_time} onChange={handleEditChange} />
              </div>

              <div className="form-field">
                <label>Designation</label>
                <select name="designation" value={editData.designation} onChange={handleEditChange}>
                  <option value="">Select designation</option>
                  <option value="TL">Team Lead (TL)</option>
                  <option value="TM">Team Member (TM)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Qualification</label>
                <input name="qualification" value={editData.qualification} onChange={handleEditChange} placeholder="Qualification" />
              </div>

              <div className="form-field">
                <label>Joining Date</label>
                <input type="date" name="joining_date" value={editData.joining_date} onChange={handleEditChange} />
              </div>

              <div className="form-field">
                <label>Experience</label>
                <input name="experience" value={editData.experience} onChange={handleEditChange} placeholder="Experience" />
              </div>

              <div className="form-field">
                <label>Employee Status</label>
                <select name="employee_status" value={editData.employee_status} onChange={handleEditChange}>
                  <option value="">Select status</option>
                  <option value="working">Working</option>
                  <option value="notice_period">Notice Period</option>
                  <option value="relieved">Relieved</option>
                </select>
              </div>

              <div className="form-field">
                <label>Salary</label>
                <input type="number" name="salary" value={editData.salary} onChange={handleEditChange} placeholder="Salary" />
              </div>

              <div className="form-field">
                <label>Profile Image</label>
                <input
                  type="file"
                  name="profile_img"
                  accept="image/*"
                  onChange={(e) => setEditData((prev) => ({ ...prev, profile_img: e.target.files[0] }))}
                />
              </div>

              <div className="form-field">
                <label>Role</label>
                <select name="role_id" value={editData.role_id} onChange={handleEditChange}>
                  <option value="">{loadingRoles ? 'Loading…' : 'Select role'}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field full-width">
                <button
                  type="button"
                  className="btn-password"
                  onClick={() => {
                    setPwdTargetEmp(editData);
                    setPwdEmail(editData.email || '');
                    setPwdConfirmModal(true);
                  }}
                >
                  <FiKey /> Change Password
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
              <button className="btn-save" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving…' : <><FiSave /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          DELETE MODAL
      ════════════════════════════════════ */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <p className="modal-text">This will permanently remove the employee record. This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setDeleteModal(false); setDeleteId(null); }}>Cancel</button>
              <button className="btn-delete-confirm" onClick={deleteEmployee}>Delete Employee</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASSWORD CONFIRM MODAL ── */}
      {pwdConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Change Password</h2>
            </div>
            <p className="modal-text">Send a password reset email to <strong>{pwdTargetEmp?.name}</strong>?</p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setPwdConfirmModal(false); setPwdTargetEmp(null); }}>Cancel</button>
              <button className="btn-primary" onClick={() => { setPwdConfirmModal(false); setPwdEmailModal(true); }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PASSWORD EMAIL MODAL ── */}
      {pwdEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Send Reset Email</h2>
              <button className="modal-close" onClick={() => { setPwdEmailModal(false); setPwdEmail(''); setPwdSendError(''); setPwdSendSuccess(''); }}>
                <FiX />
              </button>
            </div>

            {pwdSendError && <div className="modal-error">{pwdSendError}</div>}
            {pwdSendSuccess && <div className="modal-success">{pwdSendSuccess}</div>}

            <div className="form-field full-width">
              <label>Email Address</label>
              <input
                type="email"
                value={pwdEmail}
                onChange={(e) => setPwdEmail(e.target.value)}
                placeholder="Enter employee email"
              />
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setPwdEmailModal(false); setPwdEmail(''); setPwdSendError(''); setPwdSendSuccess(''); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={sendPasswordReset} disabled={pwdSending}>
                {pwdSending ? 'Sending…' : 'Send Reset Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}