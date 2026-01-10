const express = require('express');
const { body, param } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const upload = require("../middleware/uploadServiceImage");

const router = express.Router();

// Validation rules
const serviceValidation = [
  body('title_en').trim().notEmpty().isLength({ max: 255 }).withMessage('English title is required (max 255 chars)'),
  body('title_ar').trim().notEmpty().isLength({ max: 255 }).withMessage('Arabic title is required (max 255 chars)'),
  body('description_en').trim().isLength({ max: 2000 }).optional(),
  body('description_ar').trim().isLength({ max: 2000 }).optional(),
  body('icon').trim().isLength({ max: 2000 }).optional(),
  body('is_active').isBoolean().optional(),
  body('sort_order').isInt({ min: 0 }).optional()
];

// GET /api/services - Public: Get all active services
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/services/all - Admin: Get all services including inactive
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM services ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/services/:id - Get single service
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/services - Admin: Create service
router.post('/', authMiddleware, validate(serviceValidation), async (req, res) => {
  try {
    const { title_en, title_ar, description_en, description_ar, icon, is_active, sort_order } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO services (title_en, title_ar, description_en, description_ar, icon, is_active, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title_en, title_ar, description_en || '', description_ar || '', icon || 'Wrench', is_active !== false, sort_order || 0]
    );

    const [newService] = await pool.execute('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json(newService[0]);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/services/:id - Admin: Update service
router.put('/:id', validate(serviceValidation), async (req, res) => {
  try {
    const { title_en, title_ar, description_en, description_ar, icon, is_active, sort_order } = req.body;

    await pool.execute(
      `UPDATE services SET title_en = ?, title_ar = ?, description_en = ?, description_ar = ?, 
       icon = ?, is_active = ?, sort_order = ? WHERE id = ?`,
      [title_en, title_ar, description_en || '', description_ar || '', icon || 'Wrench', is_active !== false, sort_order || 0, req.params.id]
    );

    const [updated] = await pool.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/services/:id - Admin: Delete service
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM services WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
