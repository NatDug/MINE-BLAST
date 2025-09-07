import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blastAPI, analysisAPI } from '../services/api';
import { Blast, BlastSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<{ [key: number]: BlastSummary }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const blastsData = await blastAPI.getBlasts();
      setBlasts(blastsData);

      // Load summaries for each blast
      const summaryPromises = blastsData.map(async (blast) => {
        try {
          const summary = await analysisAPI.getSummary(blast.id);
          return { blastId: blast.id, summary };
        } catch (error) {
          console.error(`Failed to load summary for blast ${blast.id}:`, error);
          return { blastId: blast.id, summary: null };
        }
      });

      const summaryResults = await Promise.all(summaryPromises);
      const summaryMap: { [key: number]: BlastSummary } = {};
      summaryResults.forEach(({ blastId, summary }) => {
        if (summary) {
          summaryMap[blastId] = summary;
        }
      });
      setSummaries(summaryMap);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  // Prepare chart data
  const burdenData = blasts.map(blast => ({
    name: blast.name,
    avg: summaries[blast.id]?.burden.avg || 0,
    min: summaries[blast.id]?.burden.min || 0,
    max: summaries[blast.id]?.burden.max || 0,
  }));

  const spacingData = blasts.map(blast => ({
    name: blast.name,
    avg: summaries[blast.id]?.spacing.avg || 0,
    min: summaries[blast.id]?.spacing.min || 0,
    max: summaries[blast.id]?.spacing.max || 0,
  }));

  const totalHoles = blasts.reduce((sum, blast) => sum + blast.holes.length, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mine Blast Analytics Dashboard</h1>
        <p>Comprehensive drill and blast optimization platform</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Blasts</h3>
          <div className="stat-value">{blasts.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Holes</h3>
          <div className="stat-value">{totalHoles}</div>
        </div>
        <div className="stat-card">
          <h3>Active Benches</h3>
          <div className="stat-value">
            {new Set(blasts.map(b => b.bench).filter(Boolean)).size}
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Burden Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={burdenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#3498db" name="Average" />
              <Bar dataKey="min" fill="#95a5a6" name="Minimum" />
              <Bar dataKey="max" fill="#e74c3c" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Spacing Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spacingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#27ae60" name="Average" />
              <Bar dataKey="min" fill="#95a5a6" name="Minimum" />
              <Bar dataKey="max" fill="#e74c3c" name="Maximum" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/blasts" className="action-button">
          View All Blasts
        </Link>
        <Link to="/drill" className="action-button">
          Create Drill Plan
        </Link>
        <Link to="/maps" className="action-button">
          View Maps
        </Link>
      </div>

      <div className="recent-blasts">
        <h3>Recent Blasts</h3>
        {blasts.length === 0 ? (
          <p>No blasts found. <Link to="/blasts">Create your first blast</Link></p>
        ) : (
          <div className="blast-list">
            {blasts.slice(0, 5).map(blast => (
              <div key={blast.id} className="blast-item">
                <div className="blast-info">
                  <h4>{blast.name}</h4>
                  <p>{blast.bench && `Bench: ${blast.bench}`}</p>
                  <p>{blast.holes.length} holes</p>
                </div>
                <div className="blast-actions">
                  <Link to={`/blasts/${blast.id}`} className="view-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
