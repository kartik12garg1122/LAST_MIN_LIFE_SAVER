import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || '';
  }
  return '';
};

export const getSupabaseUrl = (): string => getEnv('VITE_SUPABASE_URL');
export const getSupabaseAnonKey = (): string => getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder');
};

export const supabase = createClient(
  getSupabaseUrl() || 'https://placeholder.supabase.co',
  getSupabaseAnonKey() || 'placeholder'
);
