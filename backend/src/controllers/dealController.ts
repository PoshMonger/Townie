import { Request, Response } from 'express';
import pool from '../db/pool';

export async function getDealsForBusiness(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM deals WHERE business_id = $1 ORDER BY created_at DESC',
      [req.params.businessId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function createDeal(req: Request, res: Response): Promise<void> {
  const {
    business_id, title, description, deal_type, discount_text,
    start_time, end_time, days_of_week, valid_from, valid_until,
  } = req.body;

  if (!business_id || !title || !deal_type) {
    res.status(400).json({ error: 'business_id, title, and deal_type are required' });
    return;
  }

  try {
    const bizCheck = await pool.query(
      "SELECT id FROM businesses WHERE id = $1 AND status = 'approved'",
      [business_id]
    );
    if (!bizCheck.rows[0]) {
      res.status(404).json({ error: 'Approved business not found' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO deals
        (business_id, title, description, deal_type, discount_text, start_time, end_time, days_of_week, valid_from, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [business_id, title, description, deal_type, discount_text, start_time, end_time, days_of_week, valid_from, valid_until]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createDeal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateDeal(req: Request, res: Response): Promise<void> {
  const {
    title, description, deal_type, discount_text,
    start_time, end_time, days_of_week, valid_from, valid_until, is_active,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE deals SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        deal_type = COALESCE($3, deal_type),
        discount_text = COALESCE($4, discount_text),
        start_time = COALESCE($5, start_time),
        end_time = COALESCE($6, end_time),
        days_of_week = COALESCE($7, days_of_week),
        valid_from = COALESCE($8, valid_from),
        valid_until = COALESCE($9, valid_until),
        is_active = COALESCE($10, is_active)
       WHERE id = $11
       RETURNING *`,
      [title, description, deal_type, discount_text, start_time, end_time, days_of_week, valid_from, valid_until, is_active, req.params.id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteDeal(req: Request, res: Response): Promise<void> {
  try {
    await pool.query('DELETE FROM deals WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
