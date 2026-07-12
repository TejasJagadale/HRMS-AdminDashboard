import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../LottieFiles/Employee Search.json";

export default function AdminHeader({
  employees = [],
  searchTerm,
  setSearchTerm,
  selectedTeam,
  handleTeamChange,
  teamList = []
}) {
  const navigate = useNavigate();

  return (
    <div className="emplist-header">
      <div className="emplist-title">
        <Lottie animationData={animationData} style={{ width: "90px", height: "90px" }} />
        <div>
          <h1>Employee Management</h1>
        </div>
      </div>

      <div className="emplist-header-right">

        {/* 🔥 Global Buttons */}
        <div className="topbar-actions">
          <button
            className="btn-add"
            onClick={() => navigate("/admin/add-employee")}
          >
            + Add Employee
          </button>

          <button
            className="btn-add"
            onClick={() => navigate("/admin/add-team")}
          >
            + Add Team
          </button>

          {/* Optional Back */}
          <button
            className="btn-add"
            onClick={() => navigate("/admin/emp-list")}
          >
            Employee List
          </button>
        </div>

        {/* Team dropdown (optional per page) */}
        {handleTeamChange && (
          <div className="team-select-wrap">
            <select
              className="team-select"
              value={selectedTeam}
              onChange={handleTeamChange}
            >
              <option value="all">All Teams</option>
              {teamList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <FiChevronDown className="team-select-icon" />
          </div>
        )}

        {/* Search (optional per page) */}
        {setSearchTerm && (
          <div className="emplist-search-wrap">
            <FiSearch className="search-icon" />
            <input
              className="emplist-search"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

      </div>
    </div>
  );
}