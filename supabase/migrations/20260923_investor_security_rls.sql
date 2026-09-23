-- ==============================================================================
-- DISPOSITIF DE SÉCURITÉ, ROW LEVEL SECURITY (RLS) ET AUDIT LOG RGPD
-- ENR COURTAGE — Espace Investisseurs M&A
-- ==============================================================================

-- 1. Table des Profils Investisseurs
CREATE TABLE IF NOT EXISTS public.investor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    legal_form TEXT,
    head_office TEXT,
    rcs_number TEXT,
    rcs_city TEXT,
    role TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    nda_signed_at TIMESTAMPTZ,
    nda_signed_by_admin BOOLEAN DEFAULT FALSE,
    admin_signed_at TIMESTAMPTZ,
    nda_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation RLS Profils
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS Profils
DROP POLICY IF EXISTS "Profil consultable par l'investisseur ou l'administrateur" ON public.investor_profiles;
CREATE POLICY "Profil consultable par l'investisseur ou l'administrateur"
    ON public.investor_profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = auth_user_id 
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

DROP POLICY IF EXISTS "Profil modifiable uniquement par son titulaire ou l'administrateur" ON public.investor_profiles;
CREATE POLICY "Profil modifiable uniquement par son titulaire ou l'administrateur"
    ON public.investor_profiles
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = auth_user_id 
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    )
    WITH CHECK (
        auth.uid() = auth_user_id 
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

-- 2. Table des Offres Indicatives M&A (InvestorOffer)
CREATE TABLE IF NOT EXISTS public.investor_offers (
    id TEXT PRIMARY KEY,
    investor_id UUID REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    investor_name TEXT NOT NULL,
    investor_company TEXT NOT NULL,
    investor_email TEXT NOT NULL,
    investor_phone TEXT,
    portfolio_id TEXT NOT NULL,
    portfolio_name TEXT NOT NULL,
    offer_type TEXT NOT NULL CHECK (offer_type IN ('total', 'partial')),
    selected_site_ids JSONB DEFAULT '[]'::jsonb,
    selected_sites_count INT DEFAULT 0,
    amount_eur NUMERIC NOT NULL,
    valuation_per_mw TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    upfront_percent INT DEFAULT 30,
    earnout_percent INT DEFAULT 70,
    comments TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlist', 'exclusive', 'accepted', 'rejected')),
    admin_notes TEXT,
    mandate JSONB,
    counter_proposal JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation RLS Offres
ALTER TABLE public.investor_offers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS Offres : L'investisseur n'accède qu'à ses propres offres
DROP POLICY IF EXISTS "Offres visibles uniquement par leur auteur ou l'administrateur" ON public.investor_offers;
CREATE POLICY "Offres visibles uniquement par leur auteur ou l'administrateur"
    ON public.investor_offers
    FOR SELECT
    TO authenticated
    USING (
        investor_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

DROP POLICY IF EXISTS "Dépôt d'offre par l'investisseur authentifié sous NDA" ON public.investor_offers;
CREATE POLICY "Dépôt d'offre par l'investisseur authentifié sous NDA"
    ON public.investor_offers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        investor_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

DROP POLICY IF EXISTS "Mise à jour d'offre restreinte" ON public.investor_offers;
CREATE POLICY "Mise à jour d'offre restreinte"
    ON public.investor_offers
    FOR UPDATE
    TO authenticated
    USING (
        investor_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

-- 3. Table des Messages M&A (MnaMessage)
CREATE TABLE IF NOT EXISTS public.mna_messages (
    id TEXT PRIMARY KEY,
    investor_email TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_company TEXT,
    from_role TEXT NOT NULL CHECK (from_role IN ('investor', 'admin')),
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation RLS Messages
ALTER TABLE public.mna_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Échanges réservés à l'investisseur et à ENR COURTAGE" ON public.mna_messages;
CREATE POLICY "Échanges réservés à l'investisseur et à ENR COURTAGE"
    ON public.mna_messages
    FOR ALL
    TO authenticated
    USING (
        investor_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    )
    WITH CHECK (
        investor_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

-- 4. Table d'Audit Log de Sécurité (SecurityAuditLog)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('LOG-' || floor(extract(epoch from now())) || '-' || substr(md5(random()::text), 1, 6)),
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('LOGIN', 'LOGOUT', 'TIMEOUT_LOGOUT', 'NDA_VIEW', 'PROJECT_VIEW', 'DATAROOM_VIEW', 'DATAROOM_DOWNLOAD', 'OFFER_SUBMIT', 'PROJECT_STATUS_CHANGE', 'PROJECT_DELETE', 'SYSTEM_START')),
    target_resource TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation RLS Audit Logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS Audit Logs : Tout utilisateur peut insérer, seul l'admin peut consulter
DROP POLICY IF EXISTS "Seul l'administrateur peut consulter le registre d'audit" ON public.security_audit_logs;
CREATE POLICY "Seul l'administrateur peut consulter le registre d'audit"
    ON public.security_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') = 'y.barberis@enr-courtage.fr'
    );

DROP POLICY IF EXISTS "Enregistrement des logs système et utilisateurs" ON public.security_audit_logs;
CREATE POLICY "Enregistrement des logs système et utilisateurs"
    ON public.security_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Index d'optimisation
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_email ON public.security_audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_offers_investor ON public.investor_offers(investor_email);
