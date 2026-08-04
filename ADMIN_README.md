# JK Taxi Admin Dashboard

Professional admin dashboard for managing the JK Taxi platform.

## Features

### Dashboard
- Real-time statistics
- Total users, drivers, rides
- Active and completed rides count
- Total revenue tracking
- Quick action cards

### Users Management
- View all customers
- Block/unblock users
- User activity status
- Registration date tracking

### Drivers Management
- View all drivers
- Block/unblock drivers
- Online/offline status
- Vehicle information
- Verification status
- Registration date tracking

### Rides Management
- View all rides
- Ride status tracking (Pending, Accepted, In Progress, Completed, Cancelled)
- Pickup and dropoff locations
- Fare information
- Creation timestamps

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts (ready for analytics)

## Test Credentials

```
Username: admin
Password: admin123
```

## Running the Dashboard

### Development
```bash
cd /home/sakthi-selvan/jk_taxi/web/admin
npm run dev
```

Dashboard will be available at: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## API Endpoints Used

### Authentication
- POST `/api/auth/admin/login` - Admin login

### Dashboard
- GET `/api/admin/dashboard/stats` - Get statistics

### Users
- GET `/api/admin/users` - Get all users
- GET `/api/admin/users/{id}` - Get specific user
- PUT `/api/admin/users/{id}/block` - Block user
- PUT `/api/admin/users/{id}/unblock` - Unblock user

### Drivers
- GET `/api/admin/drivers` - Get all drivers
- GET `/api/admin/drivers/{id}` - Get specific driver
- PUT `/api/admin/drivers/{id}/block` - Block driver
- PUT `/api/admin/drivers/{id}/unblock` - Unblock driver

### Rides
- GET `/api/admin/rides` - Get all rides
- GET `/api/admin/rides/{id}` - Get specific ride

## Project Structure

```
src/
├── api/
│   ├── client.js       # Axios instance with interceptors
│   ├── auth.js         # Auth API calls
│   └── admin.js        # Admin API calls
├── components/
│   ├── Layout.jsx      # Sidebar layout
│   └── Layout.css
├── pages/
│   ├── Login.jsx       # Login page
│   ├── Login.css
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Dashboard.css
│   ├── Users.jsx       # Users management
│   ├── Drivers.jsx     # Drivers management
│   ├── Rides.jsx       # Rides management
│   └── Users.css       # Shared table styles
├── config.js           # API base URL
├── App.jsx             # Main app with routing
├── App.css
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Design System

### Colors
- Background: `#0F172A` (Dark slate)
- Surface: `#1E293B` (Slate)
- Border: `#334155` (Slate gray)
- Primary: `#8B5CF6` (Purple)
- Text: `#F8FAFC` (White)
- Secondary Text: `#94A3B8` (Gray)

### Components
- Sidebar navigation with icons
- Data tables with hover effects
- Status badges for different states
- Action buttons (block/unblock)
- Loading and error states
- Responsive stats cards

## Features

### Authentication
- JWT token-based auth
- Auto-logout on token expiration
- Protected routes
- Persistent login state

### Dashboard
- 6 key metrics displayed
- Quick action cards
- Responsive grid layout
- Real-time data

### Tables
- Sortable columns
- Hover effects
- Status badges
- Action buttons
- Empty states
- Loading states

### Status Badges
- Active/Blocked (users/drivers)
- Online/Offline (drivers)
- Verified/Pending (drivers)
- Ride statuses (Pending, Accepted, Started, Completed, Cancelled)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- Code splitting with React Router
- Lazy loading of routes
- Optimized bundle size
- Fast dev server with Vite HMR

## Security

- JWT token validation
- Protected API routes
- Auto-logout on auth failure
- CORS configured

## Status

✅ 100% Complete and Production Ready

All features implemented and tested with backend API integration.
