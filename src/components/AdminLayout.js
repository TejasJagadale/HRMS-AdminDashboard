import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiLogOut, FiCalendar, FiUsers, FiMenu, FiX, FiFileText, FiShield } from 'react-icons/fi';
import '../styles/AdminLayout.css';
import { BsSuitcase2 } from 'react-icons/bs';
import { MdOutlineNotificationsActive } from 'react-icons/md';
import { GoOrganization } from 'react-icons/go';
import { IoTicketOutline } from 'react-icons/io5';
import { MdOutlineFolderCopy } from "react-icons/md";
import { MdOutlineAddTask } from "react-icons/md";
import logo from "../assets/flybirdslogo.png";
import { BsCurrencyDollar } from "react-icons/bs";

const AdminLayout = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">

            {/* Mobile top bar */}

            <div className="mobile-topbar">

                <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                    <FiMenu />
                </button>

                <div className="brand-section">
                    <img src={logo} alt="Logo" className="brand-logo" />
                    {/* <h2 className="mobile-brand">Admin Console</h2> */}
                </div>

            </div>

            {/* Overlay for mobile sidebar list*/}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>

                <div className="sidebar-header">

                    <div className="brand-section">
                        <img src={logo} alt="Logo" className="brand-logo" />
                        {/* <h2>Admin Console</h2> */}
                    </div>

                    <button className="sidebar-close-btn" onClick={closeSidebar}>
                        <FiX />
                    </button>

                </div>

                <nav className="sidebar-nav">

                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <FiHome className="nav-icon" /><span>Overview</span>
                    </NavLink>

                    <NavLink to="/admin/emp-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <FiUsers className="nav-icon" /> <span>Employee Directory</span>
                    </NavLink>

                    <NavLink to="/admin/attendance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <FiCalendar className="nav-icon" /> <span>Attendance Records</span>
                    </NavLink>

                    <NavLink to="/admin/pro-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <MdOutlineFolderCopy className="nav-icon" /> <span>Project Setup</span>
                    </NavLink>

                    <NavLink to="/admin/task-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <MdOutlineAddTask className="nav-icon" /> <span>Task Tracker</span>
                    </NavLink>

                    <NavLink to="/admin/leave-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <FiFileText className="nav-icon" /> <span>Leave Requests</span>
                    </NavLink>

                    <NavLink to="/admin/permission-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <FiShield className="nav-icon" /> <span>Access Permissions</span>
                    </NavLink>

                    <NavLink to="/admin/payroll-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <BsCurrencyDollar className="nav-icon" /> <span>Payroll Management</span>
                    </NavLink>

                    <NavLink to="/admin/add-holiday" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <BsSuitcase2 className="nav-icon" /> <span>Holiday Calendar</span>
                    </NavLink>

                    <NavLink to="/admin/add-notification" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <MdOutlineNotificationsActive className="nav-icon" /> <span>Alerts</span>
                    </NavLink>

                    <NavLink to="/admin/add-company" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <GoOrganization className="nav-icon" /><span>Organization Profile</span>
                    </NavLink>

                    <NavLink to="/admin/raise-ticket" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={closeSidebar}>
                        <IoTicketOutline className="nav-icon" /> <span>Support Ticket</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FiLogOut className="nav-icon" /><span>Logout</span>
                    </button>
                </div>
                
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            {/* <div className="content-area">

                <header className="content-header">
                    <button onClick={handleLogout} className="top-logout-btn">
                        Logout
                    </button>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>

            </div> */}

        </div>
    );
};

export default AdminLayout;