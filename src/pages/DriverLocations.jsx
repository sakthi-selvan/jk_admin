import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../api/admin';

const driverIcon = new L.DivIcon({
  html: '<div style="background:#8B5CF6;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
});

function DriverLocations() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = async () => {
    try {
      const data = await adminAPI.getOnlineDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
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

  const mapCenter = drivers.length > 0
    ? [drivers[0].lat, drivers[0].lng]
    : [12.9716, 77.5946];

  const getTimeSince = (isoString) => {
    if (!isoString) return 'Unknown';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) return <div className="page-loading">Loading driver locations...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#F1F5F9', margin: 0, fontSize: '24px' }}>Driver Locations</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94A3B8', fontSize: '14px' }}>
            {drivers.length} driver{drivers.length !== 1 ? 's' : ''} online
          </span>
          <button onClick={fetchDrivers} style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</div>}

      {drivers.length === 0 ? (
        <div style={{ background: '#1E293B', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
          No drivers currently online
        </div>
      ) : (
        <>
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', height: '500px' }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {drivers.map((driver) => (
                <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={driverIcon}>
                  <Popup>
                    <div style={{ minWidth: '150px' }}>
                      <b>{driver.name}</b><br />
                      <span style={{ color: '#666' }}>{driver.phone}</span><br />
                      {driver.vehicle_number && <span>{driver.vehicle_number} ({driver.vehicle_type})</span>}
                      <br />
                      <small style={{ color: '#888' }}>Updated: {getTimeSince(driver.location_updated_at)}</small>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {drivers.map((driver) => (
              <div key={driver.id} style={{ background: '#1E293B', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ color: '#F1F5F9', fontSize: '15px', fontWeight: 600 }}>{driver.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '13px', marginTop: '2px' }}>{driver.phone}</div>
                  </div>
                  <div style={{ background: '#065F46', color: '#6EE7B7', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                    ONLINE
                  </div>
                </div>
                {driver.vehicle_number && (
                  <div style={{ color: '#64748B', fontSize: '13px', marginTop: '8px' }}>
                    {driver.vehicle_number} &middot; {driver.vehicle_type || 'N/A'}
                  </div>
                )}
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '8px' }}>
                  Last updated: {getTimeSince(driver.location_updated_at)}
                </div>
                <div style={{ color: '#475569', fontSize: '11px', marginTop: '4px' }}>
                  {driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DriverLocations;
