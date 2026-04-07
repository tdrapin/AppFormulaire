# Journal de stage — Xtralog — Plateforme de formulaires

- **Stagiaire** : (à compléter)
- **Entreprise** : Xtralog (clients industriels anonymes)
- **Date de début** : 2026-04-07
- **Sujet** : Développement collaboratif d’une plateforme **VueJS / Supabase / JSON** pour créer et gérer des formulaires techniques (en-têtes, pieds de page, champs typés), avec **saisie mobile/desktop**, **offline**, **exploitation des données** et **export PDF**.

---

## 0) Comment on travaille ensemble (rituel)

- Quand tu veux, tu colles ici tes notes brutes (même 5 lignes).
- Je reformule en version “mémoire-ready” : objectifs, décisions, risques, résultats, prochaines actions.
- Chaque fin de semaine idéalement :
  - **Fait** (ce qui est terminé)
  - **Blocages**
  - **Décisions**
  - **À faire semaine suivante**

---

## 1) Contexte & problématique (résumé mémoire)

Les clients disposent souvent de **formulaires papier** (contrôles, checklists, relevés) remplis **quotidiennement / hebdomadairement**. L’application existante ne permettrait que de remonter un statut “fait/pas fait”.

Objectif : proposer une plateforme permettant de :
- **Concevoir** des formulaires (en-tête, pied de page, champs typés) de manière intuitive
- **Réutiliser** un formulaire comme template (clonage/versioning)
- **Saisir sur mobile** (terrain) et sur desktop
- **Fonctionner offline** (au moins pour la saisie) puis synchroniser
- **Exploiter les données** (requêtes, filtres, historiques)
- **Exporter** (PDF simple en V1)

Contraintes clés :
- **Multi-entreprises (multi-tenant)** : données isolées par entreprise
- **JSON** pour la structure (flexibilité)

---

## 2) Décisions actuelles (au 2026-04-07)

- **Cibles** : desktop + mobile
- **Multi-tenant** : oui
- **Offline** : oui
- **Champs V1** : “un maximum” (=> approche extensible + priorisation)
- **PDF** : export simple accepté en V1

Choix technique à confirmer (proposé) :
- Mobile offline : **PWA** ou **Capacitor**. (Tendance : Capacitor si photos / stockage / offline robuste)

---

## 3) Roadmap (MVP) proposée

### MVP-1 — “Template + Saisie + Sync + Export simple”
Objectif : prouver la chaîne complète.
- Auth + appartenance à une entreprise (tenant)
- CRUD **form_templates** (JSON)
- “Runner” : remplir un template → créer une **submission** (réponses)
- Offline : création de submissions offline + sync quand réseau revient
- Export PDF simple (1 submission → PDF)

### MVP-2 — “Builder plus riche + exploitation”
- Sections / groupes, champs avancés
- Logique conditionnelle (afficher/masquer)
- Pièces jointes (photos) + Supabase Storage
- Recherche, filtres, exports (CSV/PDF)

### MVP-3 — “Industrialisation + Delphi”
- Clarifier le rôle exact de Delphi (consommation API, app dédiée, desktop interne…)
- Stabiliser le modèle JSON (versioning + migration)
- Renforcer tests + monitoring

---

## 4) Sourcing / Benchmark (à faire)

### Objectif du benchmark
Trouver des briques VueJS pour :
- **Rendre** un formulaire depuis un modèle (JSON / schema)
- **Éditer** un formulaire (form builder) de manière intuitive
- Gérer validations, conditions, sections

### Critères (checklist)
- Mobile-first (UX tactile)
- Performance sur gros formulaires
- Extensibilité : champs custom, règles custom
- Stockage du modèle : JSON stable, versionné
- Conditions (if/then), répétitions
- Internationalisation
- Accessibilité
- Licence / maturité / maintenance

### Candidats typiques à évaluer (exemples)
- Approche “JSON Schema” (renderers) : **JSON Forms**, **FormKit**, etc.
- Approche “builder maison” : composants Vue + modèle JSON interne

Décision attendue :
- Soit adopter une lib de rendu + écrire un builder
- Soit adopter un builder existant (souvent plus rare)

---

## 5) Proposition de modèle JSON V1 (extensible)

### Principes
- Versionner : `schemaVersion` + `form.version`
- Séparer : meta / layout (header/footer) / fields
- Réponses : stockées séparément (submission)

### Exemple (V1)

```json
{
  "schemaVersion": 1,
  "form": {
    "id": "veh_daily_v1",
    "name": "Contrôle véhicule — quotidien",
    "code": "VEH_DAILY",
    "version": 1,
    "tags": ["vehicule", "quotidien"]
  },
  "layout": {
    "header": {
      "title": "Contrôle véhicule",
      "subtitle": "Vérifications avant départ",
      "showDate": true
    },
    "footer": {
      "text": "En cas d’anomalie, prévenir le responsable.",
      "showSignature": false
    }
  },
  "fields": [
    {
      "id": "control_date",
      "type": "date",
      "label": "Date du contrôle",
      "required": true
    },
    {
      "id": "vehicle_id",
      "type": "text",
      "label": "Identifiant véhicule",
      "required": true
    },
    {
      "id": "ct_valid",
      "type": "boolean",
      "label": "Contrôle technique valide",
      "required": true
    },
    {
      "id": "ct_expiry",
      "type": "date",
      "label": "Date d’expiration CT",
      "required": false,
      "visibleWhen": {
        "fieldId": "ct_valid",
        "equals": true
      }
    },
    {
      "id": "notes",
      "type": "multiline",
      "label": "Remarques",
      "required": false
    }
  ]
}
```

Notes :
- `visibleWhen` est optionnel (V1 simple). On peut évoluer vers une logique plus riche (V2).
- Les types V1 minimum : `text`, `multiline`, `number`, `date`, `boolean`, `select`, `multiselect`.

---

## 6) Schéma Supabase (Postgres) — V1 proposé

### Objectif
Supporter : multi-tenant + templates JSON + submissions (réponses) + offline/sync.

### Tables minimales (proposition)
- `tenants` : entreprises
  - `id` (uuid), `name`, `created_at`
- `tenant_users` : appartenance + rôle
  - `tenant_id`, `user_id`, `role` (admin/editor/viewer)
- `form_templates`
  - `id`, `tenant_id`, `name`, `code`, `version`, `schema_version`, `definition_json` (jsonb), `is_archived`, `created_at`, `updated_at`
- `form_submissions`
  - `id`, `tenant_id`, `template_id`, `template_version`, `answers_json` (jsonb),
  - `status` (draft/submitted/synced), `created_by`, `created_at`, `updated_at`,
  - `client_generated_id` (pour offline), `synced_at` (nullable)

### RLS (Row Level Security) — principes
- Un utilisateur ne peut lire/écrire que les lignes du/des tenant(s) auxquels il appartient.
- `tenant_users` est la table pivot utilisée dans les policies.

### Offline / Sync (stratégie simple)
- Le client génère `client_generated_id` + timestamps.
- À la sync : upsert basé sur `client_generated_id`.
- Conflits V1 : stratégie “last write wins” (à documenter).

---

## 7) Export PDF — V1 (simple)

Objectif V1 : générer un PDF lisible contenant :
- meta (nom formulaire, date, utilisateur)
- liste des champs + valeurs

Évolutions V2 : mise en page proche papier, pagination, logos, tableaux.

---

## 8) Questions ouvertes (à trancher bientôt)

1. **Delphi** : rôle précis (app existante ? desktop interne ?)
2. **Mobile** : PWA vs Capacitor (besoin photo/signature ?)
3. **Offline** : niveau requis (lecture offline des templates ? édition offline ?)
4. **Sécurité** : auth (email/password ? SSO ?)
5. **RGPD / données sensibles** : types de données, durée de conservation

---

## 9) Semaine W15 (2026-04-07 → 2026-04-12)

### Fait
- Démarrage du cadrage (objectifs, contraintes)
- Décisions V1 : multi-tenant, offline, export PDF simple

### À faire
- Lancer le benchmark des libs/form-renderers Vue
- Écrire V1 du schéma Supabase + policies RLS
- Démarrer un prototype minimal (rendu d’un template JSON + sauvegarde d’une submission)

### Blocages
- (à compléter)
