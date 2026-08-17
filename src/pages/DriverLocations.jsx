import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../api/admin';
import { PageHeader } from '../components/ui';
import { FLEET_LEGEND, getVehicleMapIcon, getVehicleMarkerHtml } from '../utils/vehicleMapIcons';

function FitBounds({ points, focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView(focus, 15, { animate: true });
      return;
    }
    if (!points.length) return;
    map.fitBounds(L.latLngBounds(points).pad(0.25));
  }, [map, points, focus]);
  return null;
}

function DriverLocations() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const fetchDrivers = async () => {
    try {
      const data = await adminAPI.getOnlineDrivers();
      setDrivers(Array.isArray(data) ? data : []);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load driver locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  const vehicleTypes = useMemo(() => {
    const set = new Set(drivers.map((d) => d.vehicle_type).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [drivers]);

  const filtered = useMemo(() => {
    if (vehicleFilter === 'all') return drivers;
    return drivers.filter((d) => d.vehicle_type === vehicleFilter);
  }, [drivers, vehicleFilter]);

  const points = useMemo(
    () => filtered.filter((d) => d.lat && d.lng).map((d) => [d.lat, d.lng]),
    [filtered]
  );

  const selected = filtered.find((d) => d.id === selectedId);
  const focus = selected?.lat ? [selected.lat, selected.lng] : null;

  const getTimeSince = (isoString) => {
    if (!isoString) return 'Unknown';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading driver locations…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Driver Map"
        subtitle={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Online captains'}
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number">{filtered.length}</span>
              <span className="stat-text">Online</span>
            </div>
            <button type="button" className="ui-btn ui-btn-primary" onClick={fetchDrivers}>Refresh</button>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      <div className="ui-toolbar">
        <div className="ui-tabs">
          {vehicleTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`ui-tab ${vehicleFilter === type ? 'active' : ''}`}
              onClick={() => setVehicleFilter(type)}
            >
              {type === 'all' ? 'All vehicles' : type}
            </button>
          ))}
        </div>
        <div className="map-legend">
          {FLEET_LEGEND.map(({ category, label }) => (
            <span key={category} className="map-legend-item" title={label}>
              <span
                className="map-legend-icon"
                dangerouslySetInnerHTML={{
                  __html: getVehicleMarkerHtml(category, 22),
                }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ui-empty">No drivers currently online</div>
      ) : (
        <div className="ops-layout">
          <div className="ops-map" style={{ height: 500 }}>
            <MapContainer center={points[0] || [12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={points} focus={focus} />
              {filtered.map((driver) => (
                <Marker
                  key={driver.id}
                  position={[driver.lat, driver.lng]}
                  icon={getVehicleMapIcon(driver.vehicle_type)}
                >
                  <Popup>
                    <b>{driver.name}</b><br />
                    {driver.phone}<br />
                    {driver.vehicle_number} ({driver.vehicle_type || 'N/A'})
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="ops-card-list" style={{ maxHeight: 500 }}>
            {filtered.map((driver) => (
              <div
                key={driver.id}
                className={`ops-card ${selectedId === driver.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(driver.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="ops-card-title">{driver.name}</div>
                  <span className="ui-badge online">online</span>
                </div>
                <div className="ops-card-sub">{driver.phone}</div>
                <div className="ops-card-sub">
                  {driver.vehicle_number || '—'} · {driver.vehicle_type || 'N/A'}
                </div>
                <div className="ops-card-sub">Updated {getTimeSince(driver.location_updated_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverLocations;
