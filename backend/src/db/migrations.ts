import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE business_category AS ENUM ('bar', 'restaurant', 'food_truck', 'brewery', 'popup', 'other');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        CREATE TYPE deal_type AS ENUM ('happy_hour', 'weekly_special', 'daily_special', 'promotion', 'limited');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        avatar_url TEXT,
        role user_role NOT NULL DEFAULT 'user',
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        category business_category NOT NULL DEFAULT 'other',
        phone VARCHAR(50),
        website TEXT,
        instagram VARCHAR(100),
        is_underground BOOLEAN NOT NULL DEFAULT true,
        hours JSONB,
        cover_image_url TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
        verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
        status content_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deal_type deal_type NOT NULL DEFAULT 'promotion',
        discount_text VARCHAR(255),
        start_time TIME,
        end_time TIME,
        days_of_week INTEGER[],
        valid_from DATE,
        valid_until DATE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        category business_category NOT NULL DEFAULT 'other',
        phone VARCHAR(50),
        instagram VARCHAR(100),
        deals_info TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        status content_status NOT NULL DEFAULT 'pending',
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        review_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
      CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id);
      CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    `);

    await client.query('COMMIT');
    console.log('Migrations completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
