# Security Documentation

## Overview

BizTrack implements multiple layers of security to protect user data and prevent unauthorized access. This document outlines all security measures implemented in the system.

## Authentication & Authorization

### Password Security
- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **Password Requirements**: Minimum 6 characters (configurable)
- **Storage**: Passwords are never stored in plain text
- **Verification**: Secure comparison using bcrypt.compare()

**Implementation**: `backend/controllers/authController.js`
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### JWT Token Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Stored in environment variable (JWT_SECRET)
- **Expiry**: 30 days
- **Storage**: Client-side in localStorage (token only, no sensitive data)
- **Transmission**: Bearer token in Authorization header

**Implementation**: `backend/middleware/auth.js`
```javascript
const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
```

### Role-Based Access Control (RBAC)
- **Roles**: 'user' (default) and 'admin'
- **Database Column**: `role` in users table
- **Enforcement**: Backend middleware checks role before granting access
- **Frontend Protection**: Routes protected based on user role

**Admin-Only Features**:
- Admin panel access (separate application on port 3001)
- User management
- System-wide analytics
- Platform administration

## Database Security

### SQL Injection Prevention
- **Method**: Parameterized queries using SQLite prepared statements
- **Implementation**: All database queries use `?` placeholders
- **Validation**: Input sanitization before database operations

**Example**:
```javascript
db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
```

### Database File Protection
- **Location**: `backend/data/biztrack.db`
- **Permissions**: File system level protection (server configuration)
- **Backup**: Regular backups recommended (not exposed via API)
- **Git Ignore**: Database files excluded from version control

### Data Encryption
- **Passwords**: bcrypt hashed (one-way encryption)
- **Tokens**: JWT signed with secret key
- **Sensitive Data**: Environment variables for API keys and secrets

## Network Security

### CORS (Cross-Origin Resource Sharing)
- **Configuration**: Controlled origin whitelist
- **Development**: `http://localhost:3000` (frontend), `http://localhost:3001` (admin)
- **Production**: Configurable via environment variables
- **Methods**: GET, POST, PUT, DELETE allowed
- **Credentials**: Enabled for authenticated requests

**Implementation**: `backend/server.js`
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### HTTPS/SSL
- **Development**: HTTP (localhost)
- **Production**: HTTPS required (configure with Let's Encrypt or similar)
- **Certificate**: Valid SSL certificate required for production
- **Redirect**: HTTP to HTTPS redirect recommended

### Rate Limiting
- **Purpose**: Prevent brute force attacks
- **Implementation**: Recommended for production (express-rate-limit)
- **Endpoints**: Login, register, password reset
- **Limits**: Configurable (e.g., 5 attempts per 15 minutes)

**Recommended Implementation**:
```javascript
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});
app.use('/api/auth/login', loginLimiter);
```

## Input Validation

### Email Validation
- **Format**: RFC 5322 compliant email format
- **Uniqueness**: Checked before registration
- **Sanitization**: Trimmed and lowercased

### Password Validation
- **Minimum Length**: 6 characters (configurable)
- **Strength**: Can be enhanced with complexity requirements
- **Confirmation**: Password confirmation on registration

### Data Validation
- **Type Checking**: All inputs validated for correct data types
- **Range Checking**: Numeric values validated for valid ranges
- **Sanitization**: HTML/script tags stripped from user inputs

## Error Handling

### Secure Error Messages
- **Production**: Generic error messages (no stack traces)
- **Development**: Detailed errors for debugging
- **Logging**: Errors logged server-side (not exposed to client)
- **Status Codes**: Appropriate HTTP status codes (401, 403, 404, 500)

**Example**:
```javascript
// Good - Generic message
res.status(401).json({ success: false, message: 'Invalid credentials' });

// Bad - Exposes information
res.status(401).json({ success: false, message: 'User not found in database' });
```

### Information Disclosure Prevention
- **User Enumeration**: Same error message for invalid email/password
- **Stack Traces**: Never sent to client in production
- **Database Errors**: Caught and logged, generic message returned
- **File Paths**: Never exposed in error messages

## Environment Variables

### Sensitive Data Protection
All sensitive configuration stored in `.env` files:

**Required Variables**:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://app.yourdomain.com
DATABASE_PATH=./data/biztrack.db
```

**Security Rules**:
- Never commit `.env` files to version control
- Use `.env.example` as template (no real values)
- Generate strong random JWT_SECRET (minimum 32 characters)
- Rotate secrets regularly in production
- Use different secrets for development/production

### Secret Generation
Generate strong JWT secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Frontend Security

### XSS Prevention
- **React**: Automatic escaping of user input
- **Sanitization**: HTML content sanitized before rendering
- **CSP**: Content Security Policy headers recommended

### Token Storage
- **Method**: localStorage (acceptable for JWT tokens)
- **Scope**: Domain-specific (not accessible cross-domain)
- **Expiry**: Token expires after 30 days
- **Cleanup**: Token removed on logout

### Protected Routes
- **Implementation**: React Router with authentication checks
- **Redirect**: Unauthenticated users redirected to login
- **Role Check**: Admin routes check for admin role

## API Security

### Authentication Required
All API endpoints (except login/register) require valid JWT token:
```javascript
Authorization: Bearer <token>
```

### Request Validation
- **Content-Type**: JSON expected for POST/PUT requests
- **Body Parsing**: Limited body size (prevent DoS)
- **Parameter Validation**: All parameters validated before processing

### Response Security
- **Headers**: Security headers configured
- **CORS**: Controlled origin access
- **Content-Type**: Proper content-type headers
- **Status Codes**: Appropriate HTTP status codes

## Admin Panel Security

### Isolation
- **Separate Application**: Admin panel is completely separate (port 3001)
- **Git Ignore**: Admin panel excluded from public repository
- **Access Control**: Only users with role='admin' can access
- **Authentication**: Same JWT authentication as main app

### Admin Features Protection
- **Backend Validation**: Role checked on every admin API call
- **Frontend Guards**: Admin routes protected with role check
- **Audit Logging**: Admin actions logged (recommended)

## Production Security Checklist

### Before Deployment
- [ ] Change JWT_SECRET to strong random string (32+ characters)
- [ ] Update all environment variables for production
- [ ] Enable HTTPS/SSL with valid certificate
- [ ] Configure firewall (allow only ports 80, 443)
- [ ] Set up rate limiting on authentication endpoints
- [ ] Configure CORS with production domain
- [ ] Set NODE_ENV=production
- [ ] Disable debug/verbose logging
- [ ] Set up database backups
- [ ] Review and update password requirements
- [ ] Test all authentication flows
- [ ] Verify admin panel is not publicly accessible
- [ ] Set up monitoring and alerting
- [ ] Configure security headers (helmet.js)
- [ ] Review and test error handling
- [ ] Perform security audit/penetration testing

### Security Headers (Recommended)
Install and configure helmet.js:
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Regular Maintenance
- Keep dependencies updated (npm audit)
- Monitor security advisories
- Rotate JWT secrets periodically
- Review access logs for suspicious activity
- Backup database regularly
- Test disaster recovery procedures

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. **Do NOT** open a public issue
2. Email security concerns to: [your-email@domain.com]
3. Include detailed description and steps to reproduce
4. Allow reasonable time for fix before public disclosure

## Security Best Practices for Users

### For Business Owners
- Use strong, unique passwords
- Change default admin password immediately
- Don't share login credentials
- Log out when finished
- Keep browser updated
- Use HTTPS in production
- Regular data backups

### For Developers
- Never commit `.env` files
- Use environment variables for secrets
- Keep dependencies updated
- Follow secure coding practices
- Test authentication thoroughly
- Review code for security issues
- Use parameterized queries
- Validate all user input
- Handle errors securely

## Compliance

### Data Protection
- User data stored securely in database
- Passwords hashed (never plain text)
- No unnecessary data collection
- Data export available (user control)

### Privacy
- No third-party tracking
- No data sharing
- User data belongs to user
- Can delete account and data

## Security Audit Log

### Version 3.0.0 (May 2, 2026)
- ✅ bcrypt password hashing implemented
- ✅ JWT authentication with 30-day expiry
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Role-based access control
- ✅ Protected routes (frontend and backend)
- ✅ Secure error handling
- ✅ Admin panel isolation
- ✅ Input validation
- ⚠️ Rate limiting recommended for production
- ⚠️ Security headers (helmet.js) recommended
- ⚠️ HTTPS/SSL required for production

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

---

**Last Updated**: May 2, 2026  
**Version**: 3.0.0  
**Status**: Production Ready with Security Measures Implemented
