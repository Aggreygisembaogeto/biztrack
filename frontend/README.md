# Frontend Documentation

## Overview
React 18 + Vite + Tailwind CSS frontend with real-time updates via Socket.io.

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── StatsCard.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── AIAssistant.jsx
│   │   └── TransactionModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Components

### Sidebar
Navigation sidebar with user info and menu items.

**Props:** None (uses AuthContext)

### StatsCard
Displays a statistic with icon and color.

**Props:**
- `title` (string) - Card title
- `value` (string/number) - Main value to display
- `icon` (ReactNode) - Icon component
- `color` (string) - Color theme: 'green', 'blue', 'purple', 'orange'

### ActivityFeed
Shows recent transactions in real-time.

**Props:**
- `transactions` (array) - Array of transaction objects
- `onAddTransaction` (function) - Callback when add button clicked

### AIAssistant
Chat interface for AI-powered business insights.

**Props:** None (manages own state)

### TransactionModal
Modal for creating new transactions.

**Props:**
- `onClose` (function) - Callback to close modal
- `onSuccess` (function) - Callback when transaction created

## Context

### AuthContext
Manages authentication state and provides auth functions.

**Provided Values:**
- `user` - Current user object
- `token` - JWT token
- `login(email, password)` - Login function
- `register(email, password, business_name)` - Register function
- `logout()` - Logout function
- `loading` - Loading state

**Usage:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  // ...
}
```

## Pages

### Login
User login page with email and password fields.

### Register
User registration page with business name, email, and password.

### Dashboard
Main dashboard with stats, activity feed, and AI assistant.

## Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with a custom dark theme.

**Color Palette:**
- Primary: Blue shades (primary-500, primary-600, etc.)
- Background: Gray-900, Gray-800
- Cards: Gray-800 with Gray-700 borders
- Text: White, Gray-400, Gray-300

### Custom Styles
Additional styles in `index.css`:
- Custom scrollbar
- Font smoothing
- Base resets

## State Management

### Local State
- Component-level state with `useState`
- Form data, loading states, modals

### Context State
- Authentication (AuthContext)
- User data
- JWT token

### Real-time Updates
- Socket.io connection in Dashboard
- Automatic data refresh on new transactions

## API Integration

### Axios Configuration
Base URL configured in `vite.config.js` proxy:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

### Authentication Headers
Automatically set in AuthContext:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## Real-time Features

### Socket.io Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  socket.emit('authenticate', token);
});

socket.on('new_transaction', (transaction) => {
  // Handle new transaction
});
```

## Running the Frontend

### Development
```bash
npm run dev
```
Runs on `http://localhost:3000`

### Build
```bash
npm run build
```
Creates production build in `dist/` folder

### Preview
```bash
npm run preview
```
Preview production build locally

## Environment Variables

Create `.env` file (if needed):
```env
VITE_API_URL=http://localhost:5000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Routing

Uses React Router v6:
- `/` - Redirects to dashboard
- `/login` - Login page (public)
- `/register` - Register page (public)
- `/dashboard` - Dashboard (protected)

### Protected Routes
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Public Routes
```jsx
<PublicRoute>
  <Login />
</PublicRoute>
```

## Notifications

Uses React Toastify for notifications:
```javascript
import { toast } from 'react-toastify';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
```

## Icons

Uses React Icons (Feather Icons):
```javascript
import { FiHome, FiUser, FiSettings } from 'react-icons/fi';
```

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use functional components with hooks
   - Extract reusable logic to custom hooks

2. **State Management**
   - Use local state for UI-only state
   - Use context for shared state
   - Avoid prop drilling

3. **Styling**
   - Use Tailwind utility classes
   - Keep custom CSS minimal
   - Use consistent color scheme

4. **Performance**
   - Lazy load routes if needed
   - Memoize expensive calculations
   - Optimize re-renders

5. **Error Handling**
   - Show user-friendly error messages
   - Log errors to console
   - Handle network errors gracefully

## Troubleshooting

### Port Already in Use
Change port in `vite.config.js`:
```javascript
server: {
  port: 3001
}
```

### API Connection Issues
Check proxy configuration in `vite.config.js` and ensure backend is running.

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```
