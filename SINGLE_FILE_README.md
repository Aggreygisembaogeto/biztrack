# BizTrack Single File Version

## Overview

This is a **complete business management system in ONE single file** (`biztrack-single-file.js`).

Everything is included:
- ✅ Express server
- ✅ SQLite database
- ✅ All API routes (auth, inventory, sales, orders, transactions)
- ✅ Frontend (HTML/CSS/JavaScript embedded)
- ✅ Authentication system (JWT + bcrypt)
- ✅ Business logic

**Total**: ~800 lines of code in one file!

## Quick Start

### 1. Install Dependencies

```bash
npm install express sqlite3 bcryptjs jsonwebtoken
```

### 2. Run the Server

```bash
node biztrack-single-file.js
```

### 3. Open Browser

```
http://localhost:5001
```

That's it! Your complete business management system is running.

## Features

### Authentication
- ✅ User registration
- ✅ User login
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)

### Dashboard
- ✅ Total sales count
- ✅ Total orders count
- ✅ Inventory items count
- ✅ Net profit calculation

### API Endpoints

**Auth**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Inventory**:
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

**Sales**:
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale

**Orders**:
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

**Transactions**:
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add transaction
- `GET /api/transactions/summary` - Get financial summary

## Configuration

### Environment Variables

```bash
# Optional - defaults provided
PORT=5001
JWT_SECRET=your-secret-key-min-32-chars
DB_PATH=./biztrack-single.db
```

### Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database

- **Type**: SQLite
- **File**: `biztrack-single.db` (auto-created)
- **Tables**: users, inventory, sales, orders, transactions

## Deployment

### Deploy to Railway.app

1. Create `package.json`:
```json
{
  "name": "biztrack-single",
  "version": "1.0.0",
  "main": "biztrack-single-file.js",
  "scripts": {
    "start": "node biztrack-single-file.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.7",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
```

2. Push to GitHub

3. Deploy on Railway:
   - Connect GitHub repo
   - Add environment variables
   - Deploy automatically

### Deploy to Vercel

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "biztrack-single-file.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "biztrack-single-file.js"
    }
  ]
}
```

Then:
```bash
vercel
```

### Deploy to Any Server

```bash
# On your server
git clone <your-repo>
cd <your-repo>
npm install express sqlite3 bcryptjs jsonwebtoken
node biztrack-single-file.js

# Or with PM2
pm2 start biztrack-single-file.js --name biztrack
```

## Testing

### Test API

```bash
# Health check
curl http://localhost:5001/api/health

# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","businessName":"Test Business"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Test Frontend

Open browser: `http://localhost:5001`

1. Click "Register"
2. Fill in details
3. Create account
4. View dashboard

## Advantages of Single File

### ✅ Pros
- **Simple**: Everything in one place
- **Portable**: Just copy one file
- **Easy to understand**: No complex structure
- **Quick deployment**: Upload one file
- **No build step**: Run directly
- **Self-contained**: All dependencies listed

### ⚠️ Cons
- **Limited features**: Simplified version
- **Not scalable**: For small projects only
- **Hard to maintain**: Large file
- **No hot reload**: Restart to see changes

## When to Use

**Use Single File Version When**:
- ✅ Prototyping quickly
- ✅ Learning/teaching
- ✅ Small personal projects
- ✅ Quick demos
- ✅ Minimal deployment

**Use Full Version When**:
- ✅ Production applications
- ✅ Team collaboration
- ✅ Complex features needed
- ✅ Scalability required
- ✅ Long-term maintenance

## Comparison

| Feature | Single File | Full Version |
|---------|-------------|--------------|
| Setup Time | 1 minute | 5 minutes |
| File Count | 1 file | 100+ files |
| Features | Basic | Complete |
| Scalability | Low | High |
| Maintenance | Hard | Easy |
| Team Work | Difficult | Easy |
| Production Ready | No | Yes |

## Extending

To add features, edit `biztrack-single-file.js`:

### Add New API Route

```javascript
app.get('/api/custom', authMiddleware, (req, res) => {
  // Your logic here
  res.json({ success: true, data: 'Custom data' });
});
```

### Add New Database Table

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS custom_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    data TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
```

### Modify Frontend

Edit the `FRONTEND_HTML` constant (around line 300).

## Troubleshooting

### Port Already in Use

```bash
# Change port
PORT=3000 node biztrack-single-file.js
```

### Database Locked

```bash
# Delete database and restart
rm biztrack-single.db
node biztrack-single-file.js
```

### Module Not Found

```bash
# Install dependencies
npm install express sqlite3 bcryptjs jsonwebtoken
```

## Security Notes

⚠️ **Before Production**:
1. Change JWT_SECRET to strong random string
2. Enable HTTPS
3. Add rate limiting
4. Add input validation
5. Add CORS restrictions
6. Set up proper error handling
7. Add logging
8. Regular backups

## Support

- **Full Version**: See main README.md
- **Issues**: GitHub Issues
- **Documentation**: See UNIFIED_SETUP.md

## License

MIT License - Same as main project

---

**Version**: 1.0.0 (Single File)  
**Last Updated**: May 2, 2026  
**Status**: Demo/Prototype Version  
**Recommended For**: Learning, Prototyping, Small Projects
