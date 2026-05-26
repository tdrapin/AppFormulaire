-- ============================================================
-- Base de données — AppFormulaire
-- Supabase PostgreSQL
-- ============================================================

-- 1. Tables principales
-- ============================================================

-- Table : formulaires
-- Stocke la définition des formulaires (titre, sections, champs, gabarits)
CREATE TABLE IF NOT EXISTS public.formulaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    gabarit_actif_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : instances
-- Stocke les données saisies pour un formulaire
CREATE TABLE IF NOT EXISTS public.instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulaire_id UUID NOT NULL REFERENCES public.formulaires(id) ON DELETE CASCADE,
    donnees_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    nom TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index
-- ============================================================

-- Accélérer les recherches par formulaire
CREATE INDEX IF NOT EXISTS idx_instances_formulaire_id ON public.instances(formulaire_id);

-- Accélérer les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_instances_user_id ON public.instances(user_id);
CREATE INDEX IF NOT EXISTS idx_formulaires_user_id ON public.formulaires(user_id);

-- Index GIN pour les recherches dans les JSONB
CREATE INDEX IF NOT EXISTS idx_formulaires_schema_json ON public.formulaires USING GIN(schema_json);
CREATE INDEX IF NOT EXISTS idx_instances_donnees_json ON public.instances USING GIN(donnees_json);

-- Index sur le nom horodaté des instances
CREATE INDEX IF NOT EXISTS idx_instances_nom ON public.instances(nom);

-- 3. Fonctions et triggers
-- ============================================================

-- Trigger : mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur formulaires
DROP TRIGGER IF EXISTS trigger_formulaires_updated_at ON public.formulaires;
CREATE TRIGGER trigger_formulaires_updated_at
    BEFORE UPDATE ON public.formulaires
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Appliquer le trigger sur instances
DROP TRIGGER IF EXISTS trigger_instances_updated_at ON public.instances;
CREATE TRIGGER trigger_instances_updated_at
    BEFORE UPDATE ON public.instances
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger : versionnement automatique des formulaires
CREATE OR REPLACE FUNCTION public.increment_form_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_formulaires_version ON public.formulaires;
CREATE TRIGGER trigger_formulaires_version
    BEFORE UPDATE ON public.formulaires
    FOR EACH ROW
    WHEN (OLD.schema_json IS DISTINCT FROM NEW.schema_json)
    EXECUTE FUNCTION public.increment_form_version();

-- 4. Row Level Security (RLS)
-- ============================================================

-- Activer RLS sur les tables
ALTER TABLE public.formulaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instances ENABLE ROW LEVEL SECURITY;

-- Policies pour formulaires
-- Les utilisateurs peuvent voir tous les formulaires (nécessaire pour le terrain)
CREATE POLICY "Tout le monde peut voir les formulaires"
    ON public.formulaires
    FOR SELECT
    USING (true);

-- Seuls les concepteurs et admins peuvent créer/modifier/supprimer des formulaires
CREATE POLICY "Concepteurs et admins peuvent créer des formulaires"
    ON public.formulaires
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"concepteur"%'
        OR auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"admin"%'
    );

CREATE POLICY "Concepteurs et admins peuvent modifier des formulaires"
    ON public.formulaires
    FOR UPDATE
    USING (
        auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"concepteur"%'
        OR auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"admin"%'
    );

CREATE POLICY "Concepteurs et admins peuvent supprimer des formulaires"
    ON public.formulaires
    FOR DELETE
    USING (
        auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"concepteur"%'
        OR auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"admin"%'
    );

-- Policies pour instances
-- Les utilisateurs peuvent voir leurs propres instances
CREATE POLICY "Utilisateurs voient leurs instances"
    ON public.instances
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"concepteur"%'
        OR auth.jwt() ->> 'user_metadata'::text LIKE '%"role":"admin"%'
    );

-- Les utilisateurs peuvent créer leurs propres instances
CREATE POLICY "Utilisateurs peuvent créer des instances"
    ON public.instances
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres instances
CREATE POLICY "Utilisateurs peuvent modifier leurs instances"
    ON public.instances
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres instances
CREATE POLICY "Utilisateurs peuvent supprimer leurs instances"
    ON public.instances
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- Fin du script
-- ============================================================
