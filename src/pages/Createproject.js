import React, { useState, useEffect } from 'react';
import '../styles/Createproject.css';
import { IoAdd, IoClose } from 'react-icons/io5';
import { 
  MdOutlineFolderOpen, 
  MdOutlineEdit, 
  MdOutlineDescription,
  MdOutlinePeople,
  MdOutlineCalendarToday,
  MdOutlinePerson,
  MdOutlineCheckCircle,
  MdOutlineMoreHoriz,
  MdOutlineDashboard,
  MdOutlineTimeline,
  MdOutlineTask,
  MdOutlineAttachFile,
} from 'react-icons/md';
import { 
  FiUsers, 
  FiCalendar, 
  FiUser, 
  FiCheckCircle,
  FiPlus,
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiX,
  FiFolder,
  FiTag,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
} from 'react-icons/fi';
import { 
  FaProjectDiagram, 
  FaChartLine, 
  FaClipboardList,
  FaRocket,
  FaStar,
} from 'react-icons/fa';
import { createPortal } from 'react-dom';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Completing Tasks.json';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mps.mpdatahub.com/api';

const CreateProject = () => {

    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        team_id: '',
    });

    const [editData, setEditData] = useState({
        id: null,
        project_name: '',
        description: '',
        team_id: '',
        status: 'active',
    });

    const [teams, setTeams] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeForm, setActiveForm] = useState(false);
    const [editForm, setEditForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [teamFilter, setTeamFilter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
    });

    /* ================= FETCH TEAMS ================= */
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch(`${BASE_URL}/teams/team-list`, {
                    headers: getAuthHeaders(),
                });
                const result = await response.json();
                if (result.success) {
                    setTeams(result.data);
                    if (result.data.length > 0) setTeamFilter(result.data[0].id);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchTeams();
    }, []);

    /* ================= FETCH PROJECTS ================= */
    useEffect(() => {
        if (!teamFilter) return;
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/project/list?team_id=${teamFilter}`, {
                    headers: getAuthHeaders(),
                });
                const result = await response.json();
                if (result.success) setProjects(result.data);
                else setProjects([]);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [teamFilter, activeForm, editForm]);

    /* ================= HANDLE INPUT ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    /* ================= OPEN EDIT MODAL ================= */
    const openEdit = (data) => {
        setEditData({
            id: data.id,
            project_name: data.project_name,
            description: data.description || '',
            team_id: data.team_id || '',
            status: data.status || 'active',
        });
        setEditForm(true);
    };

    /* ================= PROJECT FORM SUBMIT (CREATE) ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const submitData = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== '') submitData.append(key, formData[key]);
        });

        try {
            const response = await fetch(`${BASE_URL}/project/create`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: submitData,
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message || 'Project created successfully!');
                setFormData({ project_name: '', description: '', team_id: '' });
                setActiveForm(false);
            } else {
                alert('Failed to create project: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form');
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= PROJECT FORM SUBMIT (EDIT) ================= */
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const submitData = new FormData();
        submitData.append('project_name', editData.project_name);
        submitData.append('description', editData.description);
        submitData.append('team_id', editData.team_id);
        submitData.append('status', editData.status);

        try {
            const response = await fetch(`${BASE_URL}/project/update/${editData.id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: submitData,
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || 'Project updated successfully!');
                setEditForm(false);
            } else {
                alert('Failed to update project: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Error updating project');
        } finally {
            setUpdating(false);
        }
    };

    /* ================= HELPERS ================= */
    const getStatusLabel = (status) => {
        const labels = {
            'active': 'Active',
            'inactive': 'Inactive',
            'completed': 'Completed',
            'on_hold': 'On Hold',
            'archived': 'Archived'
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'active': return <FiCheckCircle className="status-icon active" />;
            case 'completed': return <FiCheckCircle className="status-icon completed" />;
            case 'on_hold': return <FiClock className="status-icon on-hold" />;
            case 'inactive': return <FiX className="status-icon inactive" />;
            case 'archived': return <FiFolder className="status-icon archived" />;
            default: return <FiCheckCircle className="status-icon" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': '#10b981',
            'inactive': '#ef4444',
            'completed': '#3b82f6',
            'on_hold': '#f59e0b',
            'archived': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    };

    const getRandomColor = (name) => {
        const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getProjectStats = () => {
        const total = projects.length;
        const active = projects.filter(p => p.status === 'active').length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const onHold = projects.filter(p => p.status === 'on_hold').length;
        return { total, active, completed, onHold };
    };

    const stats = getProjectStats();

    /* ================= LOADING STATE ================= */
    if (loading && projects.length === 0 && teams.length === 0) {
        return (
            <div className="cp-loading">
                <div className="cp-loader-ring"></div>
                <p>Loading projects…</p>
            </div>
        );
    }

    return (
        <div className="cp-container cp-fade-in">

            {/* ── HERO SECTION ── */}
            <div className="cp-hero">
                <div className="cp-hero-content">
                    <div className="cp-hero-icon">
                        <Lottie animationData={animationData} style={{ width: "60px", height: "60px" }} />
                    </div>
                    <div>
                        <div className="cp-hero-badge">
                            <FaRocket /> Workspace
                        </div>
                        <h1 className="cp-hero-title">Project Management</h1>
                        <p className="cp-hero-subtitle">Centralize, manage, and oversee all your team's initiatives</p>
                    </div>
                </div>
                <div className="cp-hero-stats">
                    <div className="cp-hero-stat">
                        <span className="cp-stat-number">{stats.total}</span>
                        <span className="cp-stat-label">Total</span>
                    </div>
                    <div className="cp-hero-stat">
                        <span className="cp-stat-number" style={{ color: '#10b981' }}>{stats.active}</span>
                        <span className="cp-stat-label">Active</span>
                    </div>
                    <div className="cp-hero-stat">
                        <span className="cp-stat-number" style={{ color: '#3b82f6' }}>{stats.completed}</span>
                        <span className="cp-stat-label">Completed</span>
                    </div>
                    <div className="cp-hero-stat">
                        <span className="cp-stat-number" style={{ color: '#f59e0b' }}>{stats.onHold}</span>
                        <span className="cp-stat-label">On Hold</span>
                    </div>
                </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div className="cp-toolbar">
                <div className="cp-toolbar-left">
                    <div className="cp-team-selector">
                        <MdOutlinePeople size={18} />
                        <select 
                            value={teamFilter} 
                            onChange={(e) => setTeamFilter(e.target.value)}
                            className="cp-team-select"
                        >
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cp-search-box">
                        <FiSearch size={16} />
                        <input
                            type="text"
                            placeholder="Search projects…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="cp-search-input"
                        />
                        {searchTerm && (
                            <button className="cp-search-clear" onClick={() => setSearchTerm('')}>
                                <IoClose size={16} />
                            </button>
                        )}
                    </div>

                    <button 
                        className={`cp-filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="cp-toolbar-right">
                    <div className="cp-view-toggle">
                        <button 
                            className={`cp-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            <FiGrid size={16} />
                        </button>
                        <button 
                            className={`cp-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List view"
                        >
                            <FiList size={16} />
                        </button>
                    </div>

                    <button className="cp-btn-primary" onClick={() => setActiveForm(true)}>
                        <FiPlus size={18} />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* ── FILTERS ── */}
            {showFilters && (
                <div className="cp-filters-panel">
                    <div className="cp-filters-content">
                        <div className="cp-filter-group">
                            <label className="cp-filter-label">Status</label>
                            <div className="cp-filter-options">
                                <button 
                                    className={`cp-filter-option ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All
                                </button>
                                <button 
                                    className={`cp-filter-option ${statusFilter === 'active' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('active')}
                                >
                                    <span className="status-dot active"></span>
                                    Active
                                </button>
                                <button 
                                    className={`cp-filter-option ${statusFilter === 'completed' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('completed')}
                                >
                                    <span className="status-dot completed"></span>
                                    Completed
                                </button>
                                <button 
                                    className={`cp-filter-option ${statusFilter === 'on_hold' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('on_hold')}
                                >
                                    <span className="status-dot on-hold"></span>
                                    On Hold
                                </button>
                                <button 
                                    className={`cp-filter-option ${statusFilter === 'inactive' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('inactive')}
                                >
                                    <span className="status-dot inactive"></span>
                                    Inactive
                                </button>
                            </div>
                        </div>
                        <button className="cp-clear-filters" onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* ── PROJECTS SECTION ── */}
            <div className="cp-section">
                <div className="cp-section-header">
                    <div className="cp-section-header-left">
                        <h2 className="cp-section-title">
                            <FaProjectDiagram className="section-title-icon" />
                            Active Initiatives
                        </h2>
                        <span className="cp-section-count">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</span>
                    </div>
                    {filteredProjects.length > 0 && (
                        <div className="cp-section-actions">
                            <button className="cp-btn-sm cp-btn-ghost" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                                {viewMode === 'grid' ? <FiList /> : <FiGrid />}
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="cp-loading-projects">
                        <div className="cp-loader-ring"></div>
                    </div>
                ) : (
                    <div className={`cp-projects-grid ${viewMode === 'list' ? 'is-list' : ''}`}>
                        {filteredProjects.length === 0 ? (
                            <div className="cp-empty-state">
                                <div className="cp-empty-icon">
                                    <MdOutlineFolderOpen size={48} />
                                </div>
                                <h3>No projects found</h3>
                                <p>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first initiative'}</p>
                                {!searchTerm && statusFilter === 'all' && (
                                    <button className="cp-btn-primary cp-btn-sm" onClick={() => setActiveForm(true)}>
                                        <FiPlus size={16} />
                                        Create Project
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredProjects.map((project, idx) => (
                                <div 
                                    className={`cp-project-card ${viewMode === 'list' ? 'is-list' : ''}`} 
                                    key={project.id}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="cp-card-header">
                                        <div className="cp-card-status">
                                            <span 
                                                className={`cp-status-badge cp-status-${project.status}`}
                                                style={{ borderColor: getStatusColor(project.status) }}
                                            >
                                                {getStatusIcon(project.status)}
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </div>
                                        <div className="cp-card-actions">
                                            <button 
                                                className="cp-card-btn" 
                                                onClick={() => openEdit(project)}
                                                title="Edit project"
                                            >
                                                <MdOutlineEdit size={16} />
                                            </button>
                                            <button className="cp-card-btn" title="More options">
                                                <MdOutlineMoreHoriz size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cp-card-body">
                                        <div className="cp-card-title-wrapper">
                                            <h3 className="cp-card-title">{project.project_name}</h3>
                                            <span className="cp-card-id">#{project.id}</span>
                                        </div>
                                        <p className="cp-card-description">
                                            {project.description || 'No description provided'}
                                        </p>
                                    </div>

                                    <div className="cp-card-footer">
                                        <div className="cp-card-meta">
                                            <div className="cp-meta-tag">
                                                <MdOutlinePeople size={14} />
                                                <span>{project.team_name}</span>
                                            </div>
                                            <div className="cp-meta-tag">
                                                <div 
                                                    className="cp-meta-avatar" 
                                                    style={{ background: getRandomColor(project.created_by_name || '') }}
                                                >
                                                    {getInitials(project.created_by_name)}
                                                </div>
                                                <span>{project.created_by_name}</span>
                                            </div>
                                            <div className="cp-meta-tag">
                                                <MdOutlineCalendarToday size={14} />
                                                <span>{formatDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ── CREATE MODAL ── */}
            {activeForm && createPortal(
                <div className="cp-modal-overlay" onClick={() => setActiveForm(false)}>
                    <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cp-modal-header">
                            <div className="cp-modal-title">
                                <div className="cp-modal-icon cp-modal-icon-create">
                                    <FaRocket size={20} />
                                </div>
                                <div>
                                    <h2>Launch New Project</h2>
                                    <p>Define the project scope and assign a team</p>
                                </div>
                            </div>
                            <button className="cp-modal-close" onClick={() => setActiveForm(false)}>
                                <IoClose size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="cp-modal-form">
                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Project Name <span className="cp-required">*</span>
                                </label>
                                <div className="cp-input-icon-wrapper">
                                    <FaProjectDiagram className="cp-input-icon" />
                                    <input
                                        type="text"
                                        name="project_name"
                                        value={formData.project_name}
                                        onChange={handleChange}
                                        placeholder="e.g., Customer Portal Redesign"
                                        className="cp-form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Responsible Team <span className="cp-required">*</span>
                                </label>
                                <div className="cp-input-icon-wrapper">
                                    <MdOutlinePeople className="cp-input-icon" />
                                    <select
                                        name="team_id"
                                        value={formData.team_id}
                                        onChange={handleChange}
                                        className="cp-form-select"
                                        required
                                    >
                                        <option value="">Select a team</option>
                                        {teams.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">Project Overview</label>
                                <div className="cp-input-icon-wrapper cp-textarea-wrapper">
                                    <MdOutlineDescription className="cp-input-icon cp-textarea-icon" />
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe the project objectives, deliverables, and timeline…"
                                        className="cp-form-textarea"
                                    />
                                </div>
                            </div>

                            <div className="cp-modal-footer">
                                <button type="button" className="cp-btn-ghost" onClick={() => setActiveForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="cp-btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating…' : <><FaRocket /> Launch Project</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ── EDIT MODAL ── */}
            {editForm && createPortal(
                <div className="cp-modal-overlay" onClick={() => setEditForm(false)}>
                    <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cp-modal-header cp-modal-header-edit">
                            <div className="cp-modal-title">
                                <div className="cp-modal-icon cp-modal-icon-edit">
                                    <MdOutlineEdit size={20} />
                                </div>
                                <div>
                                    <h2>Update Project</h2>
                                    <p>Modify project details and status</p>
                                </div>
                            </div>
                            <button className="cp-modal-close" onClick={() => setEditForm(false)}>
                                <IoClose size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="cp-modal-form">
                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Project Name <span className="cp-required">*</span>
                                </label>
                                <div className="cp-input-icon-wrapper">
                                    <FaProjectDiagram className="cp-input-icon" />
                                    <input
                                        type="text"
                                        name="project_name"
                                        value={editData.project_name}
                                        onChange={handleEditChange}
                                        placeholder="e.g., Customer Portal Redesign"
                                        className="cp-form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Responsible Team <span className="cp-required">*</span>
                                </label>
                                <div className="cp-input-icon-wrapper">
                                    <MdOutlinePeople className="cp-input-icon" />
                                    <select
                                        name="team_id"
                                        value={editData.team_id}
                                        onChange={handleEditChange}
                                        className="cp-form-select"
                                        required
                                    >
                                        <option value="">Select a team</option>
                                        {teams.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Project Status <span className="cp-required">*</span>
                                </label>
                                <div className="cp-input-icon-wrapper">
                                    <FiTag className="cp-input-icon" />
                                    <select
                                        name="status"
                                        value={editData.status}
                                        onChange={handleEditChange}
                                        className="cp-form-select"
                                        required
                                    >
                                        <option value="active">🟢 Active</option>
                                        <option value="inactive">🔴 Inactive</option>
                                        <option value="completed">🔵 Completed</option>
                                        <option value="on_hold">🟡 On Hold</option>
                                        <option value="archived">⚪ Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">Project Overview</label>
                                <div className="cp-input-icon-wrapper cp-textarea-wrapper">
                                    <MdOutlineDescription className="cp-input-icon cp-textarea-icon" />
                                    <textarea
                                        name="description"
                                        value={editData.description}
                                        onChange={handleEditChange}
                                        rows="4"
                                        placeholder="Describe the project objectives, deliverables, and timeline…"
                                        className="cp-form-textarea"
                                    />
                                </div>
                            </div>

                            <div className="cp-modal-footer">
                                <button type="button" className="cp-btn-ghost" onClick={() => setEditForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="cp-btn-primary" disabled={updating}>
                                    {updating ? 'Saving…' : <><MdOutlineEdit /> Update Project</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CreateProject;