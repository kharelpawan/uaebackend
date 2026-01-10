const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation rules
const highlightValidation = [
  body('text_en').trim().notEmpty().isLength({ max: 255 }).withMessage('English text is required (max 255 chars)'),
  body('text_ar').trim().notEmpty().isLength({ max: 255 }).withMessage('Arabic text is required (max 255 chars)'),
  body('icon').trim().isLength({ max: 50 }).optional(),
  body('is_active').isBoolean().optional(),
  body('sort_order').isInt({ min: 0 }).optional()
];

// GET /api/highlights - Public: Get all active highlights
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM highlights WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/highlights/all - Admin: Get all highlights
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM highlights ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get all highlights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/highlights - Admin: Create highlight
router.post('/', authMiddleware, validate(highlightValidation), async (req, res) => {
  try {
    const { text_en, text_ar, icon, is_active, sort_order } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO highlights (text_en, text_ar, icon, is_active, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [text_en, text_ar, icon || 'CheckCircle', is_active !== false, sort_order || 0]
    );

    const [newHighlight] = await pool.execute('SELECT * FROM highlights WHERE id = ?', [result.insertId]);
    res.status(201).json(newHighlight[0]);
  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/highlights/:id - Admin: Update highlight
router.put('/:id', authMiddleware, validate(highlightValidation), async (req, res) => {
  try {
    const { text_en, text_ar, icon, is_active, sort_order } = req.body;

    await pool.execute(
      `UPDATE highlights SET text_en = ?, text_ar = ?, icon = ?, is_active = ?, sort_order = ? WHERE id = ?`,
      [text_en, text_ar, icon || 'CheckCircle', is_active !== false, sort_order || 0, req.params.id]
    );

    const [updated] = await pool.execute('SELECT * FROM highlights WHERE id = ?', [req.params.id]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Highlight not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/highlights/:id - Admin: Delete highlight
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM highlights WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Highlight not found' });
    }

    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
