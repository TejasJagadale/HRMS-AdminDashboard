import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/Payroll.css';
import logo from "../assets/ass.jpeg";
import {
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiEye,
  FiPrinter,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiGrid,
  FiList,
  FiSettings,
  FiUser,
  FiBriefcase,
  FiAward,
  FiPieChart,
} from 'react-icons/fi';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Completing Tasks.json';

const BASE_URL = 'https://mps.mpdatahub.com/api';

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ─────────────────────────────────────────────
   AMOUNT TO WORDS
───────────────────────────────────────────── */
function amountToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];

  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero Rupees Only';

  function convertHundreds(n) {
    let str = '';
    if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) str += ones[n] + ' ';
    return str;
  }

  let n = Math.floor(amount);
  let result = '';
  if (n >= 10000000) { result += convertHundreds(Math.floor(n / 10000000)) + 'Crore '; n %= 10000000; }
  if (n >= 100000) { result += convertHundreds(Math.floor(n / 100000)) + 'Lakh '; n %= 100000; }
  if (n >= 1000) { result += convertHundreds(Math.floor(n / 1000)) + 'Thousand '; n %= 1000; }
  if (n > 0) result += convertHundreds(n);

  return result.trim() + ' Rupees Only';
}

/* ─────────────────────────────────────────────
   PAYSLIP PRINT MODAL
───────────────────────────────────────────── */
function PayslipModal({ slip, employee, onClose, logoSrc }) {
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    let clone = null;
    try {
      const DESKTOP_W = 780;

      clone = printRef.current.cloneNode(true);

      Object.assign(clone.style, {
        position: 'fixed',
        top: '-99999px',
        left: '-99999px',
        width: `${DESKTOP_W}px`,
        minWidth: `${DESKTOP_W}px`,
        maxWidth: `${DESKTOP_W}px`,
        background: '#ffffff',
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        color: '#111110',
        overflow: 'visible',
        zIndex: '-1',
      });

      const edGrid = clone.querySelector('.ps-ed-grid');
      if (edGrid) {
        edGrid.style.display = 'grid';
        edGrid.style.gridTemplateColumns = '1fr 1fr';
        edGrid.style.gap = '14px';
      }

      const infoBand = clone.querySelector('.ps-info-band');
      if (infoBand) {
        infoBand.style.display = 'grid';
        infoBand.style.gridTemplateColumns = 'repeat(3, 1fr)';
      }

      const attGrid = clone.querySelector('.ps-attendance-grid');
      if (attGrid) {
        attGrid.style.display = 'grid';
        attGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      }

      const logoImg = clone.querySelector('.ps-logo');
      if (logoImg && logoSrc) logoImg.src = logoSrc;

      document.body.appendChild(clone);

      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: DESKTOP_W,
        width: DESKTOP_W,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const A4_W = 210;
      const A4_H = 297;
      const MARGIN = 10;
      const printW = A4_W - MARGIN * 2;

      const pxPerMm = canvas.width / printW;
      const contentH = canvas.height / pxPerMm;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      if (contentH <= A4_H - MARGIN * 2) {
        pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, printW, contentH);
      } else {
        const pageContentH = A4_H - MARGIN * 2;
        let yOffset = 0;
        let pageNum = 0;
        while (yOffset < contentH) {
          if (pageNum > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN - yOffset, printW, contentH);
          yOffset += pageContentH;
          pageNum++;
        }
      }

      const fileName = `Payslip_${slip.employee_name?.replace(/\s+/g, '_')}_${MONTH_NAMES[slip.month]}_${slip.year}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
      setDownloading(false);
    }
  };

  if (!slip) return null;

  const generatedDate = slip.generated_at
    ? new Date(slip.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const grossEarnings = Number(slip.base_salary) + Number(slip.overtime_pay || 0);
  const totalDeductions = Number(slip.lop_amount);
  const netPay = Number(slip.final_salary);
  const netInWords = amountToWords(netPay);

  return createPortal(
    <div className="pay-modal-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={e => e.stopPropagation()}>
        <div className="pay-modal-toolbar">
          <span className="pay-modal-toolbar-title">Salary Slip</span>
          <div className="pay-modal-toolbar-actions">
            <button
              className="pay-modal-btn pay-modal-btn--print"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? '⏳ Generating…' : '⬇ Download PDF'}
            </button>
            <button className="pay-modal-btn pay-modal-btn--close" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        <div className="pay-slip-scroll">
          <div className="pay-slip-paper" ref={printRef}>

            {/* HEADER */}
            <div className="ps-header">
              <div className="ps-brand">
                {logoSrc && <img src={logoSrc} alt="Logo" className="ps-logo" crossOrigin="anonymous" />}
                <div>
                  <div className="ps-company-name">MPeoples Business Solutions Pvt Ltd</div>
                  <div className="ps-company-addr">Salem, Tamil Nadu, India</div>
                </div>
              </div>
              <div className="ps-title-block">
                <div className="ps-slip-badge">Salary Slip</div>
                <div className="ps-period">{MONTH_NAMES[slip.month]} {slip.year}</div>
              </div>
            </div>

            {/* EMPLOYEE INFO BAND */}
            <div className="ps-info-band">
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Employee Name</div>
                <div className="ps-info-val">{slip.employee_name}</div>
              </div>
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Employee ID</div>
                <div className="ps-info-val">{slip.employee_id?.toUpperCase()}</div>
              </div>
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Pay Period</div>
                <div className="ps-info-val">{MONTH_NAMES[slip.month]} {slip.year}</div>
              </div>
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Designation</div>
                <div className="ps-info-val">{employee?.designation || slip.designation || '—'}</div>
              </div>
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Department</div>
                <div className="ps-info-val">{employee?.position || slip.position || '—'}</div>
              </div>
              <div className="ps-info-cell">
                <div className="ps-info-lbl">Generated On</div>
                <div className="ps-info-val">{generatedDate}</div>
              </div>
            </div>

            {/* ATTENDANCE */}
            <div className="ps-sec">Attendance Summary</div>
            <div className="ps-attendance-grid">
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Total Days</div>
                <div className="ps-att-val">{slip.total_days ?? 31}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Working Days</div>
                <div className="ps-att-val">{slip.working_days ?? (31 - (slip.sundays ?? 5) - (slip.holidays ?? 1))}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Sundays</div>
                <div className="ps-att-val">{slip.sundays ?? 5}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Holidays</div>
                <div className="ps-att-val">{slip.holidays ?? 1}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Days Present</div>
                <div className="ps-att-val green">{slip.present_days}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Paid Leave</div>
                <div className="ps-att-val">{slip.paid_leave_days ?? 0}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Half Day</div>
                <div className="ps-att-val">{slip.half_leave_days ?? 0}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Absent / LOP</div>
                <div className="ps-att-val red">{slip.lop_days ?? slip.total_lop_days ?? slip.absent_days ?? 0}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Paid Days</div>
                <div className="ps-att-val blue">{slip.worked_days ?? slip.paid_days}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Late (min)</div>
                <div className="ps-att-val">{slip.late_minutes ?? 0}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Permission (min)</div>
                <div className="ps-att-val">{slip.permission_minutes ?? 0}</div>
              </div>
              <div className="ps-att-cell">
                <div className="ps-att-lbl">Per Day Rate</div>
                <div className="ps-att-val">₹ {Number(slip.per_day_salary || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* EARNINGS & DEDUCTIONS */}
            <div className="ps-sec">Earnings &amp; Deductions</div>
            <div className="ps-ed-grid">
              <table className="ps-tbl">
                <thead>
                  <tr><th>Earnings</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Basic Salary</td><td style={{ textAlign: 'right' }}>₹ {Number(slip.base_salary).toLocaleString()}</td></tr>
                  {Number(slip.overtime_pay) > 0 && (
                    <tr><td>Overtime Pay</td><td style={{ textAlign: 'right' }}>₹ {Number(slip.overtime_pay).toLocaleString()}</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr><td>Gross Earnings</td><td style={{ textAlign: 'right' }}>₹ {grossEarnings.toLocaleString()}</td></tr>
                </tfoot>
              </table>

              <table className="ps-tbl">
                <thead>
                  <tr><th>Deductions</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Loss of Pay (LOP)</td>
                    <td className="td-red" style={{ textAlign: 'right' }}>₹ {Number(slip.lop_amount).toLocaleString()}</td>
                  </tr>
                  {Number(slip.late_penalty_amount) > 0 && (
                    <tr>
                      <td>Late Penalty</td>
                      <td className="td-red" style={{ textAlign: 'right' }}>₹ {Number(slip.late_penalty_amount).toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr><td>Total Deductions</td><td className="td-red" style={{ textAlign: 'right' }}>₹ {totalDeductions.toLocaleString()}</td></tr>
                </tfoot>
              </table>
            </div>

            {/* NET PAY */}
            <div className="ps-net-row">
              <div className="ps-net-left">
                <div className="ps-net-title">Net Pay</div>
                <div className="ps-net-month">{MONTH_NAMES[slip.month]} {slip.year}</div>
              </div>
              <div className="ps-net-right">
                <div className="ps-net-amount">₹ {netPay.toLocaleString()}</div>
              </div>
            </div>

            {/* AMOUNT IN WORDS */}
            <div className="ps-words-row">
              <span className="ps-words-label">Amount in Words:</span>
              <span className="ps-words-value">{netInWords}</span>
            </div>

            {/* FOOTER */}
            <div className="ps-slip-footer">
              <div className="ps-footer-note">
                <div>Payroll processed by MPeoples Business Solutions Pvt Ltd</div>
                <div className="ps-footer-conf">This is a system-generated document. No signature required.</div>
              </div>
              <div className="ps-signature-block">
                <div className="ps-sig-line"></div>
                <div className="ps-sig-lbl">Authorised Signatory</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD STATS CARDS
───────────────────────────────────────────── */
function DashboardStats({ data, period, meta }) {
  const totalFinal = data.reduce((s, e) => s + (e.final_salary || 0), 0);
  const avgSalary = data.length > 0 ? Math.round(totalFinal / data.length) : 0;
  const first = data[0] || {};
  const totalDays = meta?.total_days ?? first.total_days ?? '—';

  const stats = [
    {
      icon: <FiUsers />,
      label: 'Total Employees',
      value: data.length,
      color: 'pink',
      bg: 'pink-light'
    },
    {
      icon: <FiDollarSign />,
      label: 'Total Payroll',
      value: `₹${totalFinal.toLocaleString()}`,
      color: 'success',
      bg: 'success-light'
    },
    {
      icon: <FiTrendingUp />,
      label: 'Average Salary',
      value: `₹${avgSalary.toLocaleString()}`,
      color: 'blue',
      bg: 'blue-light'
    },
    {
      icon: <FiCalendar />,
      label: 'Working Days',
      value: totalDays,
      color: 'purple',
      bg: 'purple-light'
    },
  ];

  return (
    <div className="pay-dashboard-stats">
      {stats.map((stat, idx) => (
        <div key={idx} className={`pay-stat-card pay-stat-card--${stat.color}`}>
          <div className={`pay-stat-icon pay-stat-icon--${stat.bg}`}>
            {stat.icon}
          </div>
          <div className="pay-stat-content">
            <span className="pay-stat-value">{stat.value}</span>
            <span className="pay-stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MONTHLY PAYROLL TAB
───────────────────────────────────────────── */
function MonthlyPayroll({ employees }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [list, setList] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);
  const [slipLoading, setSlipLoading] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const handleViewReport = async () => {
    setViewing(true);
    setError(null);
    setList([]);
    setMode(null);
    try {
      const res = await fetch(
        `${BASE_URL}/salary-Slip-List?month=${Number(month)}&year=${Number(year)}`
      );
      const result = await res.json();
      if (result.success) {
        if (!result.data || result.data.length === 0) {
          setError(`No salary data found for ${MONTH_NAMES[Number(month)]} ${year}. Use "Generate Salary" to create it.`);
        } else {
          setList(result.data);
          setMode('viewed');
        }
      } else {
        setError(result.message || 'Failed to fetch salary report.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setViewing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setList([]);
    setMode(null);
    try {
      const res = await fetch(`${BASE_URL}/salary-generate-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: Number(month), year: Number(year) }),
      });
      const result = await res.json();
      if (result.success) {
        setList(result.data || []);
        setMode('generated');
      } else {
        setError(result.message || 'Failed to generate salary.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewSlip = async (emp) => {
    setSlipLoading(emp.user_id);
    try {
      const res = await fetch(`${BASE_URL}/salary-slips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: Number(month), year: Number(year), user_id: emp.user_id }),
      });
      const result = await res.json();
      if (result.success && result.data?.length > 0) {
        setActiveSlip(result.data[0]);
        setActiveEmployee(employees.find(e => e.id === emp.user_id) || null);
      } else {
        alert('No payslip found for this employee.');
      }
    } catch {
      alert('Error fetching payslip.');
    } finally {
      setSlipLoading(null);
    }
  };

  const monthOptions = [
    { v: '1', l: 'January' }, { v: '2', l: 'February' }, { v: '3', l: 'March' },
    { v: '4', l: 'April' }, { v: '5', l: 'May' }, { v: '6', l: 'June' },
    { v: '7', l: 'July' }, { v: '8', l: 'August' }, { v: '9', l: 'September' },
    { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' },
  ];
  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const isBusy = generating || viewing;

  return (
    <div className="pay-content">
      {/* Control Panel */}
      <div className="pay-control-panel">
        <div className="pay-control-left">
          <div className="pay-control-group">
            <label className="pay-control-label">Month</label>
            <select
              className="pay-control-select"
              value={month}
              onChange={e => { setMonth(e.target.value); setMode(null); setList([]); setError(null); }}
            >
              {monthOptions.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div className="pay-control-group">
            <label className="pay-control-label">Year</label>
            <select
              className="pay-control-select"
              value={year}
              onChange={e => { setYear(e.target.value); setMode(null); setList([]); setError(null); }}
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="pay-control-right">
          <button
            className="pay-btn pay-btn--outline"
            onClick={handleViewReport}
            disabled={isBusy}
          >
            <FiEye /> {viewing ? 'Loading…' : 'View Report'}
          </button>
          <button
            className="pay-btn pay-btn--primary"
            onClick={handleGenerate}
            disabled={isBusy}
          >
            <FiRefreshCw className={generating ? 'spin' : ''} />
            {generating ? 'Generating…' : 'Generate Salary'}
          </button>
        </div>
      </div>

      {/* Error / Empty States */}
      {error && (
        <div className="pay-message pay-message--error">
          <FiXCircle />
          <span>{error}</span>
        </div>
      )}

      {!mode && !error && (
        <div className="pay-empty-state">
          <div className="pay-empty-icon">
            <FiBarChart2 />
          </div>
          <h3>Ready to Process Payroll</h3>
          <p>Select a month and year, then click <strong>View Report</strong> to see existing payroll data, or <strong>Generate Salary</strong> to compute a new month.</p>
        </div>
      )}

      {/* Results */}
      {mode && list.length > 0 && (
        <>
          <DashboardStats data={list} period={`${MONTH_NAMES[Number(month)]} ${year}`} />

          {mode === 'generated' && (
            <div className="pay-message pay-message--success">
              <FiCheckCircle />
              <span>Salary generated successfully for <strong>{MONTH_NAMES[Number(month)]} {year}</strong>.</span>
            </div>
          )}

          {/* View Toggle */}
          <div className="pay-view-toggle">
            <span className="pay-view-label">View:</span>
            <button
              className={`pay-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FiList /> Table
            </button>
            <button
              className={`pay-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <FiGrid /> Cards
            </button>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="pay-table-wrapper">
              <table className="pay-table">
                <thead>
                  <tr>
                    <th className="pay-th pay-th--num">#</th>
                    <th className="pay-th">Employee</th>
                    <th className="pay-th">ID</th>
                    <th className="pay-th pay-th--r">Base Salary</th>
                    <th className="pay-th pay-th--c">Present</th>
                    <th className="pay-th pay-th--c">Absent</th>
                    <th className="pay-th pay-th--c">LOP Days</th>
                    <th className="pay-th pay-th--c">Paid Days</th>
                    <th className="pay-th pay-th--r">LOP Amt</th>
                    <th className="pay-th pay-th--final pay-th--r">Net Pay</th>
                    <th className="pay-th pay-th--action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((emp, idx) => (
                    <tr key={`${emp.user_id}-${idx}`}>
                      <td className="pay-td pay-td--num">{idx + 1}</td>
                      <td className="pay-td pay-td--bold">{emp.employee_name}</td>
                      <td className="pay-td pay-td--mono">{emp.employee_id?.toUpperCase()}</td>
                      <td className="pay-td pay-td--r">₹ {Number(emp.base_salary).toLocaleString()}</td>
                      <td className="pay-td pay-td--c pay-td--success">{emp.present_days}</td>
                      <td className="pay-td pay-td--c pay-td--danger">{emp.absent_days}</td>
                      <td className="pay-td pay-td--c pay-td--danger">{emp.total_lop_days ?? emp.lop_days}</td>
                      <td className="pay-td pay-td--c">{emp.paid_days ?? emp.worked_days}</td>
                      <td className="pay-td pay-td--r pay-td--amount-danger">₹ {Number(emp.lop_amount).toLocaleString()}</td>
                      <td className="pay-td pay-td--final pay-td--r">₹ {Number(emp.final_salary).toLocaleString()}</td>
                      <td className="pay-td pay-td--action">
                        <button
                          className="pay-action-btn"
                          onClick={() => handleViewSlip(emp)}
                          disabled={slipLoading !== null}
                        >
                          {slipLoading === emp.user_id ? <span className="pay-btn-spinner"></span> : <><FiEye /> View</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pay-td pay-tfoot-label" colSpan={9}>Total Payable</td>
                    <td className="pay-td pay-td--final pay-td--r">
                      ₹ {list.reduce((s, e) => s + (e.final_salary || 0), 0).toLocaleString()}
                    </td>
                    <td className="pay-td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="pay-cards-grid">
              {list.map((emp, idx) => (
                <div key={`${emp.user_id}-${idx}`} className="pay-employee-card">
                  <div className="pay-card-header">
                    <div className="pay-card-avatar">
                      {emp.employee_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="pay-card-name">
                      <span className="pay-card-employee">{emp.employee_name}</span>
                      <span className="pay-card-id">{emp.employee_id?.toUpperCase()}</span>
                    </div>
                    <button
                      className="pay-card-action"
                      onClick={() => handleViewSlip(emp)}
                      disabled={slipLoading !== null}
                    >
                      {slipLoading === emp.user_id ? <span className="pay-btn-spinner"></span> : <FiEye />}
                    </button>
                  </div>
                  <div className="pay-card-body">
                    <div className="pay-card-row">
                      <span className="pay-card-label">Base Salary</span>
                      <span className="pay-card-value">₹ {Number(emp.base_salary).toLocaleString()}</span>
                    </div>
                    <div className="pay-card-row">
                      <span className="pay-card-label">Present Days</span>
                      <span className="pay-card-value pay-card-value--success">{emp.present_days}</span>
                    </div>
                    <div className="pay-card-row">
                      <span className="pay-card-label">LOP Days</span>
                      <span className="pay-card-value pay-card-value--danger">{emp.total_lop_days ?? emp.lop_days}</span>
                    </div>
                    <div className="pay-card-row pay-card-row--total">
                      <span className="pay-card-label">Net Pay</span>
                      <span className="pay-card-value pay-card-value--highlight">₹ {Number(emp.final_salary).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeSlip && (
        <PayslipModal
          slip={activeSlip}
          employee={activeEmployee}
          onClose={() => { setActiveSlip(null); setActiveEmployee(null); }}
          logoSrc={logo}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DAILY PAYROLL TAB
───────────────────────────────────────────── */
function DailyPayroll() {
  const [date] = useState(todayStr);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchDaily = async (d) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/salary-generate-day-day?date=${d}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data || []);
        setMeta({
          month: result.month,
          year: result.year,
          total: result.total_employees,
          total_days: result.total_days,
          sundays: result.sundays,
          holidays: result.holidays,
        });
      } else {
        setError('Failed to fetch payroll data.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDaily(date); }, [date]);

  return (
    <div className="pay-content">
      <div className="pay-meta-bar">
        <div className="pay-meta-item">
          <FiCalendar />
          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {loading && (
        <div className="pay-loader">
          <div className="pay-loader-ring"></div>
          <p>Loading payroll data…</p>
        </div>
      )}
      
      {error && (
        <div className="pay-message pay-message--error">
          <FiXCircle />
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && data.length === 0 && (
        <div className="pay-empty-state">
          <div className="pay-empty-icon">
            <FiCalendar />
          </div>
          <h3>No Records Found</h3>
          <p>No payroll data available for the selected date.</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <DashboardStats data={data} meta={meta} />
          
          <div className="pay-table-wrapper">
            <table className="pay-table">
              <thead>
                <tr>
                  <th className="pay-th pay-th--num">#</th>
                  <th className="pay-th">Employee</th>
                  <th className="pay-th">ID</th>
                  <th className="pay-th pay-th--r">Base Salary</th>
                  <th className="pay-th pay-th--c">Present</th>
                  <th className="pay-th pay-th--c">Paid Days</th>
                  <th className="pay-th pay-th--r">Per Day</th>
                  <th className="pay-th pay-th--final pay-th--r">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {data.map((emp, idx) => (
                  <tr key={`${emp.user_id}-${idx}`}>
                    <td className="pay-td pay-td--num">{idx + 1}</td>
                    <td className="pay-td pay-td--bold">{emp.employee_name}</td>
                    <td className="pay-td pay-td--mono">{emp.employee_id?.toUpperCase()}</td>
                    <td className="pay-td pay-td--r">₹ {Number(emp.base_salary).toLocaleString()}</td>
                    <td className="pay-td pay-td--c pay-td--success">{emp.present_days}</td>
                    <td className="pay-td pay-td--c">{emp.paid_days}</td>
                    <td className="pay-td pay-td--r">₹ {Number(emp.per_day_salary).toLocaleString()}</td>
                    <td className="pay-td pay-td--final pay-td--r">₹ {Number(emp.final_salary).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pay-td pay-tfoot-label" colSpan={7}>Total Payable</td>
                  <td className="pay-td pay-td--final pay-td--r">
                    ₹ {data.reduce((s, e) => s + (e.final_salary || 0), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────── */
export default function Payroll() {
  const [activeTab, setActiveTab] = useState('daily');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/employee-List`)
      .then(r => r.json())
      .then(res => { if (res.success) setEmployees(res.data || []); })
      .catch(() => { });
  }, []);

  const tabs = [
    { id: 'daily', label: 'Daily Payroll', icon: <FiClock /> },
    { id: 'monthly', label: 'Monthly Payroll', icon: <FiCalendar /> },
  ];

  return (
    <div className="pay-page">
      {/* Header */}
      <div className="pay-header">
        <div className="pay-header-left">
          <div className="pay-header-icon">
            <Lottie animationData={animationData} style={{ width: "56px", height: "56px" }} />
          </div>
          <div>
            <div className="pay-header-badge">Financial Management</div>
            <h1 className="pay-header-title">Payroll Center</h1>
            <p className="pay-header-subtitle">Salary computation and disbursement records</p>
          </div>
        </div>
        <div className="pay-header-right">
          <div className="pay-header-stat">
            <span className="pay-header-stat-value">{employees.length}</span>
            <span className="pay-header-stat-label">Employees</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pay-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pay-tab ${activeTab === tab.id ? 'pay-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'daily' && <DailyPayroll />}
      {activeTab === 'monthly' && <MonthlyPayroll employees={employees} />}
    </div>
  );
}