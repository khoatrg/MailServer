require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// CORS
const FRONTEND = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: FRONTEND }));

// Rate limiter
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Auth routes (register/login)
app.use('/api/auth', authRoutes);

// Simple auth middleware for API routes
app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return next();
  const parts = auth.split(' ');
  if (parts.length !== 2) return next();
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    req.user = payload; // { id, email, name }
  } catch (err) {
    // ignore and continue; routes will reject if user required
  }
  next();
});

app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.json({ ok: true, version: '0.1.0' }));

app.listen(PORT, () => {
  console.log(`MailServer listening on port ${PORT}`);
});
