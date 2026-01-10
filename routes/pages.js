const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation rules
const pageValidation = [
  body('title_en').trim().isLength({ max: 255 }).optional(),
  body('title_ar').trim().isLength({ max: 255 }).optional(),
  body('content_en').trim().isLength({ max: 10000 }).optional(),
  body('content_ar').trim().isLength({ max: 10000 }).optional()
];

// GET /api/pages - Get all pages
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pages ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pages/:slug - Get page by slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM pages WHERE slug = ?',
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/pages/:slug - Admin: Update page
router.put('/:slug', authMiddleware, validate(pageValidation), async (req, res) => {
  try {
    const { title_en, title_ar, content_en, content_ar } = req.body;

    await pool.execute(
      `UPDATE pages SET title_en = ?, title_ar = ?, content_en = ?, content_ar = ? WHERE slug = ?`,
      [title_en || '', title_ar || '', content_en || '', content_ar || '', req.params.slug]
    );

    const [updated] = await pool.execute('SELECT * FROM pages WHERE slug = ?', [req.params.slug]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
