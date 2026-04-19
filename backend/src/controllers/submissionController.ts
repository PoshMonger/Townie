import { Request, Response } from 'express';
import pool from '../db/pool';

export async function createSubmission(req: Request, res: Response): Promise<void> {
  const { business_name, description, address, latitude, longitude, category, phone, instagram, deals_info } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!business_name || !address || !category) {
    res.status(400).json({ error: 'business_name, address, and category are required' });
    return;
  }

  const images = files ? files.map((f) => `/uploads/${f.filename}`) : [];

  try {
    const result = await pool.query(
      `INSERT INTO submissions
        (submitted_by, business_name, description, address, latitude, longitude, category, phone, instagram, deals_info, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        req.user!.id,
        business_name,
        description || null,
        address,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        category,
        phone || null,
        instagram || null,
        deals_info || null,
        JSON.stringify(images),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createSubmission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getMySubmissions(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE submitted_by = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
