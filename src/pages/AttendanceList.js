import React, { useState, useEffect } from 'react';
import '../styles/AttendanceList.css';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Completing Tasks.json';
import * as XLSX from "xlsx-js-style";
import { useLocation } from "react-router-dom";
import { createPortal } from 'react-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiBarChart2,
  FiRefreshCw,
  FiImage,
  FiUser,
  FiBriefcase,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiMinus,
  FiEye,
  FiPrinter,
  FiFileText,
  FiSettings
} from 'react-icons/fi';
import { FaUserCheck, FaUserTimes, FaUserClock, FaUserGraduate } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AttendanceList = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(
    location.state?.userType || 'emp_present'
  );
  const [selfiePopup, setSelfiePopup] = useState({ show: false, img: null, type: '' });
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [exportModal, setExportModal] = useState(false);
  const [exportTab, setExportTab] = useState('today');
  const [exportStartDate, setExportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportData, setExportData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportGenerated, setExportGenerated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchAttendance = async () => {
      try {
        let url = '';
        switch (userType) {
          case 'emp_present':
            url = `${BASE_URL}/attendance-list?date=${dateFilter}`;
            break;
          case 'intern_present':
            url = `${BASE_URL}/attendance-list-intern?date=${dateFilter}`;
            break;
          case 'emp_absent':
            url = `${BASE_URL}/attendance-List-absent?date=${dateFilter}`;
            break;
          case 'intern_absent':
            url = `${BASE_URL}/attendance-List-absentinten?date=${dateFilter}`;
            break;
          default:
            url = `${BASE_URL}/attendance-list?date=${dateFilter}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        if (isMounted && result.success && result.data) {
          setAttendanceData(result.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchAttendance, 10000);
        }
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [dateFilter, userType]);

  const getReportTitle = () => {
    switch (userType) {
      case 'emp_present': return 'Employee Check-in List';
      case 'intern_present': return 'Intern Check-in List';
      case 'emp_absent': return 'Employee Non Check-in List';
      case 'intern_absent': return 'Intern Non Check-in List';
      default: return 'Attendance Report';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '00:00:00') return '--';
    const parts = timeString.split(':');
    if (parts.length < 2) return '--';
    let hour = parseInt(parts[0], 10);
    let minute = parts[1];
    if (isNaN(hour) || !minute) return '--';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (timeString) => {
    if (!timeString || timeString === '00:00:00') return '--';
    const [hours, minutes] = timeString.split(':').map(Number);
    if (hours === 0 && minutes === 0) return '--';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const openMonthlyPage = () => {
    navigate("/admin/monthly-report", { state: { userType } });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      let url = '';
      switch (userType) {
        case 'emp_present':
          url = `${BASE_URL}/attendance-list?date=${dateFilter}`;
          break;
        case 'intern_present':
          url = `${BASE_URL}/attendance-list-intern?date=${dateFilter}`;
          break;
        case 'emp_absent':
          url = `${BASE_URL}/attendance-List-absent?date=${dateFilter}`;
          break;
        case 'intern_absent':
          url = `${BASE_URL}/attendance-List-absentinten?date=${dateFilter}`;
          break;
        default:
          url = `${BASE_URL}/attendance-list?date=${dateFilter}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (result.success && result.data) {
        setAttendanceData(result.data);
      }
    } catch (error) {
      console.error('Error refreshing attendance data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleGenerateExport = async () => {
    setExportLoading(true);
    setExportGenerated(false);
    try {
      const res = await fetch(
        `${BASE_URL}/attendance-List-date?start_date=${exportStartDate}&end_date=${exportEndDate}`
      );
      const result = await res.json();
      if (result.success && result.data) {
        setExportData(result.data);
        setExportGenerated(true);
      } else {
        setExportData([]);
        setExportGenerated(true);
      }
    } catch (err) {
      console.error('Export fetch error:', err);
      setExportData([]);
      setExportGenerated(true);
    } finally {
      setExportLoading(false);
    }
  };

  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const date = item.attendance_date || 'Unknown';
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const exportTodayExcel = () => {
    const worksheetData = attendanceData.map((item, index) => ({
      "S.No": index + 1,
      "Employee Name": item.name || "-",
      "Date": item.attendance_date || "-",
      "Check In": formatTime(item.check_in),
      "Break In": formatTime(item.break_in),
      "Break Out": formatTime(item.break_out),
      "Total Break": `${item.total_break_minutes || 0} min`,
      "Check Out": formatTime(item.check_out),
      "Status": item.type || "-",
      "Worked Hours": formatDuration(item.worked_hours),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { origin: "A5" });
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["MPeoples Business Solutions Pvt Ltd"],
      [getReportTitle()],
      [`Date: ${dateFilter}`],
      []
    ], { origin: "A1" });

    ["A1", "A2", "A3"].forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, sz: cell === "A1" ? 16 : 14 },
          alignment: { horizontal: "center" }
        };
      }
    });

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }
    ];

    worksheet["!cols"] = [
      { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    XLSX.writeFile(workbook, `${getReportTitle().replace(/\s+/g, '_')}_${dateFilter}.xlsx`);
    setExportModal(false);
  };

  const exportTodayPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("MPeoples Business Solutions Pvt Ltd", 14, 10);
    doc.setFontSize(12);
    doc.text(getReportTitle(), 14, 18);
    doc.text(`Date: ${dateFilter}`, 14, 25);

    const columns = [
      "S.No", "Employee Name", "Date", "Check In", "Break In",
      "Break Out", "Total Break", "Check Out", "Status", "Worked Hours"
    ];

    const rows = attendanceData.map((item, index) => [
      index + 1,
      item.name || "-",
      item.attendance_date || "-",
      formatTime(item.check_in),
      formatTime(item.break_in),
      formatTime(item.break_out),
      `${item.total_break_minutes || 0} min`,
      formatTime(item.check_out),
      item.type || "-",
      formatDuration(item.worked_hours)
    ]);

    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
    });

    doc.save(`${getReportTitle().replace(/\s+/g, "_")}_${dateFilter}.pdf`);
    setExportModal(false);
  };

  const exportRangeExcel = () => {
    const workbook = XLSX.utils.book_new();
    const grouped = groupByDate(exportData);

    Object.entries(grouped).forEach(([date, records]) => {
      const worksheetData = records.map((item, index) => ({
        "S.No": index + 1,
        "Employee Name": item.name || "-",
        "Date": item.attendance_date || "-",
        "Check In": formatTime(item.check_in),
        "Break In": formatTime(item.break_in),
        "Break Out": formatTime(item.break_out),
        "Total Break": `${item.total_break_minutes || 0} min`,
        "Check Out": formatTime(item.check_out),
        "Status": item.type || "-",
        "Worked Hours": formatDuration(item.worked_hours),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData, { origin: "A5" });
      XLSX.utils.sheet_add_aoa(worksheet, [
        ["MPeoples Business Solutions Pvt Ltd"],
        [getReportTitle()],
        [`Date: ${date}`],
        []
      ], { origin: "A1" });

      ["A1", "A2", "A3"].forEach(cell => {
        if (worksheet[cell]) {
          worksheet[cell].s = {
            font: { bold: true, sz: cell === "A1" ? 16 : 14 },
            alignment: { horizontal: "center" }
          };
        }
      });

      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }
      ];

      worksheet["!cols"] = [
        { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 18 }
      ];

      const sheetName = date.replace(/\//g, '-').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, `Attendance_${exportStartDate}_to_${exportEndDate}.xlsx`);
    setExportModal(false);
  };

  const exportRangePDF = () => {
    const doc = new jsPDF();
    const grouped = groupByDate(exportData);
    const dates = Object.keys(grouped);

    dates.forEach((date, pageIndex) => {
      if (pageIndex > 0) doc.addPage();

      doc.setFontSize(14);
      doc.text("MPeoples Business Solutions Pvt Ltd", 14, 10);
      doc.setFontSize(12);
      doc.text(getReportTitle(), 14, 18);
      doc.text(`Date: ${date}`, 14, 25);

      const columns = [
        "S.No", "Employee Name", "Date", "Check In", "Break In",
        "Break Out", "Total Break", "Check Out", "Status", "Worked Hours"
      ];
      const rows = grouped[date].map((item, index) => [
        index + 1,
        item.name || "-",
        item.attendance_date || "-",
        formatTime(item.check_in),
        formatTime(item.break_in),
        formatTime(item.break_out),
        `${item.total_break_minutes || 0} min`,
        formatTime(item.check_out),
        item.type || "-",
        formatDuration(item.worked_hours)
      ]);

      autoTable(doc, {
        startY: 30,
        head: [columns],
        body: rows,
        styles: { fontSize: 8 },
      });
    });

    doc.save(`Attendance_${exportStartDate}_to_${exportEndDate}.pdf`);
    setExportModal(false);
  };

  const modalPickerSlotProps = (extraTextFieldStyle = {}) => ({
    textField: {
      size: 'small',
      style: { background: '#fff', borderRadius: '8px', ...extraTextFieldStyle },
    },
    popper: {
      style: { zIndex: 999999 },
    },
    desktopPaper: {
      style: { zIndex: 999999 },
    },
  });

  const tabConfig = [
    { key: 'emp_present', label: 'Employees', sub: 'Check-in', icon: <FiUsers />, badge: 'present' },
    { key: 'intern_present', label: 'Interns', sub: 'Check-in', icon: <FaUserGraduate />, badge: 'present' },
    { key: 'emp_absent', label: 'Employees', sub: 'Non check-in', icon: <FiXCircle />, badge: 'absent' },
    { key: 'intern_absent', label: 'Interns', sub: 'Non check-in', icon: <FaUserClock />, badge: 'absent' },
  ];

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(r => r.type === 'PRESENT').length,
    absent: attendanceData.filter(r => r.type === 'ABSENT').length,
    onLeave: attendanceData.filter(r => ['LOP', 'SICK', 'CASUAL', 'LEAVE'].includes(r.type)).length,
    onDuty: attendanceData.filter(r => r.type === 'ONDUTY').length,
    halfDay: attendanceData.filter(r => r.type === 'HALFDAY').length,
    holiday: attendanceData.filter(r => ['L-H', 'C-H', 'W-H'].includes(r.type)).length,
  };

  if (loading) {
    return (
      <div className="al-container">
        <div className="al-loader-wrapper">
          <div className="al-loader-ring"></div>
          <p className="al-loader-text">Loading attendance records…</p>
          <span className="al-loader-sub">Please wait while we fetch the data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="al-container">

      {/* ── HEADER ── */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">
            <Lottie animationData={animationData} style={{ width: "56px", height: "56px" }} />
          </div>
          <div>
            <div className="al-header-badge">
              <FiCalendar /> {formatDate(dateFilter)}
            </div>
            <h1 className="al-header-title">Attendance Overview</h1>
            <p className="al-header-subtitle">{attendanceData.length} records · Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="al-header-right">
          <button className="al-btn al-btn-primary" onClick={openMonthlyPage}>
            <FiBarChart2 /> Monthly Report
          </button>
          <button className="al-btn al-btn-success" onClick={() => {
            setExportModal(true);
            setExportTab('today');
            setExportGenerated(false);
            setExportData([]);
          }}>
            <FiDownload /> Export
          </button>
          <button className="al-btn al-btn-icon" onClick={handleRefresh} disabled={isRefreshing}>
            <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="al-stats-grid">
        <div className="al-stat-card al-stat-total">
          <div className="al-stat-icon"><FiUsers /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.total}</span>
            <span className="al-stat-label">Total Records</span>
          </div>
        </div>
        <div className="al-stat-card al-stat-present">
          <div className="al-stat-icon"><FiCheckCircle /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.present}</span>
            <span className="al-stat-label">Present</span>
            <span className="al-stat-trend positive">{stats.total > 0 ? Math.round((stats.present/stats.total)*100) : 0}%</span>
          </div>
        </div>
        <div className="al-stat-card al-stat-absent">
          <div className="al-stat-icon"><FiXCircle /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.absent}</span>
            <span className="al-stat-label">Absent</span>
            <span className="al-stat-trend negative">{stats.total > 0 ? Math.round((stats.absent/stats.total)*100) : 0}%</span>
          </div>
        </div>
        <div className="al-stat-card al-stat-leave">
          <div className="al-stat-icon"><FiClock /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.onLeave}</span>
            <span className="al-stat-label">On Leave</span>
          </div>
        </div>
        <div className="al-stat-card al-stat-duty">
          <div className="al-stat-icon"><FiBriefcase /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.onDuty}</span>
            <span className="al-stat-label">On Duty</span>
          </div>
        </div>
        <div className="al-stat-card al-stat-halfday">
          <div className="al-stat-icon"><FiMinus /></div>
          <div className="al-stat-content">
            <span className="al-stat-value">{stats.halfDay}</span>
            <span className="al-stat-label">Half Day</span>
          </div>
        </div>
      </div>

      {/* ── CONTROL BAR ── */}
      <div className="al-control-bar">
        <div className="al-tab-group">
          {tabConfig.map((t) => (
            <button
              key={t.key}
              className={`al-tab ${userType === t.key ? 'is-active' : ''}`}
              onClick={() => { setUserType(t.key); setLoading(true); }}
            >
              <span className="al-tab-icon">{t.icon}</span>
              <span className="al-tab-label">{t.label}</span>
              <span className="al-tab-sub">{t.sub}</span>
              <span className={`al-tab-badge ${t.badge}`}>{t.badge === 'present' ? '✓' : '✗'}</span>
            </button>
          ))}
        </div>

        <div className="al-controls-right">
          <div className="al-date-picker">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dayjs(dateFilter)}
                onChange={(newValue) => {
                  if (newValue && newValue.isValid()) {
                    setDateFilter(newValue.format('YYYY-MM-DD'));
                  }
                }}
                format="DD/MM/YYYY"
                views={['year', 'month', 'day']}
                openTo="day"
                slotProps={{
                  textField: {
                    size: 'small',
                    style: { background: '#fff', borderRadius: '10px', width: '180px' }
                  }
                }}
              />
            </LocalizationProvider>
          </div>
          <button className="al-btn al-btn-today" onClick={() => {
            setDateFilter(new Date().toISOString().split('T')[0]);
            setLoading(true);
          }}>
            Today
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="al-table-wrapper">
        <div className="al-table-scroll">
          <table className="al-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Break In</th>
                <th>Break Out</th>
                <th>Total Break</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Late By</th>
                <th>Worked Hours</th>
                <th>Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record, index) => (
                  <tr key={record.id} className="al-table-row">
                    <td className="al-col-index">{index + 1}</td>
                    <td>
                      <div className="al-employee-info">
                        <div className="al-employee-avatar" style={{ 
                          background: `hsl(${record.name ? record.name.length * 30 : 0}, 70%, 60%)` 
                        }}>
                          {record.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="al-employee-name">{record.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="al-col-date">{formatDate(record.attendance_date)}</td>
                    <td>
                      <div className="al-time-cell">
                        {record.type !== 'ABSENT' && record.selfie_img ? (
                          <img
                            src={record.selfie_img}
                            alt="selfie"
                            onClick={() => setSelfiePopup({ show: true, img: record.selfie_img, type: 'Check-in' })}
                            className="al-selfie-thumb"
                          />
                        ) : (
                          <div className="al-selfie-placeholder">
                            <FiImage />
                          </div>
                        )}
                        <span className="al-time-badge al-time-in">
                          {record.type === 'ABSENT' ? '--' : formatTime(record.check_in)}
                        </span>
                      </div>
                    </td>
                    <td>{record.type === 'ABSENT' ? '--' : formatTime(record.break_in)}</td>
                    <td>{record.type === 'ABSENT' ? '--' : formatTime(record.break_out)}</td>
                    <td className="al-col-break">{record.type === 'ABSENT' ? '--' : `${record.total_break_minutes || 0}m`}</td>
                    <td>
                      <div className="al-time-cell">
                        {record.type !== 'ABSENT' && record.checkout_selfie_img ? (
                          <img
                            src={record.checkout_selfie_img}
                            alt="checkout"
                            onClick={() => setSelfiePopup({ show: true, img: record.checkout_selfie_img, type: 'Check-out' })}
                            className="al-selfie-thumb"
                          />
                        ) : (
                          <div className="al-selfie-placeholder">
                            <FiImage />
                          </div>
                        )}
                        <span className="al-time-badge al-time-out">
                          {record.type === 'ABSENT' ? '--' : formatTime(record.check_out)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="al-status-cell">
                        <span className={`al-status-badge al-status-${record.type?.toLowerCase() || 'unknown'}`}>
                          {{
                            'PRESENT': 'Present',
                            'ABSENT': 'Absent',
                            'HALFDAY': 'Half Day',
                            'LEAVE': 'Leave',
                            'L-H': 'Local Holiday',
                            'C-H': 'Casual Holiday',
                            'W-H': 'Weekend Holiday',
                            'SICK': 'Sick Leave',
                            'CASUAL': 'Casual Leave',
                            'LOP': 'Loss of Pay',
                            'ONDUTY': 'On Duty'
                          }[record.type] || record.type || 'Unknown'}
                        </span>
                        {record.late_checkin === 1 && (
                          <span className="al-late-tag">Late</span>
                        )}
                      </div>
                    </td>
                    <td className="al-col-late">{record.late_checkin === 1 ? formatDuration(record.late_checkin_time) : '--'}</td>
                    <td className="al-col-hours">{formatDuration(record.worked_hours)}</td>
                    <td className="al-col-hours al-col-shortfall">{formatDuration(record.overtimed_hours)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="al-empty-state">
                    <div className="al-empty-content">
                      <FiCalendar className="al-empty-icon" />
                      <p>No attendance records found</p>
                      <span>Try selecting a different date or filter</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SELFIE POPUP ── */}
      {selfiePopup.show && createPortal(
        <div className="al-overlay" onClick={() => setSelfiePopup({ show: false, img: null, type: '' })}>
          <div className="al-popup" onClick={(e) => e.stopPropagation()}>
            <div className="al-popup-header">
              <span className="al-popup-badge">{selfiePopup.type} Selfie</span>
              <button className="al-popup-close-btn" onClick={() => setSelfiePopup({ show: false, img: null, type: '' })}>
                <FiXCircle />
              </button>
            </div>
            <img src={selfiePopup.img} alt="selfie" className="al-popup-image" />
          </div>
        </div>,
        document.body
      )}

      {/* ── EXPORT MODAL ── */}
      {exportModal && createPortal(
        <div className="al-overlay" onClick={() => setExportModal(false)}>
          <div className="al-modal" onClick={(e) => e.stopPropagation()}>
            <div className="al-modal-header">
              <div>
                <h2>Export Report</h2>
                <p className="al-modal-sub">Choose your export format and date range</p>
              </div>
              <button className="al-modal-close" onClick={() => setExportModal(false)}>
                <FiXCircle />
              </button>
            </div>

            <div className="al-modal-tabs">
              <button
                className={`al-modal-tab ${exportTab === 'today' ? 'is-active' : ''}`}
                onClick={() => setExportTab('today')}
              >
                <FiFileText /> Today
              </button>
              <button
                className={`al-modal-tab ${exportTab === 'range' ? 'is-active' : ''}`}
                onClick={() => {
                  setExportTab('range');
                  setExportGenerated(false);
                  setExportData([]);
                }}
              >
                <FiCalendar /> Date Range
              </button>
            </div>

            <div className="al-modal-body">
              {exportTab === 'today' && (
                <>
                  <div className="al-export-info">
                    <div className="al-export-title">{getReportTitle()}</div>
                    <div className="al-export-meta">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(dateFilter)}
                          onChange={(newValue) => {
                            if (newValue && newValue.isValid()) {
                              setDateFilter(newValue.format('YYYY-MM-DD'));
                            }
                          }}
                          format="DD/MM/YYYY"
                          views={['year', 'month', 'day']}
                          openTo="day"
                          slotProps={modalPickerSlotProps({ width: '160px' })}
                        />
                      </LocalizationProvider>
                      <span className="al-export-count">{attendanceData.length} records</span>
                    </div>
                  </div>

                  {attendanceData.length === 0 ? (
                    <div className="al-export-empty">
                      <FiAlertCircle />
                      <p>No records found for the selected date.</p>
                    </div>
                  ) : (
                    <div className="al-export-actions">
                      <button onClick={exportTodayExcel} className="al-btn al-btn-excel">
                        <FiDownload /> Excel (.xlsx)
                      </button>
                      <button onClick={exportTodayPDF} className="al-btn al-btn-pdf">
                        <FiDownload /> PDF
                      </button>
                    </div>
                  )}
                </>
              )}

              {exportTab === 'range' && (
                <>
                  <div className="al-export-range">
                    <div className="al-export-field">
                      <label>Start Date</label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(exportStartDate)}
                          onChange={(newValue) => {
                            if (newValue && newValue.isValid()) {
                              setExportStartDate(newValue.format('YYYY-MM-DD'));
                              setExportGenerated(false);
                            }
                          }}
                          format="DD/MM/YYYY"
                          views={['year', 'month', 'day']}
                          openTo="day"
                          slotProps={modalPickerSlotProps({ width: '100%' })}
                        />
                      </LocalizationProvider>
                    </div>

                    <div className="al-export-field">
                      <label>End Date</label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(exportEndDate)}
                          onChange={(newValue) => {
                            if (newValue && newValue.isValid()) {
                              setExportEndDate(newValue.format('YYYY-MM-DD'));
                              setExportGenerated(false);
                            }
                          }}
                          format="DD/MM/YYYY"
                          views={['year', 'month', 'day']}
                          openTo="day"
                          slotProps={modalPickerSlotProps({ width: '100%' })}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateExport}
                    disabled={exportLoading}
                    className="al-btn al-btn-generate"
                  >
                    {exportLoading ? 'Generating...' : 'Generate Report'}
                  </button>

                  {exportGenerated && (
                    <div className="al-export-result">
                      {exportData.length === 0 ? (
                        <div className="al-export-empty">
                          <FiAlertCircle />
                          <p>No records found for the selected range.</p>
                        </div>
                      ) : (
                        <>
                          <div className="al-export-summary">
                            <span className="al-export-summary-number">{exportData.length}</span>
                            records across <span className="al-export-summary-number">{Object.keys(groupByDate(exportData)).length}</span> days
                          </div>
                          <div className="al-export-actions">
                            <button onClick={exportRangeExcel} className="al-btn al-btn-excel">
                              <FiDownload /> Excel (.xlsx)
                            </button>
                            <button onClick={exportRangePDF} className="al-btn al-btn-pdf">
                              <FiDownload /> PDF
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AttendanceList;