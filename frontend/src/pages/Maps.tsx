import React, { useState, useEffect } from 'react';
import { mapsAPI } from '../services/api';
import { MapLayer } from '../types';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Maps.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Maps: React.FC = () => {
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    layer_type: 'feature',
    geojson: '',
  });

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    try {
      const data = await mapsAPI.getLayers();
      setLayers(data);
    } catch (error) {
      console.error('Failed to load map layers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const geojsonData = JSON.parse(formData.geojson);
      await mapsAPI.createLayer({
        name: formData.name,
        layer_type: formData.layer_type,
        geojson: geojsonData,
      });
      setShowForm(false);
      setFormData({ name: '', layer_type: 'feature', geojson: '' });
      loadLayers();
    } catch (error) {
      console.error('Failed to create map layer:', error);
      alert('Failed to create map layer. Please check your GeoJSON format.');
    }
  };

  const getLayerStyle = (layerType: string) => {
    switch (layerType) {
      case 'bench':
        return { color: '#e74c3c', weight: 2, fillOpacity: 0.3 };
      case 'road':
        return { color: '#95a5a6', weight: 3 };
      case 'boundary':
        return { color: '#2c3e50', weight: 2, dashArray: '5, 5' };
      case 'feature':
      default:
        return { color: '#3498db', weight: 2, fillOpacity: 0.3 };
    }
  };

  if (loading) {
    return <div className="maps-loading">Loading map layers...</div>;
  }

  return (
    <div className="maps">
      <div className="maps-header">
        <h1>Mine Maps</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="create-button"
        >
          Add Layer
        </button>
      </div>

      {showForm && (
        <div className="layer-form">
          <h3>Add New Map Layer</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Layer Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Layer Type</label>
                <select
                  name="layer_type"
                  value={formData.layer_type}
                  onChange={handleChange}
                >
                  <option value="feature">Feature</option>
                  <option value="bench">Bench</option>
                  <option value="road">Road</option>
                  <option value="boundary">Boundary</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>GeoJSON Data *</label>
              <textarea
                name="geojson"
                value={formData.geojson}
                onChange={handleChange}
                rows={10}
                placeholder='{"type": "FeatureCollection", "features": [...]}'
                required
              />
              <small>
                Enter valid GeoJSON data. You can use online tools like geojson.io to create GeoJSON.
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Add Layer
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

      <div className="map-container">
        <div className="map-sidebar">
          <h3>Map Layers</h3>
          {layers.length === 0 ? (
            <p className="no-layers">No layers available. Add a layer to get started.</p>
          ) : (
            <div className="layers-list">
              {layers.map(layer => (
                <div key={layer.id} className="layer-item">
                  <div className="layer-info">
                    <h4>{layer.name}</h4>
                    <span className="layer-type">{layer.layer_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-view">
          <MapContainer
            center={[-25.2744, 133.7751]} // Center of Australia (adjust as needed)
            zoom={6}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <LayersControl position="topright">
              {layers.map(layer => (
                <LayersControl.Overlay
                  key={layer.id}
                  name={layer.name}
                  checked={true}
                >
                  <GeoJSON
                    data={layer.geojson}
                    style={getLayerStyle(layer.layer_type)}
                    onEachFeature={(feature, leafletLayer) => {
                      if (feature.properties) {
                        leafletLayer.bindPopup(`
                          <div>
                            <strong>${layer.name}</strong><br/>
                            ${Object.entries(feature.properties)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join('<br/>')}
                          </div>
                        `);
                      }
                    }}
                  />
                </LayersControl.Overlay>
              ))}
            </LayersControl>
          </MapContainer>
        </div>
      </div>

      <div className="map-info">
        <h3>Map Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Bench Management</h4>
            <p>Visualize bench levels, boundaries, and excavation areas for better planning and safety.</p>
          </div>
          <div className="feature-card">
            <h4>Road Networks</h4>
            <p>Track haul roads, access routes, and infrastructure for efficient mine operations.</p>
          </div>
          <div className="feature-card">
            <h4>Boundary Control</h4>
            <p>Define mine boundaries, lease areas, and environmental protection zones.</p>
          </div>
          <div className="feature-card">
            <h4>Feature Mapping</h4>
            <p>Map geological features, equipment locations, and operational areas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;
