import { Request, Response } from 'express';
import pool from '../db/pool';

export async function getPendingSubmissions(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT s.*, u.username AS submitter_username, u.email AS submitter_email
       FROM submissions s
       JOIN users u ON u.id = s.submitted_by
       WHERE s.status = 'pending'
       ORDER BY s.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function reviewSubmission(req: Request, res: Response): Promise<void> {
  const { status, review_notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'status must be approved or rejected' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const subResult = await client.query(
      `UPDATE submissions SET status=$1, reviewed_by=$2, review_notes=$3
       WHERE id=$4 AND status='pending'
       RETURNING *`,
      [status, req.user!.id, review_notes || null, req.params.id]
    );

    if (!subResult.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Pending submission not found' });
      return;
    }

    if (status === 'approved') {
      const sub = subResult.rows[0];
      await client.query(
        `INSERT INTO businesses
          (name, description, address, latitude, longitude, category, phone, instagram, images, submitted_by, verified_by, status, is_underground)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'approved',true)`,
        [
          sub.business_name,
          sub.description,
          sub.address,
          sub.latitude,
          sub.longitude,
          sub.category,
          sub.phone,
          sub.instagram,
          sub.images,
          sub.submitted_by,
          req.user!.id,
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Submission ${status}`, submission: subResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('reviewSubmission error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

export async function createBusiness(req: Request, res: Response): Promise<void> {
  const { name, description, address, latitude, longitude, category, phone, website, instagram, is_underground, hours } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!name || !address || !latitude || !longitude || !category) {
    res.status(400).json({ error: 'name, address, latitude, longitude, and category are required' });
    return;
  }

  const images = files ? files.map((f) => `/uploads/${f.filename}`) : [];
  const cover = images[0] || null;

  try {
    const result = await pool.query(
      `INSERT INTO businesses
        (name, description, address, latitude, longitude, category, phone, website, instagram, is_underground, hours, cover_image_url, images, submitted_by, verified_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14,'approved')
       RETURNING *`,
      [
        name,
        description || null,
        address,
        parseFloat(latitude),
        parseFloat(longitude),
        category,
        phone || null,
        website || null,
        instagram || null,
        is_underground !== 'false',
        hours ? JSON.parse(hours) : null,
        cover,
        JSON.stringify(images),
        req.user!.id,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createBusiness error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateBusiness(req: Request, res: Response): Promise<void> {
  const { name, description, address, latitude, longitude, category, phone, website, instagram, is_underground, hours, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE businesses SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        latitude = COALESCE($4, latitude),
        longitude = COALESCE($5, longitude),
        category = COALESCE($6, category),
        phone = COALESCE($7, phone),
        website = COALESCE($8, website),
        instagram = COALESCE($9, instagram),
        is_underground = COALESCE($10, is_underground),
        hours = COALESCE($11, hours),
        status = COALESCE($12, status),
        updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [name, description, address, latitude, longitude, category, phone, website, instagram, is_underground, hours ? JSON.parse(hours) : null, status, req.params.id]
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

export async function deleteBusiness(req: Request, res: Response): Promise<void> {
  try {
    await pool.query('DELETE FROM businesses WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const [bizCount, dealCount, userCount, pendingCount] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM businesses WHERE status='approved'"),
      pool.query('SELECT COUNT(*) FROM deals WHERE is_active=true'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM submissions WHERE status='pending'"),
    ]);
    res.json({
      businesses: parseInt(bizCount.rows[0].count),
      active_deals: parseInt(dealCount.rows[0].count),
      users: parseInt(userCount.rows[0].count),
      pending_submissions: parseInt(pendingCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
