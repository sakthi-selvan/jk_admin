import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../api/admin';

const pickupIcon = new L.DivIcon({
  html: '<div style="background:#22C55E;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});

const dropoffIcon = new L.DivIcon({
  html: '<div style="background:#EF4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});

const driverIcon = new L.DivIcon({
  html: '<div style="background:#8B5CF6;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:6px solid white;transform:rotate(0deg)"></div></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

function ActiveRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRides = async () => {
    try {
      const data = await adminAPI.getActiveRides();
      setRides(data);
      setError(null);
    } catch (err) {
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

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', color: '#D97706' },
      accepted: { bg: '#DBEAFE', color: '#2563EB' },
      started: { bg: '#D1FAE5', color: '#059669' },
    };
    const style = colors[status] || { bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span style={{ background: style.bg, color: style.color, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const mapCenter = rides.length > 0 && rides[0].pickup_lat
    ? [rides[0].pickup_lat, rides[0].pickup_lng]
    : [12.9716, 77.5946];

  if (loading) return <div className="page-loading">Loading active rides...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#F1F5F9', margin: 0, fontSize: '24px' }}>Active Rides</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94A3B8', fontSize: '14px' }}>
            {rides.length} active ride{rides.length !== 1 ? 's' : ''}
          </span>
          <button onClick={fetchRides} style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</div>}

      {rides.length === 0 ? (
        <div style={{ background: '#1E293B', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
          No active rides at the moment
        </div>
      ) : (
        <>
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', height: '400px' }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {rides.map((ride) => (
                <span key={ride.id}>
                  {ride.pickup_lat && (
                    <Marker position={[ride.pickup_lat, ride.pickup_lng]} icon={pickupIcon}>
                      <Popup>
                        <b>Pickup</b><br />{ride.pickup_location}
                      </Popup>
                    </Marker>
                  )}
                  {ride.dropoff_lat && (
                    <Marker position={[ride.dropoff_lat, ride.dropoff_lng]} icon={dropoffIcon}>
                      <Popup>
                        <b>Dropoff</b><br />{ride.dropoff_location}
                      </Popup>
                    </Marker>
                  )}
                  {ride.driver_lat && (
                    <Marker position={[ride.driver_lat, ride.driver_lng]} icon={driverIcon}>
                      <Popup>
                        <b>{ride.driver_name}</b><br />{ride.driver_phone}
                      </Popup>
                    </Marker>
                  )}
                  {ride.pickup_lat && ride.dropoff_lat && (
                    <Polyline
                      positions={[[ride.pickup_lat, ride.pickup_lng], [ride.dropoff_lat, ride.dropoff_lng]]}
                      color="#8B5CF6"
                      weight={2}
                      dashArray="5,10"
                      opacity={0.6}
                    />
                  )}
                </span>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {rides.map((ride) => (
              <div key={ride.id} style={{ background: '#1E293B', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>Route</div>
                  <div style={{ color: '#F1F5F9', fontSize: '14px' }}>{ride.pickup_location || 'Unknown'}</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>→ {ride.dropoff_location || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>Driver</div>
                  <div style={{ color: '#F1F5F9', fontSize: '14px' }}>{ride.driver_name || 'Unassigned'}</div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>{ride.driver_phone || ''}</div>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '4px' }}>Fare</div>
                  <div style={{ color: '#F1F5F9', fontSize: '14px' }}>₹{ride.fare || 0}</div>
                </div>
                <div>{getStatusBadge(ride.status)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ActiveRides;
