# BizTrack - Separate Frontend & Backend Setup

## Architecture Overview

BizTrack uses a **separate frontend and backend architecture**:

```
BizTrack/
├── frontend/              # React Application (Port 3000)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context providers
│   │   ├── utils/        # Utilities (API, storage, etc.)
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
└── backend/              # Node.js/Express API (Port 5001)
    ├── routes/           # API route handlers
    ├── controllers/      # Business logic
    ├── middleware/       # Auth middleware
    ├── config/           # Database & passport config
    ├── data/             # SQLite database (gitignored)
    ├── package.json      # Backend dependencies
    └── server-production.js  # Main server file
```

## Why Separate Frontend & Backend?

### Advantages ✅

1. **Clear Separation of Concerns**
   - Frontend focuses on UI/UX
   - Backend focuses on business logic and data

2. **Independent Development**
   - Frontend team can work independently
   - Backend team can work independently
   - Different technologies can be used

3. **Scalability**
   - Scale frontend and backend separately
   - Deploy to different servers if needed
   - Add load balancers easily

4. **Flexibility**
   - Can have multiple frontends (web, mobile app)
   - Can swap frontend framework without touching backend
   - Can add more backend services

5. **Better Testing**
   - Test frontend and backend separately
   - Mock API responses for frontend testing
   - Test API endpoints independently

### Disadvantages ⚠️

1. **More Complex Setup**
   - Need to run two servers
   - CORS configuration required
   - More deployment steps

2. **Development Overhead**
   - Two package.json files
   - Two sets of dependencies
   - Two terminal windows

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend** (`backend/.env`):
```bash
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./data/biztrack.db
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:5001
```

### Step 3: Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

Backend will run on: `http://localhost:5001`

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Step 4: Access Application

Open browser: `http://localhost:3000`

The frontend will communicate with the backend API at `http://localhost:5001`

## How They Communicate

### Frontend → Backend

Frontend makes HTTP requests to backend API:

```javascript
// frontend/src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ email, password })
});
```

### Backend → Frontend

Backend sends JSON responses:

```javascript
// backend/controllers/authController.js
res.json({
  success: true,
  token: 'jwt-token-here',
  user: { id: 1, email: 'user@example.com' }
});
```

### CORS Configuration

Backend allows requests from frontend:

```javascript
// backend/server-production.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Database

### SQLite Database

- **Location**: `backend/data/biztrack.db`
- **Type**: SQLite (file-based)
- **Gitignored**: Yes (never committed)
- **Auto-created**: Yes (on first run)

### Tables

1. **users** - User accounts
2. **inventory** - Inventory items
3. **sales** - Sales transactions
4. **orders** - Customer orders
5. **transactions** - Financial transactions

### Database is NOT in Git

The database file is **gitignored** for security:
- Contains user data
- Contains business data
- Should never be committed
- Each environment has its own database

## Production Deployment

### Option 1: Deploy Separately

**Frontend** (Vercel/Netlify):
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

**Backend** (Railway/Heroku):
```bash
cd backend
# Deploy to Railway/Heroku
```

Update frontend `.env.production`:
```bash
VITE_API_URL=https://your-backend-api.com
```

### Option 2: Deploy Together (Unified)

Use the unified version (`server-unified.js`) which serves both:
```bash
npm run build  # Builds frontend
npm start      # Serves frontend + backend
```

See `UNIFIED_SETUP.md` for details.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Inventory
- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Add item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/stats` - Get inventory stats

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/stats` - Get sales stats

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats` - Get order stats

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary
- `GET /api/transactions/stats/type` - Get stats by type
- `GET /api/transactions/stats/category` - Get stats by category

### Admin (Role: admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform stats
- `GET /api/admin/activity` - Get recent activity

## Development Workflow

### Making Changes

**Frontend Changes**:
1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. See changes instantly in browser

**Backend Changes**:
1. Edit files in `backend/`
2. Restart server (or use nodemon)
3. Test API endpoints

### Testing

**Frontend**:
```bash
cd frontend
npm run test  # If tests are configured
```

**Backend**:
```bash
cd backend
npm run test  # If tests are configured
```

**API Testing**:
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## Troubleshooting

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**: Check CORS configuration in backend
```javascript
// backend/server-production.js
app.use(cors({
  origin: 'http://localhost:3000',  // Must match frontend URL
  credentials: true
}));
```

### Connection Refused

**Problem**: Frontend shows "Network Error"

**Solution**: 
1. Make sure backend is running on port 5001
2. Check `VITE_API_URL` in frontend/.env
3. Verify backend is accessible: `curl http://localhost:5001/api/health`

### Database Not Found

**Problem**: Backend shows "Database not found"

**Solution**: Database is auto-created on first run
```bash
cd backend
mkdir -p data
npm start  # Database will be created
```

### Port Already in Use

**Problem**: "Port 5001 already in use"

**Solution**: Kill the process or change port
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5001
kill -9 <PID>

# Or change port in backend/.env
PORT=5002
```

## File Structure Details

### Frontend Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── QuickActions.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Orders.jsx
│   │   └── ...
│   ├── context/            # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/              # Utilities
│   │   ├── api.js          # API functions
│   │   ├── storage.js      # LocalStorage utils
│   │   └── ...
│   ├── App.jsx             # Main app
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static files
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite config
└── tailwind.config.js      # Tailwind config
```

### Backend Structure

```
backend/
├── routes/                 # API routes
│   ├── auth-production.js
│   ├── inventory.js
│   ├── orders.js
│   ├── sales.js
│   ├── transactions.js
│   └── admin.js
├── controllers/            # Business logic
│   ├── authController.js
│   ├── inventoryController.js
│   └── ...
├── middleware/             # Middleware
│   └── auth.js            # JWT auth middleware
├── config/                 # Configuration
│   ├── database-production.js
│   └── passport.js
├── data/                   # Database (gitignored)
│   └── biztrack.db
├── migrations/             # Database migrations
├── package.json            # Dependencies
└── server-production.js    # Main server
```

## Security Notes

### What's Gitignored

✅ **Ignored (Safe)**:
- `node_modules/` - Dependencies
- `.env` files - Environment variables
- `*.db` files - Database files
- `dist/` - Build output
- `admin-panel/` - Admin panel

❌ **Not Ignored (Public)**:
- Source code
- Configuration templates (`.env.example`)
- Documentation
- Package.json files

### Sensitive Data

**Never commit**:
- Database files (`.db`)
- Environment variables (`.env`)
- JWT secrets
- API keys
- User data

**Safe to commit**:
- Source code
- Configuration templates
- Documentation
- Package dependencies list

## Comparison: Separate vs Unified

| Aspect | Separate | Unified |
|--------|----------|---------|
| **Servers** | 2 (frontend + backend) | 1 (combined) |
| **Ports** | 3000 + 5001 | 5001 only |
| **CORS** | Required | Not needed |
| **Deployment** | 2 deployments | 1 deployment |
| **Development** | 2 terminals | 1 terminal |
| **Flexibility** | High | Medium |
| **Complexity** | Higher | Lower |
| **Best For** | Large teams, microservices | Small teams, simple deploy |

## When to Use Separate Architecture

✅ **Use Separate When**:
- Working with a team
- Need independent scaling
- Want to use different hosting for frontend/backend
- Building mobile app + web app
- Need maximum flexibility
- Have complex requirements

⚠️ **Use Unified When**:
- Solo developer
- Simple deployment needed
- Small to medium project
- Want simplicity over flexibility
- Limited hosting budget

## Next Steps

1. **Development**: Run both servers and start coding
2. **Testing**: Test frontend and backend separately
3. **Deployment**: Choose deployment strategy
4. **Monitoring**: Set up logging and monitoring
5. **Scaling**: Scale frontend and backend independently

## Support

- **Documentation**: See README.md
- **Unified Version**: See UNIFIED_SETUP.md
- **Single File**: See SINGLE_FILE_README.md
- **Security**: See SECURITY.md
- **Issues**: GitHub Issues

---

**Version**: 3.0.0  
**Last Updated**: May 2, 2026  
**Architecture**: Separate Frontend & Backend  
**Status**: Production Ready
