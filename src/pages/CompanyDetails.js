import React, { useState, useEffect } from 'react';
import '../styles/CompanyDetails.css';
import Lottie from "lottie-react";
import animationData from '../LottieFiles/Company.json';
import { IoAdd, IoBusiness, IoLocation, IoMap, IoPencil, IoClose, IoChevronForward } from 'react-icons/io5';
import { createPortal } from 'react-dom';
import { FaBuilding, FaMapMarkerAlt, FaRulerCombined } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CompanyDetails = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
  });

  const [formData1, setFormData1] = useState({
    company_id: '',
    branch_name: '',
    branch_lon: '',
    branch_lat: '',
    branch_address: '',
    branch_id: '',
    meter: ''
  });

  const [activeCompanyForm, setActiveCompanyForm] = useState(false);
  const [activeBranchForm, setActiveBranchForm] = useState(false);
  const [branchList, setBranchList] = useState(false);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  const [branch, setBranch] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  /* ================= EDIT BRANCH ================= */
  const handleEdit = (branch) => {
    setFormData1({
      company_id: branch.company_id,
      branch_name: branch.branch_name,
      branch_lat: branch.branch_lat,
      branch_lon: branch.branch_lon,
      branch_address: branch.branch_address,
      branch_id: branch.id,
      meter: branch.meter || ''
    });
    setIsEdit(true);
    setActiveBranchForm(true);
  };

  /* ================= FETCH COMPANIES ================= */
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await fetch(`${BASE_URL}/list-company`);
        const result = await response.json();
        if (result.success) {
          setCompanies(result.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
      setLoadingCompanies(false);
    };
    fetchCompanies();
  }, [setActiveCompanyForm]);

  /* ================= FETCH BRANCH BY COMPANY ID ================= */
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await fetch(`${BASE_URL}/list-Branch-id/${companyId}`);
        const result = await response.json();
        if (result.success) {
          setBranch(result.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchBranch();
  }, [companyId, formData1]);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= COMPANY FORM SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/add-company`, {
        method: 'POST',
        body: submitData,
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Company Created successfully!');
        setFormData({ company_name: '', company_address: '' });
      } else {
        alert('Failed to create Company: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveCompanyForm(false);
    }
  };

  /* ================= BRANCH FORM SUBMIT ================= */
  const branchUpdate = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData1).forEach((key) => {
      if (formData1[key] !== null) {
        submitData.append(key, formData1[key]);
      }
    });

    try {
      if (isEdit) {
        const response = await fetch(`${BASE_URL}/update-branch`, {
          method: 'POST',
          body: submitData,
        });
        const result = await response.json();
        if (response.ok) {
          alert(result.message || 'Branch Updated successfully!');
          setFormData1({
            company_id: '',
            branch_name: '',
            branch_lon: '',
            branch_lat: '',
            branch_address: '',
            branch_id: '',
            meter: ''
          });
        } else {
          alert('Failed to update Branch: ' + (result.message || 'Unknown error'));
        }
      } else {
        const response = await fetch(`${BASE_URL}/add-branch`, {
          method: 'POST',
          body: submitData,
        });
        const result = await response.json();
        if (response.ok) {
          alert(result.message || 'Branch Created successfully!');
          setFormData1({
            company_id: '',
            branch_name: '',
            branch_lon: '',
            branch_lat: '',
            branch_address: '',
            branch_id: '',
            meter: ''
          });
        } else {
          alert('Failed to create Branch: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setActiveBranchForm(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="company-loading">
        <div className="loader-spinner"></div>
        <p>Loading Company records...</p>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <Lottie animationData={animationData} style={{ width: "60px", height: "60px" }} />
          </div>
          <div className="header-text">
            <h1>Company Management</h1>
            <p>Create and maintain company profiles to streamline operations and support organizational growth</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setActiveCompanyForm(true)}>
            <IoAdd /> Add Company
          </button>
          <button className="btn-secondary" onClick={() => setActiveBranchForm(true)}>
            <IoLocation /> Add Branch
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff' }}>
            <FaBuilding style={{ color: '#4f46e5' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Companies</span>
            <span className="stat-value">{companies.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>
            <IoLocation style={{ color: '#db2777' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Branches</span>
            <span className="stat-value">{branch.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <FaMapMarkerAlt style={{ color: '#059669' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Locations</span>
            <span className="stat-value">{companies.length * 2}</span>
          </div>
        </div>
      </div>

      {/* COMPANY LIST */}
      <div className="section-container">
        <div className="section-header">
          <h2>Companies</h2>
          <span className="section-badge">{companies.length} Total</span>
        </div>
        <div className="company-grid">
          {companies.map((data) => (
            <div className="company-card" key={data.id}>
              <div className="company-card-header">
                <div className="company-avatar">
                  <IoBusiness />
                </div>
                <button 
                  className="view-branches-btn"
                  onClick={() => {
                    setBranchList(true);
                    setCompanyId(data.id);
                    setSelectedCompany(data);
                  }}
                >
                  View Branches <IoChevronForward />
                </button>
              </div>
              <h3 className="company-name">{data.name}</h3>
              <div className="company-address">
                <FaMapMarkerAlt />
                <span>{data.company_address || 'No address provided'}</span>
              </div>
              <div className="company-stats">
                <span className="company-stat">📌 {branch.filter(b => b.company_id === data.id).length} Branches</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= COMPANY FORM MODAL ================= */}
      {activeCompanyForm && createPortal(
        <div className="modal-overlay" onClick={() => setActiveCompanyForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveCompanyForm(false)}>
              <IoClose />
            </button>
            <h2 className="modal-title">Add New Company</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Company Address</label>
                <textarea
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter company address"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Create Company</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= BRANCH FORM MODAL ================= */}
      {activeBranchForm && createPortal(
        <div className="modal-overlay" onClick={() => {
          setActiveBranchForm(false);
          setIsEdit(false);
          setFormData1({
            company_id: '',
            branch_name: '',
            branch_lon: '',
            branch_lat: '',
            branch_address: '',
            branch_id: '',
            meter: ''
          });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setActiveBranchForm(false);
              setIsEdit(false);
              setFormData1({
                company_id: '',
                branch_name: '',
                branch_lon: '',
                branch_lat: '',
                branch_address: '',
                branch_id: '',
                meter: ''
              });
            }}>
              <IoClose />
            </button>
            <h2 className="modal-title">{isEdit ? 'Update Branch' : 'Add New Branch'}</h2>
            <form onSubmit={branchUpdate} className="modal-form">
              <div className="form-group">
                <label>Company</label>
                <select
                  name="company_id"
                  value={formData1.company_id}
                  onChange={handleChange1}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  name="branch_name"
                  value={formData1.branch_name}
                  onChange={handleChange1}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="text"
                  name="branch_lat"
                  value={formData1.branch_lat}
                  onChange={handleChange1}
                  placeholder="e.g., 40.7128"
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="text"
                  name="branch_lon"
                  value={formData1.branch_lon}
                  onChange={handleChange1}
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Branch Address</label>
                <textarea
                  name="branch_address"
                  value={formData1.branch_address}
                  onChange={handleChange1}
                  rows="3"
                  placeholder="Enter branch address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Allowed Radius (Meters)</label>
                <select name="meter" value={formData1.meter} onChange={handleChange1} required>
                  <option value="">Select Radius</option>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((meter) => (
                    <option key={meter} value={meter}>{meter} meters</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="submit-btn">
                {isEdit ? 'Update Branch' : 'Create Branch'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= BRANCH LIST MODAL ================= */}
      {branchList && selectedCompany && createPortal(
        <div className="modal-overlay" onClick={() => setBranchList(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBranchList(false)}>
              <IoClose />
            </button>
            <div className="branch-modal-header">
              <div className="branch-header-left">
                <div className="branch-company-avatar">
                  <IoBusiness />
                </div>
                <div>
                  <h2 className="modal-title">{selectedCompany.name}</h2>
                  <p className="branch-subtitle">{branch.length} Branches</p>
                </div>
              </div>
              <button 
                className="btn-primary small"
                onClick={() => {
                  setActiveBranchForm(true);
                  setBranchList(false);
                }}
              >
                <IoAdd /> Add Branch
              </button>
            </div>
            <div className="branch-grid">
              {branch.map((data) => (
                <div className="branch-card" key={data.id}>
                  <div className="branch-card-header">
                    <h3>{data.branch_name}</h3>
                    <button className="edit-branch-btn" onClick={() => handleEdit(data)}>
                      <IoPencil />
                    </button>
                  </div>
                  <div className="branch-location">
                    <div className="location-item">
                      <span className="location-label">Lat:</span>
                      <span>{data.branch_lat}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Lon:</span>
                      <span>{data.branch_lon}</span>
                    </div>
                  </div>
                  <div className="branch-radius">
                    <FaRulerCombined />
                    <span>{data.meter} meters radius</span>
                  </div>
                  <div className="branch-address">
                    <FaMapMarkerAlt />
                    <span>{data.branch_address}</span>
                  </div>
                </div>
              ))}
              {branch.length === 0 && (
                <div className="empty-state">
                  <p>No branches found for this company</p>
                  <button 
                    className="btn-primary small"
                    onClick={() => {
                      setActiveBranchForm(true);
                      setBranchList(false);
                    }}
                  >
                    <IoAdd /> Add First Branch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CompanyDetails;