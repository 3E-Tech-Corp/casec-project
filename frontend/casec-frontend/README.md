# CASEC Frontend - React + Vite + Tailwind CSS

Modern React frontend for the CASEC Membership Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running at `https://localhost:5001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📦 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🎨 Features

### User Features
- ✅ User registration with membership type selection
- ✅ Login/logout with JWT authentication
- ✅ Dashboard with activity overview
- ✅ Profile management
- ✅ Browse and join clubs
- ✅ Register for events
- ✅ Payment processing

### Admin Features
- ✅ Manage membership types (stub)
- ✅ Manage clubs (stub)
- ✅ Manage events (stub)

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.jsx           # Main layout with navigation
├── pages/
│   ├── Login.jsx            # Login page
│   ├── Register.jsx         # Registration page
│   ├── Dashboard.jsx        # User dashboard
│   ├── Clubs.jsx            # Browse and join clubs
│   ├── Events.jsx           # Browse and register for events
│   ├── Profile.jsx          # User profile management
│   ├── Payment.jsx          # Membership payment
│   └── admin/               # Admin pages
│       ├── MembershipTypes.jsx
│       ├── Clubs.jsx
│       └── Events.jsx
├── services/
│   └── api.js               # API service with axios
├── store/
│   └── useStore.js          # Zustand state management
├── App.jsx                  # Main app with routing
├── main.jsx                 # Entry point
└── index.css                # Tailwind CSS imports
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://localhost:5001/api
```

### API Proxy (Development)

The Vite config includes a proxy for `/api` requests:

```javascript
proxy: {
  '/api': {
    target: 'https://localhost:5001',
    changeOrigin: true,
    secure: false,
  }
}
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔐 Authentication Flow

1. **Registration**: User selects membership type and provides details
2. **Login**: User receives JWT token stored in localStorage
3. **Protected Routes**: Token automatically attached to API requests
4. **Auto-logout**: On 401 responses, user redirected to login

## 🎨 Styling

### Tailwind Configuration

Custom colors defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#0A4D3C',
    light: '#0F6B52',
    dark: '#083829',
  },
  accent: {
    DEFAULT: '#E8A33E',
    light: '#F4C57C',
    dark: '#D89428',
  },
}
```

### Custom CSS Classes

Defined in `src/index.css`:

- `.btn` - Base button styles
- `.btn-primary` - Primary button (green)
- `.btn-secondary` - Secondary button (outline)
- `.btn-accent` - Accent button (gold)
- `.card` - Card container
- `.input` - Form input

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔄 State Management

### Auth Store (Persisted)

```javascript
const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();
```

### App Store

```javascript
const { 
  membershipTypes, clubs, events, 
  setClubs, setEvents, setDashboardData 
} = useAppStore();
```

## 🌐 API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
import { authAPI, clubsAPI, eventsAPI, usersAPI } from '../services/api';

// Example usage
const response = await clubsAPI.getAll();
```

## 🚧 Admin Features (To Be Implemented)

The admin pages are stubs. To implement full CRUD:

1. Add forms for create/edit
2. Add tables/lists for viewing
3. Add delete confirmations
4. Connect to respective API endpoints

Example stub in `pages/admin/MembershipTypes.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { membershipTypesAPI } from '../../services/api';

export default function MembershipTypes() {
  // Add state and handlers
  // Implement table, forms, and actions
}
```

## 🐛 Troubleshooting

### API Connection Issues

1. **Verify backend is running**: Check `https://localhost:5001/swagger`
2. **Check CORS**: Ensure API has CORS configured for `http://localhost:3000`
3. **SSL Errors**: Set `secure: false` in vite.config.js proxy

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

```bash
# Restart dev server
npm run dev
```

## 📦 Production Build

```bash
# Build for production
npm run build

# Output will be in ./dist
# Deploy dist/ folder to your hosting service
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## 🎯 Next Steps

1. **Implement Admin CRUD**: Complete admin pages for full management
2. **Add Loading States**: Better loading indicators
3. **Error Boundaries**: Add React error boundaries
4. **Tests**: Add unit and integration tests
5. **Animations**: Add page transitions with Framer Motion
6. **Dark Mode**: Implement dark mode toggle
7. **Notifications**: Add toast notifications
8. **Search/Filter**: Add search and filtering for clubs/events

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Router Documentation](https://reactrouter.com)

## 🤝 Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Keep components small and focused
4. Add comments for complex logic
5. Test on multiple screen sizes

---

**Built with ❤️ for CASEC Community**
