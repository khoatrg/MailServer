const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const user = await db.createUser({ email, name, passwordHash: hashed });
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    if (err && err.code === 'USER_EXISTS') return res.status(409).json({ error: 'User already exists' });
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const row = await db.getUserByEmail(email);
    if (!row) return res.status(401).json({ error: 'invalid_credentials' });

    const match = bcrypt.compareSync(password, row.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ id: row.id, email: row.email, name: row.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: row.id, email: row.email, name: row.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
