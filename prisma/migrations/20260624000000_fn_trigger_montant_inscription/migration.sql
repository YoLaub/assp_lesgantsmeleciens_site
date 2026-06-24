-- ============================================================================
-- Composants serveur PL/pgSQL : calcul automatique du montant d'inscription
-- ----------------------------------------------------------------------------
-- 1) Fonction calcul_montant_inscription : regle metier tarifaire centralisee
-- 2) Trigger trg_montant_inscription : garantit le montantSnapshot en BDD
--    (coherence meme si l'ecriture ne passe pas par l'application)
-- Idempotent : CREATE OR REPLACE + DROP TRIGGER IF EXISTS.
-- ============================================================================

-- ─── 1. Fonction de calcul du montant ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calcul_montant_inscription(
    p_categorie public."Categorie",
    p_oxygene   boolean,
    p_coupon    public."StatutDocument",
    p_saison    varchar
)
RETURNS numeric(8,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_config  public."ConfigTarifs"%ROWTYPE;
    v_montant numeric(8,2);
BEGIN
    -- Tarifs de la saison demandee (la plus recente si plusieurs lignes)
    SELECT *
      INTO v_config
      FROM public."ConfigTarifs"
     WHERE saison = p_saison
     ORDER BY "modifieLe" DESC, id DESC
     LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Aucune configuration de tarifs (ConfigTarifs) pour la saison "%"', p_saison
            USING ERRCODE = 'no_data_found';
    END IF;

    -- Tarif de base selon la categorie
    v_montant := CASE p_categorie
        WHEN 'enfant' THEN v_config."tarifEnfant"
        WHEN 'ados'   THEN v_config."tarifAdos"
        WHEN 'adulte' THEN v_config."tarifAdulte"
    END;

    IF v_montant IS NULL THEN
        RAISE EXCEPTION
            'Categorie "%" non tarifee pour la saison "%"', p_categorie, p_saison
            USING ERRCODE = 'data_exception';
    END IF;

    -- Supplement oxygene
    IF p_oxygene THEN
        v_montant := v_montant + v_config."supplementOxygene";
    END IF;

    -- Deduction coupon sport (uniquement si valide)
    IF p_coupon = 'valide' THEN
        v_montant := v_montant - v_config."deductionCouponSport";
    END IF;

    -- Plancher a 0 (jamais de montant negatif)
    RETURN GREATEST(v_montant, 0);
END;
$$;

-- ─── 2. Fonction trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_set_montant_inscription()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- On ne calcule que si la categorie est connue
    IF NEW.categorie IS NOT NULL THEN
        NEW."montantSnapshot" := public.calcul_montant_inscription(
            NEW.categorie,
            NEW.oxygene,
            NEW."couponSport",
            NEW.saison
        );
    END IF;
    RETURN NEW;
END;
$$;

-- ─── 3. Branchement du trigger ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_montant_inscription ON public."Inscription";

CREATE TRIGGER trg_montant_inscription
    BEFORE INSERT OR UPDATE ON public."Inscription"
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_set_montant_inscription();
