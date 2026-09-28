-- =====================================================================
-- STUDENT LIFE SAVER: SUPABASE DATABASE MIGRATION & RLS POLICIES
-- Execute this SQL in your Supabase Dashboard -> SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 1: EXTEND EXISTING public.tasks TABLE WITH USER OWNERSHIP & INDEX
-- Existing columns preserved: id, title, completed, created_at, subject,
-- deadline, priority, estimated_minutes
-- ---------------------------------------------------------------------

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on ownership column for query performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx
ON public.tasks(user_id);

-- Enable Row Level Security (RLS) on public.tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Explicit privilege restriction: Revoke default permissions first
REVOKE ALL ON TABLE public.tasks FROM anon, authenticated;

-- Grant operations strictly required by app to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;

-- Clean up any existing policy names to make migration idempotent
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Create RLS Policies enforcing (select auth.uid()) ownership for authenticated users
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------
-- STEP 2: CREATE public.profiles TABLE LINKED TO auth.users(id)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  cgpa NUMERIC,
  daily_target NUMERIC DEFAULT 5,
  avatar_url TEXT,
  program TEXT DEFAULT 'Computer Science',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Explicit privilege restriction: Revoke default permissions first
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;

-- Grant operations strictly required by app to authenticated users
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- Clean up any existing policy names to make migration idempotent
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RLS Policies enforcing (select auth.uid()) ownership for authenticated users
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);


-- ---------------------------------------------------------------------
-- STEP 3: AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- Automatically creates a profile row whenever a new user signs up
-- Security best practice: SECURITY DEFINER with empty search_path
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, cgpa, daily_target, avatar_url, program)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULL,
    5,
    NULL,
    'Computer Science'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execute permissions on internal trigger function from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
