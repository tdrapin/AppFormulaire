-- ============================================================
-- Seed v2 : Utilisateurs de test (noms courts)
-- ============================================================
-- PRÉREQUIS : Exécuter d'abord supabase-roles-migration.sql
--             puis supabase-migrate-role-to-metadata.sql
--             puis supabase-drop-profiles-table.sql
-- ============================================================
--
-- Comptes de test :
--   a@test.com       / aaa    → rôle terrain
--   c@test.com       / ccc    → rôle concepteur
--   x@test.com       / xxx    → rôle admin
--
-- ============================================================

-- ─── Supprimer les anciens utilisateurs s'ils existent ───────
DELETE FROM auth.users WHERE email IN ('a@test.com', 'c@test.com', 'x@test.com');

-- ─── Fonction utilitaire pour créer un utilisateur + son profil ───
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'terrain'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Insérer directement dans auth.users (nécessite les droits superuser)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Création des 3 utilisateurs de test ──────────────────────

-- 1) Terrain
SELECT create_user_with_role('a@test.com', 'aaa', 'Alice', 'terrain');

-- 2) Concepteur
SELECT create_user_with_role('c@test.com', 'ccc', 'Bob', 'concepteur');

-- 3) Admin
SELECT create_user_with_role('x@test.com', 'xxx', 'Admin', 'admin');

-- ─── Nettoyage ────────────────────────────────────────────────
DROP FUNCTION IF EXISTS create_user_with_role;

-- Vérification
SELECT id, email, raw_user_meta_data->>'role' AS role, raw_user_meta_data->>'full_name' AS full_name
FROM auth.users
WHERE email IN ('a@test.com', 'c@test.com', 'x@test.com')
ORDER BY email;
