/**
 * Consentement explicite au traitement des données de santé (RGPD art. 9.2.a).
 * `version` est la source de vérité : toute modification du `texte` impose
 * d'incrémenter `version` (la version consentie est tracée en base).
 */
export const CONSENT_SANTE = {
  version: '2026-06',
  texte:
    "Je consens expressément (RGPD art. 9.2.a) au traitement de mes données de santé " +
    "(questionnaire de santé, certificat médical) par l'association, dans le seul but du " +
    "suivi de mon dossier d'adhésion. Ces données sont conservées 1 an puis supprimées.",
} as const;
