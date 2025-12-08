import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'in_production' | 'shipped' | 'completed' | 'cancelled';
  design_data: any;
  roster_data: any;
  shipping_info: any;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DesignTemplate = {
  id: string;
  created_by: string;
  sport: string;
  name: string;
  description: string | null;
  template_data: any;
  is_published: boolean;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
};
