const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation rules for public message submission
const messageValidation = [
  body('name').trim().notEmpty().isLength({ max: 100 }).escape().withMessage('Name is required (max 100 chars)'),
  body('phone').trim().isLength({ max: 50 }).optional().escape(),
  body('message').trim().notEmpty().isLength({ max: 2000 }).escape().withMessage('Message is required (max 2000 chars)')
];

// POST /api/messages - Public: Submit contact message
router.post('/', validate(messageValidation), async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO messages (name, phone, message) VALUES (?, ?, ?)',
      [name, phone || null, message]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages - Admin: Get all messages
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [messages] = await pool.execute(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit.toString(), offset.toString()]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM messages');
    const total = countResult[0].total;

    const [unreadCount] = await pool.execute('SELECT COUNT(*) as unread FROM messages WHERE is_read = FALSE');

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount: unreadCount[0].unread
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages/:id - Admin: Get single message
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM messages WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/messages/:id/read - Admin: Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE messages SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/messages/:id - Admin: Delete message
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
