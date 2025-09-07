import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { blastAPI, analysisAPI } from '../services/api';
import { Blast, BlastSummary, PowderFactorResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import './Analysis.css';

const Analysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blast, setBlast] = useState<Blast | null>(null);
  const [summary, setSummary] = useState<BlastSummary | null>(null);
  const [powderFactor, setPowderFactor] = useState<PowderFactorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisParams, setAnalysisParams] = useState({
    rockDensity: 2.7,
    benchHeight: 10.0,
  });

  useEffect(() => {
    if (id) {
      loadAnalysisData(parseInt(id));
    }
  }, [id]);

  const loadAnalysisData = async (blastId: number) => {
    try {
      const [blastData, summaryData, powderFactorData] = await Promise.all([
        blastAPI.getBlast(blastId),
        analysisAPI.getSummary(blastId),
        analysisAPI.getPowderFactor(blastId, analysisParams.rockDensity, analysisParams.benchHeight),
      ]);
      
      setBlast(blastData);
      setSummary(summaryData);
      setPowderFactor(powderFactorData);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (param: string, value: number) => {
    const newParams = { ...analysisParams, [param]: value };
    setAnalysisParams(newParams);
    if (id) {
      analysisAPI.getPowderFactor(parseInt(id), newParams.rockDensity, newParams.benchHeight)
        .then(setPowderFactor)
        .catch(console.error);
    }
  };

  if (loading) {
    return <div className="analysis-loading">Loading analysis...</div>;
  }

  if (!blast) {
    return <div className="analysis-error">Blast not found</div>;
  }

  // Prepare chart data
  const burdenData = blast.holes
    .filter(h => h.burden)
    .map((h, index) => ({
      hole: h.hole_id,
      burden: h.burden,
      index: index + 1,
    }));

  const spacingData = blast.holes
    .filter(h => h.spacing)
    .map((h, index) => ({
      hole: h.hole_id,
      spacing: h.spacing,
      index: index + 1,
    }));

  const depthData = blast.holes
    .filter(h => h.hole_depth_m)
    .map((h, index) => ({
      hole: h.hole_id,
      depth: h.hole_depth_m,
      index: index + 1,
    }));

  const explosiveData = blast.holes
    .filter(h => h.explosive_column_m)
    .map((h, index) => ({
      hole: h.hole_id,
      explosive: h.explosive_column_m,
      index: index + 1,
    }));

  const COLORS = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'];

  return (
    <div className="analysis">
      <div className="analysis-header">
        <h1>Blast Analysis: {blast.name}</h1>
        <div className="blast-meta">
          {blast.bench && <span className="bench">Bench: {blast.bench}</span>}
          <span className="holes">{blast.holes.length} holes</span>
        </div>
      </div>

      {blast.description && (
        <div className="blast-description">
          <p>{blast.description}</p>
        </div>
      )}

      <div className="analysis-controls">
        <h3>Analysis Parameters</h3>
        <div className="param-controls">
          <div className="param-group">
            <label>Rock Density (t/m³)</label>
            <input
              type="number"
              value={analysisParams.rockDensity}
              onChange={(e) => handleParamChange('rockDensity', parseFloat(e.target.value))}
              step="0.1"
              min="0"
            />
          </div>
          <div className="param-group">
            <label>Bench Height (m)</label>
            <input
              type="number"
              value={analysisParams.benchHeight}
              onChange={(e) => handleParamChange('benchHeight', parseFloat(e.target.value))}
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="analysis-summary">
        <h3>Summary Statistics</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Burden</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Min:</span>
                <span className="stat-value">{summary?.burden.min.toFixed(2)}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Max:</span>
                <span className="stat-value">{summary?.burden.max.toFixed(2)}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Avg:</span>
                <span className="stat-value">{summary?.burden.avg.toFixed(2)}m</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Spacing</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Min:</span>
                <span className="stat-value">{summary?.spacing.min.toFixed(2)}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Max:</span>
                <span className="stat-value">{summary?.spacing.max.toFixed(2)}m</span>
              </div>
              <div className="stat">
                <span className="stat-label">Avg:</span>
                <span className="stat-value">{summary?.spacing.avg.toFixed(2)}m</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Powder Factor</h4>
            <div className="powder-factor">
              <div className="pf-value">
                {powderFactor?.avg_powder_factor.toFixed(3)} kg/m³
              </div>
              <div className="pf-description">
                Average explosive per rock volume
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analysis-charts">
        <div className="chart-section">
          <h3>Burden Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={burdenData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hole" />
                <YAxis label={{ value: 'Burden (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="burden" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <h3>Spacing Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spacingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hole" />
                <YAxis label={{ value: 'Spacing (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="spacing" fill="#27ae60" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <h3>Hole Depth Analysis</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={depthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hole" />
                <YAxis label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="depth" stroke="#e74c3c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <h3>Explosive Column Length</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={explosiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hole" />
                <YAxis label={{ value: 'Length (m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="explosive" fill="#f39c12" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="analysis-insights">
        <h3>Analysis Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Fragmentation Control</h4>
            <p>
              {summary && summary.burden.avg > 0 && summary.spacing.avg > 0
                ? `Burden to spacing ratio: ${(summary.burden.avg / summary.spacing.avg).toFixed(2)}. 
                   ${summary.burden.avg / summary.spacing.avg > 0.8 && summary.burden.avg / summary.spacing.avg < 1.2
                     ? 'Optimal ratio for good fragmentation.'
                     : 'Consider adjusting burden or spacing for better fragmentation.'}`
                : 'Insufficient data for fragmentation analysis.'}
            </p>
          </div>

          <div className="insight-card">
            <h4>Powder Factor Optimization</h4>
            <p>
              {powderFactor && powderFactor.avg_powder_factor > 0
                ? `Current powder factor: ${powderFactor.avg_powder_factor.toFixed(3)} kg/m³. 
                   ${powderFactor.avg_powder_factor > 0.3 && powderFactor.avg_powder_factor < 0.8
                     ? 'Within optimal range for most rock types.'
                     : 'Consider optimizing explosive distribution.'}`
                : 'Insufficient data for powder factor analysis.'}
            </p>
          </div>

          <div className="insight-card">
            <h4>Hole Pattern Consistency</h4>
            <p>
              {summary && summary.burden.avg > 0 && summary.spacing.avg > 0
                ? `Burden variation: ${((summary.burden.max - summary.burden.min) / summary.burden.avg * 100).toFixed(1)}%. 
                   Spacing variation: ${((summary.spacing.max - summary.spacing.min) / summary.spacing.avg * 100).toFixed(1)}%. 
                   ${((summary.burden.max - summary.burden.min) / summary.burden.avg * 100) < 20
                     ? 'Good pattern consistency.'
                     : 'Consider improving drilling accuracy.'}`
                : 'Insufficient data for pattern analysis.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
