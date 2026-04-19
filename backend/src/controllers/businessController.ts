import { Request, Response } from 'express';
import pool from '../db/pool';

// Haversine distance in miles
const distanceSql = (latParam: string, lngParam: string) => `
  (3959 * acos(
    LEAST(1.0,
      cos(radians(${latParam}::float))
      * cos(radians(latitude::float))
      * cos(radians(longitude::float) - radians(${lngParam}::float))
      + sin(radians(${latParam}::float))
      * sin(radians(latitude::float))
    )
  ))
`;

export async function getNearby(req: Request, res: Response): Promise<void> {
  const { lat, lng, radius = '10', category } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }

  try {
    const params: (string | number)[] = [
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat(radius as string),
    ];

    const categoryFilter = category ? `AND b.category = $4` : '';
    if (category) params.push(category as string);

    const distExpr = distanceSql('$1', '$2');

    const result = await pool.query(
      `SELECT b.*,
        ${distExpr} AS distance,
        COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL AND d.is_active = true), '[]') AS deals
       FROM businesses b
       LEFT JOIN deals d ON d.business_id = b.id
       WHERE b.status = 'approved'
         ${categoryFilter}
       GROUP BY b.id
       HAVING ${distExpr} < $3
       ORDER BY distance ASC
       LIMIT 50`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getNearby error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT b.*,
        COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL), '[]') AS deals
       FROM businesses b
       LEFT JOIN deals d ON d.business_id = b.id
       WHERE b.id = $1 AND b.status = 'approved'
       GROUP BY b.id`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function search(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: 'Search query q is required' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT b.*,
        COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL AND d.is_active = true), '[]') AS deals
       FROM businesses b
       LEFT JOIN deals d ON d.business_id = b.id
       WHERE b.status = 'approved'
         AND (b.name ILIKE $1 OR b.description ILIKE $1 OR b.address ILIKE $1)
       GROUP BY b.id
       LIMIT 30`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getHotDeals(req: Request, res: Response): Promise<void> {
  const { lat, lng, radius = '25' } = req.query;
  const hasLocation = lat && lng;

  try {
    const params: (string | number)[] = hasLocation
      ? [parseFloat(lat as string), parseFloat(lng as string), parseFloat(radius as string)]
      : [];

    const distExpr = hasLocation ? `${distanceSql('$1', '$2')} AS distance` : 'NULL AS distance';
    const havingClause = hasLocation ? `HAVING ${distanceSql('$1', '$2')} < $3` : '';

    const result = await pool.query(
      `SELECT b.id AS business_id, b.name, b.category, b.cover_image_url, b.address, b.instagram, b.is_underground,
        ${distExpr},
        json_agg(d.*) AS deals
       FROM businesses b
       JOIN deals d ON d.business_id = b.id
       WHERE b.status = 'approved'
         AND d.is_active = true
         AND (d.valid_until IS NULL OR d.valid_until >= CURRENT_DATE)
       GROUP BY b.id, b.name, b.category, b.cover_image_url, b.address, b.instagram, b.is_underground
       ${havingClause}
       ORDER BY b.is_underground DESC, b.name ASC
       LIMIT 50`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getHotDeals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
