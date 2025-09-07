import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blastAPI } from '../services/api';
import { Blast } from '../types';
import './Blasts.css';

const Blasts: React.FC = () => {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    bench: '',
  });

  useEffect(() => {
    loadBlasts();
  }, []);

  const loadBlasts = async () => {
    try {
      const data = await blastAPI.getBlasts();
      setBlasts(data);
    } catch (error) {
      console.error('Failed to load blasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      await blastAPI.uploadCSV(
        uploadFile,
        uploadData.name,
        uploadData.description || undefined,
        uploadData.bench || undefined
      );
      setShowUpload(false);
      setUploadData({ name: '', description: '', bench: '' });
      setUploadFile(null);
      loadBlasts();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="blasts-loading">Loading blasts...</div>;
  }

  return (
    <div className="blasts">
      <div className="blasts-header">
        <h1>Blast Management</h1>
        <div className="blasts-actions">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="upload-button"
          >
            Upload CSV
          </button>
          <Link to="/blasts/new" className="create-button">
            Create New Blast
          </Link>
        </div>
      </div>

      {showUpload && (
        <div className="upload-form">
          <h3>Upload Blast Data (CSV)</h3>
          <form onSubmit={handleUpload}>
            <div className="form-row">
              <div className="form-group">
                <label>Blast Name *</label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bench</label>
                <input
                  type="text"
                  value={uploadData.bench}
                  onChange={(e) => setUploadData({...uploadData, bench: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>CSV File *</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
              <small>Expected columns: hole_id, burden, spacing, diameter_mm, hole_depth_m, stemming_m, explosive_density_kg_m3, explosive_column_m</small>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Upload
              </button>
              <button 
                type="button" 
                onClick={() => setShowUpload(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="blasts-list">
        {blasts.length === 0 ? (
          <div className="empty-state">
            <h3>No blasts found</h3>
            <p>Create your first blast or upload CSV data to get started.</p>
            <div className="empty-actions">
              <button 
                onClick={() => setShowUpload(true)}
                className="upload-button"
              >
                Upload CSV
              </button>
              <Link to="/blasts/new" className="create-button">
                Create New Blast
              </Link>
            </div>
          </div>
        ) : (
          blasts.map(blast => (
            <div key={blast.id} className="blast-card">
              <div className="blast-header">
                <h3>{blast.name}</h3>
                <div className="blast-meta">
                  {blast.bench && <span className="bench">Bench: {blast.bench}</span>}
                  <span className="holes">{blast.holes.length} holes</span>
                </div>
              </div>
              
              {blast.description && (
                <p className="blast-description">{blast.description}</p>
              )}
              
              <div className="blast-stats">
                <div className="stat">
                  <span className="stat-label">Holes:</span>
                  <span className="stat-value">{blast.holes.length}</span>
                </div>
                {blast.holes.length > 0 && (
                  <>
                    <div className="stat">
                      <span className="stat-label">Avg Burden:</span>
                      <span className="stat-value">
                        {blast.holes
                          .filter(h => h.burden)
                          .reduce((sum, h) => sum + (h.burden || 0), 0) / 
                          blast.holes.filter(h => h.burden).length || 0
                        }m
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Avg Spacing:</span>
                      <span className="stat-value">
                        {blast.holes
                          .filter(h => h.spacing)
                          .reduce((sum, h) => sum + (h.spacing || 0), 0) / 
                          blast.holes.filter(h => h.spacing).length || 0
                        }m
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="blast-actions">
                <Link to={`/blasts/${blast.id}`} className="view-button">
                  View Details
                </Link>
                <Link to={`/analysis/${blast.id}`} className="analyze-button">
                  Analyze
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blasts;
