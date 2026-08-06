import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../api/auth';
import './Layout.css';

const NAV_GROUPS = [
  {
    label: 'Insights',
    items: [
      { to: '/', label: 'Dashboard', icon: 'home' },
      { to: '/earnings', label: 'Earnings', icon: 'card' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/users', label: 'Users', icon: 'users' },
      { to: '/drivers', label: 'Drivers', icon: 'car' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/rides', label: 'Rides', icon: 'clock' },
      { to: '/active-rides', label: 'Active Rides', icon: 'radar' },
      { to: '/driver-locations', label: 'Driver Map', icon: 'pin' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/pricing', label: 'Pricing', icon: 'rupee' },
    ],
  },
];

function NavIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'car':
      return (
        <svg {...common}>
          <path d="M5 17h14v-5l-1.5-4.5h-11L5 12z" />
          <circle cx="7.5" cy="17" r="1.5" />
          <circle cx="16.5" cy="17" r="1.5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case 'radar':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'rupee':
      return (
        <svg {...common}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    default:
      return null;
  }
}

function Layout({ children, onLogout }) {
  const location = useLocation();
  const username = localStorage.getItem('admin_user');

  const handleLogout = () => {
    authAPI.logout();
    onLogout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">JK</div>
          <div>
            <h2>JK Taxi</h2>
            <div className="brand-sub">Admin Console</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <Link key={item.to} to={item.to} className={isActive(item.to) ? 'active' : ''}>
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{username?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{username}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
