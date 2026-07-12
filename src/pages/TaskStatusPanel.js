import React, { useEffect, useState } from "react";
import "../styles/TaskStatusPanel.css";
import { FaUserTie, FaUsers, FaRocket, FaChartLine } from "react-icons/fa6";
import { 
  FiClock, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiWatch, 
  FiPauseCircle,
  FiBarChart2,
  FiFilter,
  FiSearch,
  FiX,
  FiChevronDown,
  FiGrid,
  FiList,
  FiDownload,
  FiCalendar,
  FiUser,
  FiTag,
  FiAlertCircle,
} from "react-icons/fi";
import { GoTasklist } from "react-icons/go";
import { HiUserGroup } from "react-icons/hi2";
import { MdOutlineDashboard, MdOutlineTimeline, MdOutlineTask } from "react-icons/md";
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Completing Tasks.json';

/* ── API endpoints ──────────────────────────────────────────────── */
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TASK_API = "https://mps.mpdatahub.com/api";

/* ── Lookup tables ──────────────────────────────────────────────── */
const STATUS_META = {
    todo: {
        label: "To Do",
        icon: <FiClock />,
        cls: "tsp-status-todo"
    },
    pending: {
        label: "Pending",
        icon: <FiWatch />,
        cls: "tsp-status-pending"
    },
    "in-progress": {
        label: "In Progress",
        icon: <FiRefreshCw />,
        cls: "tsp-status-in_progress"
    },
    completed: {
        label: "Completed",
        icon: <FiCheckCircle />,
        cls: "tsp-status-completed"
    },
    hold: {
        label: "Hold",
        icon: <FiPauseCircle />,
        cls: "tsp-status-hold"
    },
    not_completed: {
        label: "Not Completed",
        icon: <FiPauseCircle />,
        cls: "tsp-status-not_completed"
    },
};

const PRIORITY_META = {
    very_low: {
        label: "Very Low",
        cls: "tsp-priority-very-low",
        dot: "tsp-dot-very-low"
    },
    low: {
        label: "Low",
        cls: "tsp-priority-low",
        dot: "tsp-dot-low"
    },
    medium: {
        label: "Medium",
        cls: "tsp-priority-medium",
        dot: "tsp-dot-medium"
    },
    high: {
        label: "High",
        cls: "tsp-priority-high",
        dot: "tsp-dot-high"
    },
    very_high: {
        label: "Very High",
        cls: "tsp-priority-very-high",
        dot: "tsp-dot-very-high"
    },
};

const AVATAR_PALETTE = ["tsp-av-0", "tsp-av-1", "tsp-av-2", "tsp-av-3", "tsp-av-4", "tsp-av-5"];

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmtTime(t) { return t ? t.substring(0, 5) : null; }
function fmtDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}
function initials(name) {
    return name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
}
function avatarCls(name) {
    return AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
}
function getRandomColor(name) {
    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/* ── Atoms ───────────────────────────────────────────────────────── */
const Dash = () => <span className="tsp-dash">—</span>;

function StatusPill({ status }) {
    const m = STATUS_META[status] || STATUS_META.todo;
    return (
        <span className={`tsp-status-pill ${m.cls}`}>
            {m.icon} {m.label}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const m = PRIORITY_META[priority] || PRIORITY_META.medium;
    return (
        <span className={`tsp-priority-badge ${m.cls}`}>
            <span className={`tsp-priority-dot ${m.dot}`} />
            {m.label}
        </span>
    );
}

function UserCell({ name }) {
    if (!name) return <Dash />;
    return (
        <span className="tsp-user-cell">
            <span className={`tsp-avatar ${avatarCls(name)}`}>{initials(name)}</span>
            <span className="tsp-user-name">{name}</span>
        </span>
    );
}

function TaskCard({ task, index }) {
    return (
        <div className="tsp-task-card">
            <div className="tsp-task-card-header">
                <div className="tsp-task-id">#{index + 1}</div>
                <div className="tsp-task-badges">
                    <StatusPill status={task.status} />
                    <PriorityBadge priority={task.priority} />
                </div>
            </div>
            <h4 className="tsp-task-title">{task.title || 'Untitled Task'}</h4>
            <p className="tsp-task-description">{task.description || 'No description provided'}</p>
            <div className="tsp-task-meta">
                <div className="tsp-task-meta-item">
                    {/* <FaUser className="tsp-meta-icon" /> */}
                    <span className="tsp-meta-label">Assigned to:</span>
                    <UserCell name={task.assigned_to_name} />
                </div>
                <div className="tsp-task-meta-item">
                    {/* <FaUser className="tsp-meta-icon" /> */}
                    <span className="tsp-meta-label">Created by:</span>
                    <UserCell name={task.assigned_by_name} />
                </div>
                <div className="tsp-task-meta-item">
                    <FiCalendar className="tsp-meta-icon" />
                    <span className="tsp-meta-label">Date:</span>
                    <span>{fmtDate(task.task_date) || <Dash />}</span>
                </div>
                <div className="tsp-task-meta-item">
                    <FiClock className="tsp-meta-icon" />
                    <span className="tsp-meta-label">Time:</span>
                    <span>{fmtTime(task.start_time) || <Dash />} - {fmtTime(task.end_time) || <Dash />}</span>
                </div>
                <div className="tsp-task-meta-item">
                    <FiTag className="tsp-meta-icon" />
                    <span className="tsp-meta-label">Project:</span>
                    <span className="tsp-project-tag">{task.project_name || <Dash />}</span>
                </div>
                {task.duration && (
                    <div className="tsp-task-meta-item">
                        <FiWatch className="tsp-meta-icon" />
                        <span className="tsp-meta-label">Duration:</span>
                        <span className="tsp-duration-badge">{task.duration}</span>
                    </div>
                )}
            </div>
            {task.reason && (
                <div className="tsp-task-reason">
                    <FiAlertCircle className="tsp-reason-icon" />
                    <span>{task.reason}</span>
                </div>
            )}
        </div>
    );
}

/* ── Stats Grid ──────────────────────────────────────────────────── */
function StatsGrid({ s, onFilter, active }) {
    const stats = [
        { key: "all", label: "Total Tasks", value: s.total_tasks ?? 0, cls: "tsp-stat-total", icon: <MdOutlineTask /> },
        { key: "completed", label: "Completed", value: s.completed ?? 0, cls: "tsp-stat-completed", icon: <FiCheckCircle /> },
        { key: "in-progress", label: "In Progress", value: s.in_progress ?? 0, cls: "tsp-stat-inprogress", icon: <FiRefreshCw /> },
        { key: "pending", label: "Pending", value: s.pending ?? 0, cls: "tsp-stat-pending", icon: <FiWatch /> },
        { key: "hold", label: "On Hold", value: s.hold ?? 0, cls: "tsp-stat-hold", icon: <FiPauseCircle /> },
    ];

    return (
        <div className="tsp-stats-grid">
            {stats.map(stat => (
                <div
                    key={stat.key}
                    className={`tsp-stat-card ${stat.cls} ${active === stat.key ? "active" : ""}`}
                    onClick={() => onFilter(stat.key)}
                >
                    <div className="tsp-stat-icon">{stat.icon}</div>
                    <div className="tsp-stat-content">
                        <span className="tsp-stat-value">{stat.value}</span>
                        <span className="tsp-stat-label">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Section (TL / TM) ───────────────────────────────────────────── */
function SectionBlock({ icon, title, subtitle, headerCls, badgeCls, tasks, type, viewMode }) {
    return (
        <div className="tsp-section">
            <div className={`tsp-section-header ${headerCls}`}>
                <div className="tsp-section-header-left">
                    <span className="tsp-section-icon">{icon}</span>
                    <div>
                        <span className="tsp-section-title">{title}</span>
                        <span className="tsp-section-subtitle">{subtitle}</span>
                    </div>
                </div>
                <span className={`tsp-section-badge ${badgeCls}`}>{tasks?.length ?? 0}</span>
            </div>
            {viewMode === 'grid' ? (
                <div className="tsp-task-grid">
                    {tasks && tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <TaskCard key={task.id} task={task} index={idx} />
                        ))
                    ) : (
                        <div className="tsp-empty-table">
                            <div className="tsp-empty-icon-small">
                                <GoTasklist />
                            </div>
                            <p>No tasks assigned to {type === 'tl' ? 'team leads' : 'team members'}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="tsp-table-wrap">
                    <table className="tsp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Task</th>
                                <th>Description</th>
                                <th>Project</th>
                                <th>Assigned To</th>
                                <th>Assigned By</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks && tasks.length > 0 ? (
                                tasks.map((task, index) => (
                                    <tr key={task.id}>
                                        <td className="tsp-col-id">{index + 1}</td>
                                        <td className="tsp-col-title">{task.title || <Dash />}</td>
                                        <td className="tsp-col-desc">{task.description || <Dash />}</td>
                                        <td className="tsp-col-project">
                                            <span className="tsp-project-tag">{task.project_name || <Dash />}</span>
                                        </td>
                                        <td className="tsp-col-user"><UserCell name={task.assigned_to_name} /></td>
                                        <td className="tsp-col-user"><UserCell name={task.assigned_by_name} /></td>
                                        <td className="tsp-col-status"><StatusPill status={task.status} /></td>
                                        <td className="tsp-col-priority"><PriorityBadge priority={task.priority} /></td>
                                        <td className="tsp-col-date">{fmtDate(task.task_date) || <Dash />}</td>
                                        <td className="tsp-col-time">{fmtTime(task.start_time) || <Dash />}</td>
                                        <td className="tsp-col-time">{fmtTime(task.end_time) || <Dash />}</td>
                                        <td className="tsp-col-duration">
                                            {task.duration ? <span className="tsp-duration-badge">{task.duration}</span> : <Dash />}
                                        </td>
                                        <td className="tsp-col-reason">{task.reason || <Dash />}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" className="tsp-empty-table">
                                        <div className="tsp-empty-icon-small">
                                            <GoTasklist />
                                        </div>
                                        <p>No tasks found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function TaskStatusPanel() {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [taskData, setTaskData] = useState(null);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    const filterTasks = (tasks) => {
        if (!tasks) return tasks;
        let filtered = tasks;
        
        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(t => 
                t.title?.toLowerCase().includes(term) ||
                t.description?.toLowerCase().includes(term) ||
                t.project_name?.toLowerCase().includes(term) ||
                t.assigned_to_name?.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    };

    useEffect(() => {
        const load = async () => {
            setTeamsLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/teams/team-list`);
                const json = await res.json();
                if (json.success) setTeams(json.data);
            } catch (err) { console.error("Teams fetch error:", err); }
            setTeamsLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedTeam) { setTaskData(null); return; }

        setStatusFilter("all");
        setSearchTerm("");

        const load = async () => {
            setTasksLoading(true);
            try {
                const res = await fetch(`${TASK_API}/task-List-ByTeam?team_id=${selectedTeam}`);
                const json = await res.json();
                if (json.success) setTaskData(json);
            } catch (err) { console.error("Tasks fetch error:", err); }
            setTasksLoading(false);
        };
        load();
    }, [selectedTeam]);

    const getTeamName = () => {
        const team = teams.find(t => t.id === selectedTeam);
        return team?.name || "Selected Team";
    };

    const totalFilteredTasks = (taskData?.tl_tasks?.length || 0) + (taskData?.tm_tasks?.length || 0);

    return (
        <div className="tsp-container">
            <div className="tsp-inner">
                {/* ── Hero Section ── */}
                <div className="tsp-hero">
                    <div className="tsp-hero-content">
                        <div className="tsp-hero-icon">
                            <Lottie animationData={animationData} style={{ width: "56px", height: "56px" }} />
                        </div>
                        <div>
                            <div className="tsp-hero-badge"><FaRocket /> Task Management</div>
                            <h1 className="tsp-hero-title">Task Dashboard</h1>
                            <p className="tsp-hero-subtitle">Monitor and track team task progress at a glance</p>
                        </div>
                    </div>
                    <div className="tsp-hero-stats">
                        <div className="tsp-hero-stat">
                            <span className="tsp-hero-stat-value">{taskData?.summary?.total_tasks ?? 0}</span>
                            <span className="tsp-hero-stat-label">Total</span>
                        </div>
                        <div className="tsp-hero-stat">
                            <span className="tsp-hero-stat-value" style={{ color: '#10b981' }}>{taskData?.summary?.completed ?? 0}</span>
                            <span className="tsp-hero-stat-label">Completed</span>
                        </div>
                        <div className="tsp-hero-stat">
                            <span className="tsp-hero-stat-value" style={{ color: '#f59e0b' }}>
                                {(taskData?.summary?.in_progress ?? 0) + (taskData?.summary?.pending ?? 0)}
                            </span>
                            <span className="tsp-hero-stat-label">Active</span>
                        </div>
                        <div className="tsp-hero-stat">
                            <span className="tsp-hero-stat-value" style={{ color: '#ef4444' }}>{taskData?.summary?.hold ?? 0}</span>
                            <span className="tsp-hero-stat-label">On Hold</span>
                        </div>
                    </div>
                </div>

                {/* ── Team Selector ── */}
                <div className="tsp-team-selector">
                    <div className="tsp-team-selector-left">
                        <HiUserGroup className="tsp-team-icon" />
                        <select
                            className="tsp-team-select"
                            value={selectedTeam}
                            onChange={e => setSelectedTeam(e.target.value)}
                            disabled={teamsLoading}
                        >
                            <option value="">
                                {teamsLoading ? "Loading teams…" : "Choose a team"}
                            </option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        {selectedTeam && (
                            <span className="tsp-team-name">{getTeamName()}</span>
                        )}
                    </div>
                    <div className="tsp-team-selector-right">
                        <div className="tsp-search-box">
                            <FiSearch className="tsp-search-icon" />
                            <input
                                type="text"
                                placeholder="Search tasks…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="tsp-search-input"
                                disabled={!selectedTeam}
                            />
                            {searchTerm && (
                                <button className="tsp-search-clear" onClick={() => setSearchTerm("")}>
                                    <FiX />
                                </button>
                            )}
                        </div>
                        <div className="tsp-view-toggle">
                            <button 
                                className={`tsp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <FiGrid />
                            </button>
                            <button 
                                className={`tsp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                <FiList />
                            </button>
                        </div>
                        <button 
                            className={`tsp-filter-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            disabled={!selectedTeam}
                        >
                            <FiFilter />
                            <span>Filter</span>
                            {statusFilter !== "all" && (
                                <span className="tsp-filter-count">1</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── No team chosen ── */}
                {!selectedTeam && (
                    <div className="tsp-empty-state">
                        <div className="tsp-empty-icon">
                            <HiUserGroup />
                        </div>
                        <h3>Select a Team</h3>
                        <p>Choose a team from the dropdown above to view their tasks</p>
                    </div>
                )}

                {/* ── Loading ── */}
                {selectedTeam && tasksLoading && (
                    <div className="tsp-loader">
                        <div className="tsp-loader-ring"></div>
                        <span>Loading tasks…</span>
                    </div>
                )}

                {/* ── Content ── */}
                {selectedTeam && !tasksLoading && taskData && (
                    <>
                        {/* Stats Grid */}
                        <StatsGrid
                            s={taskData.summary || {}}
                            onFilter={(status) => {
                                setStatusFilter(status);
                                setShowFilters(false);
                            }}
                            active={statusFilter}
                        />

                        {/* Filter bar */}
                        {showFilters && (
                            <div className="tsp-filter-bar">
                                <div className="tsp-filter-options">
                                    <span className="tsp-filter-label">Filter by status:</span>
                                    {Object.entries(STATUS_META).map(([key, meta]) => (
                                        <button
                                            key={key}
                                            className={`tsp-filter-chip ${statusFilter === key ? 'active' : ''}`}
                                            onClick={() => setStatusFilter(key)}
                                        >
                                            {meta.icon} {meta.label}
                                        </button>
                                    ))}
                                    <button
                                        className="tsp-filter-chip tsp-filter-clear"
                                        onClick={() => setStatusFilter("all")}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Results count */}
                        <div className="tsp-results-count">
                            <span className="tsp-results-number">{totalFilteredTasks}</span>
                            <span>task{totalFilteredTasks !== 1 ? 's' : ''}</span>
                            {statusFilter !== "all" && (
                                <span className="tsp-results-filter">
                                    · Filtered by {STATUS_META[statusFilter]?.label}
                                </span>
                            )}
                            {searchTerm && (
                                <span className="tsp-results-filter">
                                    · Search: "{searchTerm}"
                                </span>
                            )}
                        </div>

                        {/* Team Lead Tasks */}
                        <SectionBlock
                            icon={<FaUserTie />}
                            title="Team Lead Tasks"
                            subtitle="Tasks assigned to team leaders"
                            headerCls="tsp-section-header-tl"
                            badgeCls="tsp-section-badge-tl"
                            tasks={filterTasks(taskData.tl_tasks)}
                            type="tl"
                            viewMode={viewMode}
                        />

                        {/* Team Member Tasks */}
                        <SectionBlock
                            icon={<FaUsers />}
                            title="Team Member Tasks"
                            subtitle="Tasks assigned to team members"
                            headerCls="tsp-section-header-tm"
                            badgeCls="tsp-section-badge-tm"
                            tasks={filterTasks(taskData.tm_tasks)}
                            type="tm"
                            viewMode={viewMode}
                        />
                    </>
                )}
            </div>
        </div>
    );
}