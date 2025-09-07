import React, { useState, useEffect } from 'react';
import { drillAPI } from '../services/api';
import { DrillPlan, DrillPlanForm } from '../types';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DrillPlans.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DrillPlans: React.FC = () => {
  const [plans, setPlans] = useState<DrillPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DrillPlanForm>({
    name: '',
    description: '',
    bench: '',
    burden: 3.5,
    spacing: 4.0,
    rows: 5,
    cols: 5,
    origin_x: 0,
    origin_y: 0,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await drillAPI.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load drill plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('rows') || name.includes('cols') || name.includes('burden') || name.includes('spacing') || name.includes('origin') 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await drillAPI.createPlan(formData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        bench: '',
        burden: 3.5,
        spacing: 4.0,
        rows: 5,
        cols: 5,
        origin_x: 0,
        origin_y: 0,
      });
      loadPlans();
    } catch (error) {
      console.error('Failed to create drill plan:', error);
      alert('Failed to create drill plan. Please try again.');
    }
  };

  if (loading) {
    return <div className="drill-loading">Loading drill plans...</div>;
  }

  return (
    <div className="drill-plans">
      <div className="drill-header">
        <h1>Drill Plan Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="create-button"
        >
          Create Drill Plan
        </button>
      </div>

      {showForm && (
        <div className="drill-form">
          <h3>Create New Drill Plan</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bench</label>
                <input
                  type="text"
                  name="bench"
                  value={formData.bench}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Burden (m) *</label>
                <input
                  type="number"
                  name="burden"
                  value={formData.burden}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Spacing (m) *</label>
                <input
                  type="number"
                  name="spacing"
                  value={formData.spacing}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rows *</label>
                <input
                  type="number"
                  name="rows"
                  value={formData.rows}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Columns *</label>
                <input
                  type="number"
                  name="cols"
                  value={formData.cols}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Origin X (m)</label>
                <input
                  type="number"
                  name="origin_x"
                  value={formData.origin_x}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Origin Y (m)</label>
                <input
                  type="number"
                  name="origin_y"
                  value={formData.origin_y}
                  onChange={handleChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Create Plan
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="plans-grid">
        {plans.length === 0 ? (
          <div className="empty-state">
            <h3>No drill plans found</h3>
            <p>Create your first drill plan to get started with automated hole positioning.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="create-button"
            >
              Create Drill Plan
            </button>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-meta">
                  {plan.bench && <span className="bench">Bench: {plan.bench}</span>}
                  <span className="holes">{plan.rows * plan.cols} holes</span>
                </div>
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              <div className="plan-stats">
                <div className="stat">
                  <span className="stat-label">Burden:</span>
                  <span className="stat-value">{plan.burden}m</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Spacing:</span>
                  <span className="stat-value">{plan.spacing}m</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Grid:</span>
                  <span className="stat-value">{plan.rows}×{plan.cols}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Origin:</span>
                  <span className="stat-value">({plan.origin_x}, {plan.origin_y})</span>
                </div>
              </div>

              {plan.grid_geojson && (
                <div className="plan-map">
                  <h4>Drill Pattern</h4>
                  <div className="map-container">
                    <MapContainer
                      center={[plan.origin_y, plan.origin_x]}
                      zoom={15}
                      style={{ height: '200px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <GeoJSON data={plan.grid_geojson} />
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DrillPlans;
