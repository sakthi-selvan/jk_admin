import L from 'leaflet';

/** Match customer app VehicleMarker categories and colors. */
const STYLES = {
  bike: { bg: '#F97316', shape: 'pill', svg: bikeSvg() },
  auto: { bg: '#EAB308', shape: 'rounded', svg: autoSvg() },
  mini: { bg: '#22C55E', shape: 'circle', svg: carSvg() },
  sedan: { bg: '#3B82F6', shape: 'circle', svg: carSvg(true) },
  suv: { bg: '#F59E0B', shape: 'circle', svg: suvSvg() },
  premium: { bg: '#8B5CF6', shape: 'circle', svg: diamondSvg() },
  other: { bg: '#64748B', shape: 'circle', svg: carSvg() },
};

export function normalizeFleetCategory(vehicleType) {
  const t = (vehicleType || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (!t) return 'other';
  if (/(bike|motor|scooter|2wheel|two_wheel)/.test(t)) return 'bike';
  if (/(auto|rickshaw|3wheel|three_wheel)/.test(t)) return 'auto';
  if (/(premium|luxury|crysta|byd)/.test(t)) return 'premium';
  if (/(suv|muv|xl|innova|ertiga)/.test(t)) return 'suv';
  if (/(sedan|dzire|etios)/.test(t)) return 'sedan';
  if (/(mini|hatch|wagon|alto|compact)/.test(t)) return 'mini';
  if (t.includes('car')) return 'mini';
  return 'other';
}

function bikeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5l-2 5h4l3 6.5"/><path d="M12 6V4"/></svg>`;
}

function autoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16l-1.2-4.2a2 2 0 0 0-1.9-1.3H7.1a2 2 0 0 0-1.9 1.3L4 14z"/><path d="M6 14v3"/><path d="M18 14v3"/><circle cx="7" cy="17" r="1.5" fill="#fff" stroke="none"/><circle cx="17" cy="17" r="1.5" fill="#fff" stroke="none"/><path d="M9 10V8h6v2"/></svg>`;
}

function carSvg(sport = false) {
  if (sport) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14l-1-4.5a2 2 0 0 0-1.9-1.5H7.9A2 2 0 0 0 6 10.5L5 15z"/><circle cx="7.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/><circle cx="16.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/><path d="M8 10l1.5-3h5L16 10"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14l-1.2-4a2 2 0 0 0-1.9-1.5H7.1A2 2 0 0 0 5.2 11L5 15z"/><circle cx="7.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/><circle cx="16.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/></svg>`;
}

function suvSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15h16l-1.4-5a2 2 0 0 0-1.9-1.5H7.3A2 2 0 0 0 5.4 10L4 15z"/><circle cx="7.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/><circle cx="16.5" cy="17.5" r="1.5" fill="#fff" stroke="none"/><path d="M8 10V7h8v3"/></svg>`;
}

function diamondSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12 3 4 10l8 11 8-11-8-7z"/></svg>`;
}

function borderRadiusFor(shape, size) {
  if (shape === 'pill') return `${size / 2.5}px`;
  if (shape === 'rounded') return '8px';
  return '50%';
}

export function getVehicleMarkerHtml(vehicleType, size = 36) {
  const category = normalizeFleetCategory(vehicleType);
  const cfg = STYLES[category] || STYLES.other;
  return `
    <div style="
      background:${cfg.bg};
      width:${size}px;
      height:${size}px;
      border-radius:${borderRadiusFor(cfg.shape, size)};
      border:2.5px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;
      align-items:center;
      justify-content:center;
    ">${cfg.svg}</div>`;
}

const iconCache = new Map();

export function getVehicleMapIcon(vehicleType, size = 36) {
  const category = normalizeFleetCategory(vehicleType);
  const cacheKey = `${category}-${size}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  const html = getVehicleMarkerHtml(vehicleType, size);

  const icon = new L.DivIcon({
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: 'vehicle-map-marker',
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

export const FLEET_LEGEND = [
  { category: 'bike', label: 'Bike' },
  { category: 'auto', label: 'Auto' },
  { category: 'mini', label: 'Mini' },
  { category: 'sedan', label: 'Sedan' },
  { category: 'suv', label: 'SUV' },
  { category: 'premium', label: 'Premium' },
];
