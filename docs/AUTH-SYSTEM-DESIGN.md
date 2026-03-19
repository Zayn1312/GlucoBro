# GlucoBro Auth System Design

## Terminal Tab: `GlucoBro:Auth`

---

## 1. Auth Flow Decision: OTP (not Magic Link)

### Why OTP wins for iOS PWA

| Factor | Magic Link | OTP (6-digit code) |
|--------|-----------|---------------------|
| iOS PWA homescreen | **BROKEN** — link opens Safari, not the PWA | **WORKS** — user stays in PWA, types code |
| PKCE flow constraint | Must open in same browser that requested it | No redirect needed |
| Gmail/Outlook prefetch | Can accidentally consume the link | Code is not a URL, immune |
| UX friction | Open email → click link → hope it works | Open email → type 6 digits → done |
| Offline resilience | Requires redirect back to app | Code entry works even on flaky connections |

**Decision: Email OTP via `signInWithOtp` + `verifyOtp`**

### Session Persistence

Supabase JS client stores sessions in `localStorage` by default (`persistSession: true`). This works perfectly for PWA standalone mode on iOS because:
- Each PWA gets its own localStorage scope
- Sessions survive app restarts
- `onAuthStateChange` handles token refresh automatically

---

## 2. Supabase Client Configuration

```javascript
// Load via CDN (no build step needed — matches current architecture)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://hvcuspxmswhlzkatfxst.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // existing key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,        // store in localStorage (default)
    autoRefreshToken: true,      // auto-refresh before expiry (default)
    detectSessionInUrl: false,   // no magic link redirects
    storage: window.localStorage // explicit for PWA clarity
  }
});
```

---

## 3. Auth Flow — Implementation

### 3a. Send OTP

```javascript
async function sendOTP(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true  // auto-create account on first login
    }
  });
  if (error) throw error;
  // Email sent — show code input UI
}
```

### 3b. Verify OTP

```javascript
async function verifyOTP(email, token) {
  const { data: { session, user }, error } = await supabase.auth.verifyOtp({
    email,
    token,      // 6-digit code from email
    type: 'email'
  });
  if (error) throw error;
  // session is now active, stored in localStorage
  // user.id is the UUID for RLS
  return { session, user };
}
```

### 3c. Session Lifecycle

```javascript
// On app start — check existing session
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // User is logged in — show app
    showApp(session.user);
    startSync();
  } else {
    // Show login screen
    showLoginScreen();
  }
}

// Listen for auth changes (token refresh, logout, etc.)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    showApp(session.user);
  }
  if (event === 'SIGNED_OUT') {
    showLoginScreen();
  }
});

// Logout
async function logout() {
  await supabase.auth.signOut();
  // onAuthStateChange handles UI
}
```

---

## 4. Onboarding UX

### Philosophy: Absolute Minimum at Signup, Progressive Enrichment Later

**At signup: collect NOTHING extra.** Just the email. The user is you — you already know your diabetes type. Every extra field at signup = friction = abandonment.

### Post-login profile (settings sheet, filled lazily):

| Field | Type | Default | Priority |
|-------|------|---------|----------|
| `display_name` | text | email prefix | Low |
| `diabetes_type` | enum | `null` (ask once, optional) | Low |
| `target_low` | integer | 70 | Medium |
| `target_high` | integer | 180 | Medium |
| `unit` | enum | `mg/dL` | Low (app already uses mg/dL) |
| `cgm_device` | text | `null` | Low (already have Libre integration) |

**What NOT to collect:**
- Insulin type/doses — not needed for a glucose tracker (add later if wanted)
- Emergency contact — this is a tracker, not a medical device
- Doctor info — overkill for personal use
- Weight target — already tracked per-entry

### Onboarding Flow (3 seconds):

```
[Login Screen]
  ┌─────────────────────────────┐
  │       GLUCOBRO              │
  │                             │
  │   ┌─────────────────────┐   │
  │   │ deine@email.de      │   │
  │   └─────────────────────┘   │
  │                             │
  │   [ Code senden ]           │
  │                             │
  └─────────────────────────────┘

          ↓ tap "Code senden"

[OTP Screen]
  ┌─────────────────────────────┐
  │   Code eingeben             │
  │                             │
  │   ┌──┬──┬──┬──┬──┬──┐      │
  │   │ 4│ 8│ 2│ 9│ 1│ 6│      │
  │   └──┴──┴──┴──┴──┴──┘      │
  │                             │
  │   [ Bestätigen ]            │
  │   Neuen Code senden         │
  └─────────────────────────────┘

          ↓ verified

[App — normal dashboard]
  (profile settings accessible via gear icon)
```

---

## 5. Data Model — Supabase SQL Migration

### Design Principles:
1. **`user_id` everywhere** — ties to `auth.uid()` for RLS
2. **Keep existing `entries` table structure** — just add `user_id` column
3. **`profiles` table** — auto-created on first login via trigger
4. **Timestamps** — `created_at` and `updated_at` on everything
5. **Soft delete** — `deleted_at` column instead of hard DELETE (for sync)

### Migration SQL

```sql
-- =====================================================
-- MIGRATION: GlucoBro Auth System
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- 1. PROFILES (auto-created on signup)
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

-- Auto-create profile on signup
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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. GLUCOSE READINGS (replaces current "entries" table)
-- Keep backward compatible with existing sync_id-based entries
CREATE TABLE IF NOT EXISTS glucose_readings (
  id BIGINT PRIMARY KEY,                    -- timestamp-based ID (matches current Date.now())
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 20 AND value <= 600),
  unit TEXT DEFAULT 'mg/dL',
  date DATE NOT NULL,
  time TIME NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'cgm', 'import')),
  trend_arrow TEXT,                         -- CGM trend: ↑↑, ↑, →, ↓, ↓↓
  meal TEXT DEFAULT '',
  meds TEXT DEFAULT '',
  sport TEXT DEFAULT '',
  mood TEXT DEFAULT '',
  weight DECIMAL(5,1),
  notes TEXT DEFAULT '',
  deleted_at TIMESTAMPTZ,                   -- soft delete
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_glucose_readings_user_date
  ON glucose_readings(user_id, date DESC);
CREATE INDEX idx_glucose_readings_user_created
  ON glucose_readings(user_id, created_at DESC);


-- 3. CGM CONNECTIONS (replaces cgm_credentials)
CREATE TABLE IF NOT EXISTS cgm_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'libre' CHECK (provider IN ('libre', 'dexcom', 'medtronic')),
  encrypted_email TEXT,                     -- encrypted with server-side key
  encrypted_password TEXT,                  -- encrypted with server-side key
  region TEXT DEFAULT 'EU',
  patient_id TEXT,
  last_sync_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);


-- 4. PUSH SUBSCRIPTIONS (upgrade existing table)
CREATE TABLE IF NOT EXISTS push_subscriptions_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_subs_user ON push_subscriptions_v2(user_id);


-- 5. SETTINGS (key-value for flexibility)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

-- Pre-defined setting keys:
-- 'notifications' → { "enabled": true, "times": ["07:00","09:00","14:00","20:00"] }
-- 'cgm'           → { "enabled": true, "pollInterval": 300 }
-- 'display'       → { "theme": "dark", "showMotivation": true }


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cgm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Glucose readings: full CRUD on own data
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

-- CGM connections: own data only
CREATE POLICY "Users can manage own CGM connections"
  ON cgm_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Push subscriptions: own data only
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions_v2 FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User settings: own data only
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
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
```

---

## 6. Migration Path — From sync_id to user_id

The current system uses a random 8-char `sync_id` to identify data. The new system uses `auth.uid()` (UUID). Migration strategy:

### Phase 1: Add Auth (this design)
- Add auth UI (login/OTP screens)
- New tables with `user_id` (RLS-protected)
- Supabase client replaces raw REST calls

### Phase 2: Data Migration (one-time)
- After first login, migrate existing `entries` (by sync_id) to `glucose_readings` (by user_id)
- Keep old tables alive for 30 days, then drop

```javascript
// One-time migration: run after first successful auth
async function migrateFromSyncId() {
  const syncId = localStorage.getItem('glucobro_sync_id');
  if (!syncId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Fetch old entries from old table
  const { data: oldEntries } = await supabase
    .from('entries')
    .select('*')
    .eq('sync_id', syncId);

  if (!oldEntries?.length) return;

  // Transform and insert into new table
  const newEntries = oldEntries.map(e => ({
    id: e.id,
    user_id: user.id,
    value: e.bz,
    date: e.date,
    time: e.time,
    meal: e.meal || '',
    meds: e.meds || '',
    sport: e.sport || '',
    mood: e.mood || '',
    weight: e.weight,
    source: e.mood === 'CGM' ? 'cgm' : 'manual'
  }));

  const { error } = await supabase
    .from('glucose_readings')
    .upsert(newEntries, { onConflict: 'id' });

  if (!error) {
    localStorage.removeItem('glucobro_sync_id');
    localStorage.setItem('glucobro_migrated', 'true');
    console.log(`Migrated ${newEntries.length} entries`);
  }
}
```

### Phase 3: Remove old sync system
- Remove sync_id generation code
- Remove manual Supabase URL/Key config UI
- Remove old `supaFetch()` function
- Remove old `entries` table

---

## 7. Sync Strategy — Offline-First

### Architecture

```
┌─────────────────────────────────────────┐
│  GlucoBro PWA                           │
│                                         │
│  ┌──────────┐    ┌────────────────────┐ │
│  │ UI Layer │───→│ DataService        │ │
│  └──────────┘    │                    │ │
│                  │  read(): IndexedDB  │ │
│                  │  write(): IDB first │ │
│                  │  then → Supabase    │ │
│                  │                    │ │
│                  │  syncQueue[]       │ │
│                  │  (pending changes) │ │
│                  └────────────────────┘ │
│                          │              │
│                          ▼              │
│                  ┌────────────────┐     │
│                  │  IndexedDB     │     │
│                  │  (source of    │     │
│                  │   truth while  │     │
│                  │   offline)     │     │
│                  └────────────────┘     │
│                          │              │
└──────────────────────────┼──────────────┘
                           │ online?
                           ▼
                  ┌────────────────┐
                  │  Supabase      │
                  │  (source of    │
                  │   truth while  │
                  │   online)      │
                  └────────────────┘
```

### Implementation

```javascript
// Lightweight IndexedDB wrapper
const DB_NAME = 'glucobro';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('readings')) {
        const store = db.createObjectStore('readings', { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('synced', '_synced');
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Write locally first, queue for sync
async function saveReading(reading) {
  const db = await openDB();

  // 1. Save to IndexedDB immediately
  const tx = db.transaction(['readings', 'syncQueue'], 'readwrite');
  tx.objectStore('readings').put({ ...reading, _synced: false });
  tx.objectStore('syncQueue').add({
    action: 'upsert',
    table: 'glucose_readings',
    data: reading,
    timestamp: Date.now()
  });
  await tx.complete;

  // 2. Try to sync immediately if online
  if (navigator.onLine) {
    await processQueue();
  }
}

// Process sync queue
async function processQueue() {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readonly');
  const items = await tx.objectStore('syncQueue').getAll();

  for (const item of items) {
    try {
      if (item.action === 'upsert') {
        await supabase.from(item.table).upsert(item.data);
      } else if (item.action === 'delete') {
        await supabase.from(item.table).delete().eq('id', item.data.id);
      }
      // Remove from queue on success
      const delTx = db.transaction('syncQueue', 'readwrite');
      delTx.objectStore('syncQueue').delete(item.id);
    } catch (err) {
      console.warn('Sync failed, will retry:', err);
      break; // Stop processing — try again later
    }
  }
}

// Sync on reconnect
window.addEventListener('online', processQueue);

// Full pull from server (on login, on manual sync)
async function fullSync() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: remote } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (!remote) return;

  const db = await openDB();
  const tx = db.transaction('readings', 'readwrite');
  for (const reading of remote) {
    tx.objectStore('readings').put({ ...reading, _synced: true });
  }
}
```

### Conflict Resolution: Last-Write-Wins

For a single-user tool, conflict resolution is simple:
- `updated_at` timestamp on every row
- On sync, compare timestamps
- Most recent write wins
- This is sufficient because there's only one user — conflicts only arise from the same person on two devices, and the latest edit is always the intended one

---

## 8. Privacy & Security

### Sensitivity Classification

| Data | Sensitivity | Protection |
|------|-------------|------------|
| Email | Medium | Supabase Auth (hashed) |
| Glucose readings | **High** (medical) | RLS + user_id |
| CGM credentials | **Critical** | Server-side encryption |
| Push subscription | Low | RLS |
| Profile/settings | Low | RLS |

### CGM Credential Encryption

Currently, CGM credentials are stored in plaintext in Supabase. This must change.

```sql
-- Use pgcrypto for server-side encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt function (called from API, not client)
-- The encryption key is stored as a Supabase secret (env var)
-- NEVER expose this key to the client
```

```javascript
// API endpoint (Vercel serverless) handles encryption
// api/cgm-credentials.js
const ENCRYPTION_KEY = process.env.CGM_ENCRYPTION_KEY; // 32-byte hex

export default async function handler(req, res) {
  // ... auth check via Supabase service role key ...

  // Encrypt before storing
  const { email, password, userId } = req.body;

  // Use Supabase service role to insert encrypted data
  const { error } = await supabaseAdmin
    .from('cgm_connections')
    .upsert({
      user_id: userId,
      provider: 'libre',
      encrypted_email: encrypt(email, ENCRYPTION_KEY),
      encrypted_password: encrypt(password, ENCRYPTION_KEY),
    });

  // ... response ...
}
```

### RLS Summary

Every table has RLS enabled with policies that check `auth.uid() = user_id`. This means:
- The anon key can only access data belonging to the logged-in user
- Even if someone gets the anon key, they cannot access another user's data
- No more `sync_id` as a security boundary (which was guessable)

### GDPR Basics

1. **Data export**: Already have CSV export — extend to include all tables
2. **Data deletion**: Add "Delete my account" button that cascades via `ON DELETE CASCADE`
3. **Data portability**: CSV/JSON export covers this
4. **Consent**: OTP login = implicit consent for data processing
5. **Data location**: Supabase project is in EU (check dashboard)

---

## 9. Supabase Email Template Configuration

Go to Supabase Dashboard → Authentication → Email Templates → Magic Link/OTP:

### OTP Email Template (set in Supabase Dashboard)

**Subject:** `Dein GlucoBro Code: {{ .Token }}`

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #e8e8f0;">
  <div style="text-align: center; margin-bottom: 32px;">
    <span style="font-family: 'Courier New', monospace; font-weight: 900; font-size: 24px; color: #00FF88; text-shadow: 0 0 20px rgba(0,255,136,.4);">GLUCOBRO</span>
  </div>
  <p style="font-size: 14px; color: #8888a0; text-align: center; margin-bottom: 24px;">
    Dein Anmeldecode:
  </p>
  <div style="text-align: center; padding: 20px; background: #12121a; border: 1px solid #2a2a3a; border-radius: 12px; margin-bottom: 24px;">
    <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; color: #00FF88; letter-spacing: 8px; text-shadow: 0 0 15px rgba(0,255,136,.4);">{{ .Token }}</span>
  </div>
  <p style="font-size: 12px; color: #555570; text-align: center;">
    Code ist 60 Minuten gültig. Nicht du? Ignoriere diese Mail.
  </p>
</div>
```

**Important**: In Supabase Dashboard → Authentication → Providers → Email, make sure to:
- Enable "Email OTP" (should be default)
- In the email template, use `{{ .Token }}` (NOT `{{ .ConfirmationURL }}`)
- Set OTP expiry to 3600 seconds (60 min)

---

## 10. Implementation Checklist

### Step 1: Supabase Setup
- [ ] Run SQL migration in Supabase Dashboard
- [ ] Configure email template for OTP
- [ ] Set OTP length to 6 digits
- [ ] Set OTP expiry to 3600s
- [ ] Enable RLS on all tables
- [ ] Add `CGM_ENCRYPTION_KEY` to Vercel env vars

### Step 2: Frontend Auth UI
- [ ] Add Supabase JS v2 CDN script tag
- [ ] Create login overlay (email input + OTP input)
- [ ] Wire up `signInWithOtp` / `verifyOtp`
- [ ] Add `initAuth()` on app load
- [ ] Add logout button to settings
- [ ] Style login UI to match sci-fi theme

### Step 3: Data Layer Migration
- [ ] Replace `supaFetch()` with Supabase client calls
- [ ] Add `user_id` to all data operations
- [ ] Implement `migrateFromSyncId()` for existing data
- [ ] Remove sync_id UI from settings
- [ ] Replace old `entries` table queries with `glucose_readings`

### Step 4: Offline Support
- [ ] Add IndexedDB wrapper
- [ ] Implement sync queue
- [ ] Add online/offline event listeners
- [ ] Test offline entry creation + sync on reconnect

### Step 5: API Updates
- [ ] Update `api/cron.js` to use service role key + new tables
- [ ] Update `api/push.js` to use user_id instead of sync_id
- [ ] Add `api/cgm-credentials.js` with encryption
- [ ] Remove old `api/libre.js` credential handling (move to encrypted storage)

### Step 6: Cleanup
- [ ] Remove sync_id generation code
- [ ] Remove manual Supabase URL/Key config from settings
- [ ] Drop old `entries` table (after migration period)
- [ ] Drop old `cgm_credentials` table
- [ ] Drop old `push_subscriptions` table

---

## 11. File Changes Summary

| File | Change |
|------|--------|
| `GlucoBro.html` | Add Supabase JS CDN, login UI, replace sync system |
| `sw.js` | Cache Supabase CDN script |
| `api/cron.js` | Use service role key, new table names |
| `api/push.js` | Use user_id instead of sync_id |
| `api/cgm-credentials.js` | **NEW** — encrypted credential storage |
| `manifest.json` | No change needed |
| `vercel.json` | No change needed |

---

## 12. What This Removes

The entire "Cloud Sync" settings section (Supabase URL input, Anon Key input, Sync Code) goes away. Instead:

**Before (manual):**
1. Toggle Cloud Sync on
2. Enter Supabase URL
3. Enter Anon Key
4. Generate sync code
5. Enter sync code on other device
6. Click "Jetzt synchronisieren"

**After (automatic):**
1. Enter email
2. Enter 6-digit code
3. Done — everything syncs automatically

---

## Sources

- [Supabase Discussion: Auth on iOS Homescreen PWA](https://github.com/orgs/supabase/discussions/12227) — confirms magic links break on iOS PWA, recommends OTP
- [Supabase Docs: Passwordless Email Logins](https://supabase.com/docs/guides/auth/auth-email-passwordless) — official OTP guide
- [Supabase Docs: signInWithOtp](https://supabase.com/docs/reference/javascript/auth-signinwithotp) — JavaScript client reference
- [Supabase Docs: User Sessions](https://supabase.com/docs/guides/auth/sessions) — session persistence in localStorage
- [Supabase Docs: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns
- [Supabase Docs: onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) — auth event listener
