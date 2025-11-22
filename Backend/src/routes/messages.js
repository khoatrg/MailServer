const express = require('express');
const db = require('../db');

const router = express.Router();

// auth middleware expects req.user to be set by upstream middleware
router.get('/', async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  try {
    const rows = await db.getMessagesForEmail(user.email, 100);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/', async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const { to, subject, body } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });

  try {
    const msg = await db.insertMessage({ from_email: user.email, to_email: to, subject, body });
    res.status(201).json({ id: msg.id, from: msg.from_email, to: msg.to_email, subject: msg.subject, body: msg.body, created_at: msg.created_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
