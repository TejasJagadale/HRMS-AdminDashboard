import React, { useState, useEffect } from 'react';
import '../styles/DashboardHome.css';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaClock, 
  FaCalendarDay,
  FaArrowRight,
  FaUserCircle,
  FaBriefcase,
  FaIdBadge
} from 'react-icons/fa';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiActivity,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiClockIcon
} from 'react-icons/fi';
import { IoCalendarOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DashboardHome = () => {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        total_employees: 0,
        present_count: 0,
        absent_count: 0,
        late_checkin_count: 0
    });
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/dashboard-list`);
                const result = await response.json();
                if (result.success) {
                    setDashboardData(result.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        const loadAdminData = () => {
            try {
                const possibleKeys = ['user', 'adminData', 'admin', 'userData', 'authUser'];
                let foundData = null;

                for (let key of possibleKeys) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (parsed && typeof parsed === 'object') {
                                if (parsed.user) {
                                    foundData = parsed.user;
                                } else {
                                    foundData = parsed;
                                }
                                break;
                            }
                        } catch (e) { }
                    }
                }

                setAdminData(foundData);
            } catch (error) {
                console.error("Error loading admin data", error);
            }
        };

        fetchDashboardData();
        loadAdminData();

        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const { total_employees, present_count, absent_count, late_checkin_count } = dashboardData;

    const getInitials = (name) => {
        if (!name) return 'AD';
        return name.substring(0, 2).toUpperCase();
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `https://mps.mpdatahub.com/images/${imagePath}`;
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    // Calculate percentages
    const presentPercentage = total_employees > 0 
        ? (present_count / total_employees * 100).toFixed(0) 
        : 0;
    const absentPercentage = total_employees > 0 
        ? (absent_count / total_employees * 100).toFixed(0) 
        : 0;
    const latePercentage = total_employees > 0 
        ? (late_checkin_count / total_employees * 100).toFixed(0) 
        : 0;

    if (loading) {
        return (
            <div className="dashboard-home loading-container">
                <div className="loader-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-home">
            {/* ── WELCOME BANNER ── */}
            <div className="welcome-banner fade-in-up">
                <div className="welcome-content">
                    <div className="welcome-left">
                        <div className="welcome-greeting">
                            <span className="greeting-icon">👋</span>
                            <div>
                                <span className="greeting-text">{getGreeting()},</span>
                                <h1 className="welcome-name">{adminData?.name || 'Admin'}</h1>
                            </div>
                        </div>
                        <div className="welcome-meta">
                            <span className="meta-badge">
                                <IoCalendarOutline />
                                {formatDate(currentTime)}
                            </span>
                            <span className="meta-badge">
                                <IoTimeOutline />
                                {formatTime(currentTime)}
                            </span>
                        </div>
                        <p className="welcome-subtitle">
                            Here's what's happening with your team today
                        </p>
                    </div>

                    {adminData && (
                        <div className="profile-card">
                            <div className="profile-avatar">
                                {adminData.profile_img && (
                                    <img
                                        src={getImageUrl(adminData.profile_img)}
                                        alt="Profile"
                                        onError={(e) => { 
                                            e.target.style.display = 'none'; 
                                            e.target.nextElementSibling.style.display = 'flex'; 
                                        }}
                                    />
                                )}
                                <div className="avatar-fallback" style={{ display: adminData.profile_img ? 'none' : 'flex' }}>
                                    {getInitials(adminData.name)}
                                </div>
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name">{adminData.name || 'Unnamed User'}</h3>
                                <div className="profile-role">
                                    <FaBriefcase />
                                    {adminData.position || adminData.role || 'Team Member'}
                                </div>
                                <div className="profile-id">
                                    <FaIdBadge />
                                    {adminData.empid || 'ID not available'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="stats-grid">
                <div className="stat-card-modern fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                        <FaUsers />
                    </div>
                    <div className="stat-card-content">
                        <span className="stat-card-label">Total Employees</span>
                        <span className="stat-card-value">{total_employees}</span>
                        <span className="stat-card-trend">
                            <FiTrendingUp /> Active members
                        </span>
                    </div>
                </div>

                <div 
                    className="stat-card-modern clickable fade-in-up" 
                    style={{ animationDelay: '0.2s' }}
                    onClick={() => navigate("/admin/attendance")}
                >
                    <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                        <FaUserCheck />
                    </div>
                    <div className="stat-card-content">
                        <span className="stat-card-label">Checked In Today</span>
                        <span className="stat-card-value">{present_count}</span>
                        <span className="stat-card-trend positive">
                            <FiTrendingUp /> {presentPercentage}% turnout
                        </span>
                    </div>
                </div>

                <div 
                    className="stat-card-modern clickable fade-in-up" 
                    style={{ animationDelay: '0.3s' }}
                    onClick={() => navigate("/admin/attendance", {
                        state: { userType: "emp_absent" }
                    })}
                >
                    <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <FaUserTimes />
                    </div>
                    <div className="stat-card-content">
                        <span className="stat-card-label">Not Marked Present</span>
                        <span className="stat-card-value">{absent_count}</span>
                        <span className="stat-card-trend negative">
                            <FiTrendingDown /> {absentPercentage}% absent
                        </span>
                    </div>
                </div>

                <div 
                    className="stat-card-modern clickable fade-in-up" 
                    style={{ animationDelay: '0.4s' }}
                    onClick={() => navigate("/admin/attendance")}
                >
                    <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <FaClock />
                    </div>
                    <div className="stat-card-content">
                        <span className="stat-card-label">Delayed Check-ins</span>
                        <span className="stat-card-value">{late_checkin_count}</span>
                        <span className="stat-card-trend warning">
                            <FiClockIcon /> {latePercentage}% late
                        </span>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="dashboard-main">
                {/* ── ATTENDANCE BREAKDOWN ── */}
                <div className="breakdown-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="card-header">
                        <div className="card-header-left">
                            <FiActivity className="header-icon" />
                            <h2>Attendance Breakdown</h2>
                        </div>
                        <span className="header-badge">Today's Report</span>
                    </div>

                    <div className="breakdown-content">
                        <div className="breakdown-item">
                            <div className="breakdown-label">
                                <span className="breakdown-dot present-dot"></span>
                                <span>Present</span>
                                <span className="breakdown-count">{present_count}</span>
                            </div>
                            <div className="breakdown-bar">
                                <div 
                                    className="breakdown-fill present-fill" 
                                    style={{ width: `${Math.max(presentPercentage, 2)}%` }}
                                ></div>
                            </div>
                            <span className="breakdown-percentage">{presentPercentage}%</span>
                        </div>

                        <div className="breakdown-item">
                            <div className="breakdown-label">
                                <span className="breakdown-dot absent-dot"></span>
                                <span>Absent</span>
                                <span className="breakdown-count">{absent_count}</span>
                            </div>
                            <div className="breakdown-bar">
                                <div 
                                    className="breakdown-fill absent-fill" 
                                    style={{ width: `${Math.max(absentPercentage, 2)}%` }}
                                ></div>
                            </div>
                            <span className="breakdown-percentage">{absentPercentage}%</span>
                        </div>

                        <div className="breakdown-item">
                            <div className="breakdown-label">
                                <span className="breakdown-dot late-dot"></span>
                                <span>Late</span>
                                <span className="breakdown-count">{late_checkin_count}</span>
                            </div>
                            <div className="breakdown-bar">
                                <div 
                                    className="breakdown-fill late-fill" 
                                    style={{ width: `${Math.max(latePercentage, 2)}%` }}
                                ></div>
                            </div>
                            <span className="breakdown-percentage">{latePercentage}%</span>
                        </div>
                    </div>
                </div>

                {/* ── QUICK ACTIONS ── */}
                <div className="quick-actions-card fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="card-header">
                        <div className="card-header-left">
                            <FaArrowRight className="header-icon" />
                            <h2>Quick Actions</h2>
                        </div>
                    </div>

                    <div className="quick-actions-grid">
                        <button 
                            className="quick-action-btn"
                            onClick={() => navigate("/admin/attendance")}
                        >
                            <div className="quick-action-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                <FiUser />
                            </div>
                            <div className="quick-action-info">
                                <span className="quick-action-title">View Attendance</span>
                                <span className="quick-action-desc">Check today's records</span>
                            </div>
                            <FaArrowRight className="quick-action-arrow" />
                        </button>

                        <button 
                            className="quick-action-btn"
                            onClick={() => navigate("/admin/company-details")}
                        >
                            <div className="quick-action-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                                <FaUsers />
                            </div>
                            <div className="quick-action-info">
                                <span className="quick-action-title">Manage Companies</span>
                                <span className="quick-action-desc">Add or edit companies</span>
                            </div>
                            <FaArrowRight className="quick-action-arrow" />
                        </button>

                        <button 
                            className="quick-action-btn"
                            onClick={() => navigate("/admin/raise-ticket")}
                        >
                            <div className="quick-action-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                                <FiClockIcon />
                            </div>
                            <div className="quick-action-info">
                                <span className="quick-action-title">Raise Ticket</span>
                                <span className="quick-action-desc">Submit correction request</span>
                            </div>
                            <FaArrowRight className="quick-action-arrow" />
                        </button>

                        <button 
                            className="quick-action-btn"
                            onClick={() => navigate("/admin/employee")}
                        >
                            <div className="quick-action-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                                <IoPersonOutline />
                            </div>
                            <div className="quick-action-info">
                                <span className="quick-action-title">Employee List</span>
                                <span className="quick-action-desc">View all employees</span>
                            </div>
                            <FaArrowRight className="quick-action-arrow" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;