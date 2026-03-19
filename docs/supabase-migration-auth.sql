-- =====================================================
-- GlucoBro Auth System — Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor
-- Date: 2026-03-20
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. PROFILES — auto-created on user signup
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  diabetes_type TEXT CHECK (diabetes_type IN ('T1', 'T2', 'LADA', 'gestational', 'other', NULL)),
  target_low INTEGER DEFAULT 70,
  target_high INTEGER DEFAULT 180,
  unit TEXT DEFAULT 'mg/dL' CHECK (unit IN ('mg/dL', 'mmol/L')),
  cgm_device TEXT,
  timezone TEXT DEFAULT 'Europe/Berlin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- 2. GLUCOSE READINGS — main data table
-- =====================================================
CREATE TABLE IF NOT EXISTS glucose_readings (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 20 AND value <= 600),
  unit TEXT DEFAULT 'mg/dL',
  date DATE NOT NULL,
  time TIME NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'cgm', 'import')),
  trend_arrow TEXT,
  meal TEXT DEFAULT '',
  meds TEXT DEFAULT '',
  sport TEXT DEFAULT '',
  mood TEXT DEFAULT '',
  weight DECIMAL(5,1),
  notes TEXT DEFAULT '',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_date
  ON glucose_readings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_created
  ON glucose_readings(user_id, created_at DESC);


-- =====================================================
-- 3. CGM CONNECTIONS — encrypted credentials
-- =====================================================
CREATE TABLE IF NOT EXISTS cgm_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'libre' CHECK (provider IN ('libre', 'dexcom', 'medtronic')),
  encrypted_email TEXT,
  encrypted_password TEXT,
  region TEXT DEFAULT 'EU',
  patient_id TEXT,
  last_sync_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);


-- =====================================================
-- 4. PUSH SUBSCRIPTIONS v2 — tied to user_id
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions_v2(user_id);


-- =====================================================
-- 5. USER SETTINGS — key-value store
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, key)
);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cgm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Glucose readings (full CRUD)
CREATE POLICY "Users can view own readings"
  ON glucose_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings"
  ON glucose_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings"
  ON glucose_readings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings"
  ON glucose_readings FOR DELETE
  USING (auth.uid() = user_id);

-- CGM connections
CREATE POLICY "Users can manage own CGM connections"
  ON cgm_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Push subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions_v2 FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_glucose_readings_updated_at
  BEFORE UPDATE ON glucose_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cgm_connections_updated_at
  BEFORE UPDATE ON cgm_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =====================================================
-- VERIFICATION: check all tables exist with RLS
-- =====================================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN (
  'profiles',
  'glucose_readings',
  'cgm_connections',
  'push_subscriptions_v2',
  'user_settings'
)
ORDER BY tablename;
