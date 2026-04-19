export type BusinessCategory = 'bar' | 'restaurant' | 'food_truck' | 'brewery' | 'popup' | 'other';
export type ContentStatus = 'pending' | 'approved' | 'rejected';
export type DealType = 'happy_hour' | 'weekly_special' | 'daily_special' | 'promotion' | 'limited';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  created_at: Date;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  category: BusinessCategory;
  phone?: string;
  website?: string;
  instagram?: string;
  is_underground: boolean;
  hours?: Record<string, string>;
  cover_image_url?: string;
  images?: string[];
  submitted_by?: string;
  verified_by?: string;
  status: ContentStatus;
  created_at: Date;
  updated_at: Date;
  distance?: number;
}

export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  deal_type: DealType;
  discount_text?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  valid_from?: Date;
  valid_until?: Date;
  is_active: boolean;
  image_url?: string;
  created_at: Date;
}

export interface Submission {
  id: string;
  submitted_by: string;
  business_name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category: BusinessCategory;
  phone?: string;
  instagram?: string;
  deals_info?: string;
  images?: string[];
  status: ContentStatus;
  reviewed_by?: string;
  review_notes?: string;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}
