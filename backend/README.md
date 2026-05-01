# Backend API Documentation

## Overview
Node.js + Express backend with SQLite database and JWT authentication.

**Current Status**: ✅ Authentication fully implemented | ⏳ Transactions, AI, M-PESA routes available but not connected

## Project Structure
```
backend/
├── config/
│   ├── database-production.js  # SQLite connection (ACTIVE)
│   ├── database-sqlite.js      # SQLite helper
│   ├── database.js             # PostgreSQL (NOT USED)
│   └── database.sql            # Database schema
├── controllers/
│   ├── authController-production.js  # Auth logic (ACTIVE)
│   ├── authController.js             # Old auth (NOT USED)
│   ├── transactionController.js      # Available but not connected
│   ├── mpesaController.js            # Available but not connected
│   └── aiController.js               # Available but not connected
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth-production.js   # Auth routes (ACTIVE)
│   ├── auth.js              # Old auth (NOT USED)
│   ├── transactions.js      # Available but not connected
│   ├── mpesa.js             # Available but not connected
│   └── ai.js                # Available but not connected
├── server-production.js     # Production server (ACTIVE)
├── server.js                # Old server with Socket.io (NOT USED)
├── package.json
└── .env.example
```

## Currently Implemented API Endpoints

### ✅ Authentication (Fully Working)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "business_name": "My Restaurant"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "business_name": "My Restaurant"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "business_name": "My Restaurant",
      "phone": "254712345678",
      "address": "123 Main St"
    }
  }
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_name": "Updated Business Name",
  "phone": "254712345678",
  "address": "New Address"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { updated_user_object }
  }
}
```

#### Change Password
```http
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## ⏳ Available But Not Connected

The following routes exist in the codebase but are **not connected** to the production server. They would need to be:
1. Connected to `server-production.js`
2. Updated to use SQLite instead of PostgreSQL
3. Tested and verified

### Transactions (Not Connected)

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1500,
  "type": "order",
  "description": "Table 5 - Lunch",
  "customer_phone": "254712345678",
  "status": "completed"
}

Response:
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { transaction_object }
}
```

#### Get Transactions
```http
GET /api/transactions?limit=50&offset=0&status=completed&type=order
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [ transaction_objects ],
  "count": 10
}
```

#### Get Summary
```http
GET /api/transactions/summary
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "today": {
      "revenue": 15000,
      "transactions": 25
    },
    "total": {
      "revenue": 150000,
      "transactions": 250
    },
    "recent_transactions": [ ... ]
  }
}
```

### AI Assistant (Not Connected)

#### Ask Question
```http
POST /api/ai/ask
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "How much did I make today?"
}

Response:
{
  "success": true,
  "data": {
    "question": "How much did I make today?",
    "answer": "Today you made KES 15,000 from 25 transactions..."
  }
}
```

### M-PESA (Not Connected)

#### Initiate Payment
```http
POST /api/mpesa/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1000,
  "phone_number": "254712345678",
  "description": "Payment for order"
}

Response:
{
  "success": true,
  "message": "Payment initiated. Please check your phone.",
  "data": { transaction_object }
}
```

---

## Socket.io Events (Not Implemented)

The old `server.js` has Socket.io support, but it's not used in production. If you need real-time features, these would need to be added to `server-production.js`.

### Would Include:

### Client to Server
- `authenticate` - Authenticate socket connection with JWT token

### Server to Client
- `authenticated` - Authentication result
- `new_transaction` - New transaction created (real-time update)

## Environment Variables

**Currently Required**:
```env
PORT=5000
JWT_SECRET=your_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**For Future Features** (if implementing transactions, AI, M-PESA):
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/business_dashboard
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# M-PESA (Optional)
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## Running the Server

### Production (Current)
```bash
cd backend
npm start
# Runs server-production.js with SQLite + Auth only
```

### Development with Auto-Reload
```bash
cd backend
npm run dev
# Uses nodemon for auto-restart on file changes
```

### Old Server (Not Recommended)
```bash
cd backend
npm run start:old
# Runs old server.js with Socket.io (requires PostgreSQL)
```

## Current Features vs Documentation Gap

### ✅ What's Working
- User registration with validation
- User login with JWT tokens
- Password hashing with bcrypt
- Profile management (view, update)
- Password change functionality
- SQLite database with auto-initialization
- Protected routes with JWT middleware
- CORS configuration
- Error handling
- Health check endpoint

### ⏳ What's Available But Not Connected
- Transaction management routes
- AI assistant routes
- M-PESA payment routes
- Socket.io real-time updates

### 📝 Current Data Storage
**Frontend (localStorage)**:
- Sales transactions
- Inventory items
- Expenses
- Orders
- Business settings
- Theme preferences

**Backend (SQLite)**:
- User accounts (encrypted)
- Authentication tokens
- User profiles

**Note**: Sales, inventory, expenses, and orders are currently stored in **localStorage only**. To persist them in the database, you would need to:
1. Add database tables for these entities
2. Connect the transaction routes
3. Update frontend to use API instead of localStorage

---

## Testing

### Test Authentication

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123",
    "business_name":"Test Business"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123"
  }'
```

**Get Profile** (replace TOKEN):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

**Health Check**:
```bash
curl http://localhost:5000/api/health
```

---

## Next Steps to Complete Backend

If you want to fully integrate the backend with all features:

### 1. Add Database Tables
Update `config/database-production.js` to create tables for:
- Transactions
- Inventory
- Orders
- Expenses

### 2. Connect Routes
Add to `server-production.js`:
```javascript
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/mpesa', require('./routes/mpesa'));
```

### 3. Update Controllers
Modify controllers to use SQLite instead of PostgreSQL:
- `transactionController.js`
- `aiController.js`
- `mpesaController.js`

### 4. Update Frontend
Change frontend to use API endpoints instead of localStorage for:
- Sales/transactions
- Inventory
- Orders
- Expenses

### 5. Add Socket.io (Optional)
If you need real-time updates, integrate Socket.io into `server-production.js`

---

## Security Features

- ✅ JWT authentication with 30-day expiry
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Input validation (email, password strength)
- ✅ Error handling without exposing internals
- ✅ Protected routes requiring authentication

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

---

## Database Schema

### Current Tables (SQLite)

**users**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Potential Future Tables

**transactions**:
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**inventory**:
```sql
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  min_stock DECIMAL(10,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**orders**:
```sql
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  items TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

**Version**: 3.0.0  
**Status**: ✅ Authentication Complete | ⏳ Other features available but not connected  
**Last Updated**: April 30, 2026
