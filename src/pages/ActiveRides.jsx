import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../api/admin';
import { formatDate, formatINR, PageHeader, StatusBadge } from '../components/ui';
import { getVehicleMapIcon } from '../utils/vehicleMapIcons';

const pickupIcon = new L.DivIcon({
  html: '<div style="background:#22C55E;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});

const dropoffIcon = new L.DivIcon({
  html: '<div style="background:#EF4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});

function FitBounds({ points, focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView(focus, 14, { animate: true });
      return;
    }
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.2));
  }, [map, points, focus]);
  return null;
}

function ActiveRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRides = async () => {
    try {
      const data = await adminAPI.getActiveRides();
      setRides(Array.isArray(data) ? data : []);
      setError(null);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load active rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 10000);
    return () => clearInterval(interval);
  }, []);

  const points = useMemo(() => {
    const pts = [];
    rides.forEach((r) => {
      if (r.pickup_lat) pts.push([r.pickup_lat, r.pickup_lng]);
      if (r.dropoff_lat) pts.push([r.dropoff_lat, r.dropoff_lng]);
      if (r.driver_lat) pts.push([r.driver_lat, r.driver_lng]);
    });
    return pts;
  }, [rides]);

  const selected = rides.find((r) => r.id === selectedId);
  const focus = selected?.driver_lat
    ? [selected.driver_lat, selected.driver_lng]
    : selected?.pickup_lat
      ? [selected.pickup_lat, selected.pickup_lng]
      : null;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading active rides…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Active Rides"
        subtitle={lastUpdated ? `Last refresh ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Live ops map'}
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number">{rides.length}</span>
              <span className="stat-text">Active</span>
            </div>
            <button type="button" className="ui-btn ui-btn-primary" onClick={fetchRides}>Refresh</button>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      {rides.length === 0 ? (
        <div className="ui-empty">No active rides right now</div>
      ) : (
        <div className="ops-layout">
          <div className="ops-map">
            <MapContainer center={points[0] || [12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={points} focus={focus} />
              {rides.map((ride) => (
                <span key={ride.id}>
                  {ride.pickup_lat && (
                    <Marker position={[ride.pickup_lat, ride.pickup_lng]} icon={pickupIcon}>
                      <Popup>Pickup<br />{ride.pickup_location}</Popup>
                    </Marker>
                  )}
                  {ride.dropoff_lat && (
                    <Marker position={[ride.dropoff_lat, ride.dropoff_lng]} icon={dropoffIcon}>
                      <Popup>Drop<br />{ride.dropoff_location}</Popup>
                    </Marker>
                  )}
                  {ride.driver_lat && (
                    <Marker
                      position={[ride.driver_lat, ride.driver_lng]}
                      icon={getVehicleMapIcon(ride.driver_vehicle_type || ride.vehicle_type)}
                    >
                      <Popup>
                        {ride.driver_name}
                        <br />
                        {ride.driver_phone}
                        {ride.driver_vehicle_type && (
                          <>
                            <br />
                            {ride.driver_vehicle_type}
                          </>
                        )}
                      </Popup>
                    </Marker>
                  )}
                  {ride.pickup_lat && ride.dropoff_lat && (
                    <Polyline
                      positions={[[ride.pickup_lat, ride.pickup_lng], [ride.dropoff_lat, ride.dropoff_lng]]}
                      color="#8B5CF6"
                      weight={2}
                      dashArray="5,10"
                      opacity={0.65}
                    />
                  )}
                </span>
              ))}
            </MapContainer>
          </div>

          <div className="ops-card-list">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className={`ops-card ${selectedId === ride.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(ride.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="ops-card-title">{ride.driver_name || 'Unassigned'}</div>
                  <StatusBadge status={ride.status} />
                </div>
                <div className="ops-card-sub">{ride.pickup_location || 'Pickup'}</div>
                <div className="ops-card-sub">→ {ride.dropoff_location || 'Drop'}</div>
                <div className="ops-card-sub" style={{ marginTop: 8 }}>
                  {formatINR(ride.fare)} · {ride.driver_phone || 'No phone'} · {formatDate(ride.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActiveRides;
