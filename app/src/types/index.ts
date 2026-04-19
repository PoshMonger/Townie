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
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  image_url?: string;
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
  status: ContentStatus;
  deals?: Deal[];
  distance?: number;
}

export interface Submission {
  id: string;
  submitted_by: string;
  business_name: string;
  description?: string;
  address: string;
  category: BusinessCategory;
  phone?: string;
  instagram?: string;
  deals_info?: string;
  status: ContentStatus;
  created_at: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DealDetail: { business: Business };
  AdminDashboard: undefined;
  ReviewSubmission: { submissionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Submit: undefined;
  Profile: undefined;
};
