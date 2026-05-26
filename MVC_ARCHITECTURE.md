# Architecture du projet — `src/` (à jour)

## Contexte

L'application est une **SPA Vue 3** (Composition API) avec **Vue Router**. Elle propose **deux parcours distincts** avec **authentification par rôle** :
- **Parcours Terrain** (`/mobile`) : saisie de données, historique, export PDF — accessible aux rôles `terrain`, `concepteur`, `admin`
- **Parcours Concepteur** (`/designer`) : création de formulaires, gestion des versions et des gabarits — accessible aux rôles `concepteur` et `admin`
- **Parcours Admin** : gestion des comptes utilisateurs — accessible au rôle `admin` uniquement

Les données sont stockées dans **Supabase** via `SupabaseDataService`. L'authentification utilise **Supabase Auth** avec une table `profiles` contenant le rôle de chaque utilisateur.

---

## Arborescence actuelle

```
src/
├── App.vue
├── main.js
├── assets/
│   └── vue.svg
├── components/
│   └── AppBottomTabs.vue
├── composables/
│   ├── useAuth.js                  ← Authentification et rôle utilisateur
│   ├── useMobileFormDemo.js        ← obsolète (conservé pour compatibilité)
│   └── usePdfExport.js
├── layouts/
│   └── MobileAppLayout.vue
├── lib/
│   ├── supabaseClient.js
│   ├── renderMobileReportPdfHtml.js
│   ├── models/
│   │   ├── Form.js
│   │   ├── FormField.js
│   │   └── FormResponse.js
│   ├── services/
│   │   ├── FormService.js
│   │   ├── ResponseService.js
│   │   └── SupabaseDataService.js
│   └── utils/
│       ├── dateHelper.js
│       └── validators.js
├── pages/
│   ├── Admin.vue
│   ├── Builder.vue
│   ├── Home.vue
│   ├── Hub.vue
│   ├── NotFound.vue
│   ├── Runner.vue
│   ├── TestLab.vue
│   ├── admin/                     ← Parcours Admin
│   │   └── AccountManagement.vue  ← Gestion des comptes utilisateurs
│   ├── auth/                      ← Authentification
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── ForgotPassword.vue
│   ├── mobile/                    ← Parcours Terrain
│   │   ├── MobileBatchDetail.vue  ← Export groupé PDF
│   │   ├── MobileFormBuilder.vue  ← obsolète (remplacé par DesignerFormBuilder)
│   │   ├── MobileFormList.vue
│   │   ├── MobileReportDetail.vue
│   │   ├── MobileReportFill.vue
│   │   ├── MobileReportHistory.vue
│   │   └── MobileReportSummary.vue
│   ├── designer/                  ← Parcours Concepteur
│   │   ├── DesignerFormList.vue
│   │   ├── DesignerFormBuilder.vue
│   │   ├── DesignerTemplates.vue
│   │   └── DesignerVersions.vue
│   └── tools/                     ← Outils communs
│       ├── ToolsHome.vue          ← Profil, menu, déconnexion
│       └── ToolsSettings.vue      ← Paramètres d'export
├── router/
│   └── index.js
└── styles/
    ├── app-shell.css
    ├── main.css
    ├── mobile-ui.css
    └── pages/
        ├── Admin.css
        ├── Builder.css
        ├── Home.css
        ├── NotFound.css
        ├── Runner.css
        └── TestLab.css
```

---

## Descriptif par fichier

### Racine `src/`

| Fichier | Description |
|--------|-------------|
| **`App.vue`** | Composant racine : coque visuelle (`app-shell`), zone `<router-view />`, affichage conditionnel de la barre d'onglets basse selon `route.meta.hideBottomNav`. |
| **`main.js`** | Point d'entrée : crée l'app Vue, enregistre le router, importe les feuilles de style globales. |

### `src/components/`

| Fichier | Description |
|--------|-------------|
| **`AppBottomTabs.vue`** | Barre de navigation principale (onglets bas) : Accueil, Formulaires, Historique, Outils. |

### `src/composables/`

| Fichier | Description |
|--------|-------------|
| **`useAuth.js`** | Authentification utilisateur : état réactif (`user`, `session`, `userRole`, `isTerrain`, `isConcepteur`, `isAdmin`, `userFullName`, `userEmail`), fonctions `login`, `register`, `logout`, `fetchProfile`. |
| **`useMobileFormDemo.js`** | Ancien état partagé pour le parcours démo (obsolète, conservé pour compatibilité). |
| **`usePdfExport.js`** | Fonctions d'export PDF via `html2pdf.js` : `exportHtmlElementToPdf`, `buildPdfFilename`. |

### `src/layouts/`

| Fichier | Description |
|--------|-------------|
| **`MobileAppLayout.vue`** | Layout parent des routes sous `/mobile` et `/designer` : conteneur `mobile-app` et `<router-view />`. |

### `src/lib/` — Client Supabase & couche service

| Fichier | Description |
|--------|-------------|
| **`supabaseClient.js`** | Création du client Supabase + helper `isSupabaseConfigured()`. |
| **`renderMobileReportPdfHtml.js`** | Génération du HTML PDF à partir d'une instance et d'un gabarit Mustache (depuis `schema_json.templates`). |
| **`models/Form.js`** | Modèle formulaire générique. |
| **`models/FormField.js`** | Modèle d'un champ. |
| **`models/FormResponse.js`** | Modèle de réponse. |
| **`services/FormService.js`** | Service métier formulaires. |
| **`services/ResponseService.js`** | Service métier réponses. |
| **`services/SupabaseDataService.js`** | **Accès données réel** : CRUD formulaires, instances, versionnement, génération de nom horodaté. |
| **`utils/dateHelper.js`** | Utilitaires de dates. |
| **`utils/validators.js`** | Fonctions de validation des champs. |

### `src/pages/mobile/` — Parcours Terrain

| Fichier | Description |
|--------|-------------|
| **`MobileFormList.vue`** | Liste des formulaires disponibles pour la saisie terrain. Barre de recherche, compteur d'instances. |
| **`MobileReportFill.vue`** | Saisie terrain par sections avec progression, validation des champs obligatoires. |
| **`MobileReportSummary.vue`** | Résumé des réponses avant enregistrement. |
| **`MobileReportHistory.vue`** | Historique des instances : dossiers par formulaire, recherche, export PDF individuel et **groupé** (checkboxes). |
| **`MobileReportDetail.vue`** | Détail d'une instance avec rendu Mustache et export PDF. |
| **`MobileFormBuilder.vue`** | Ancien builder (obsolète, remplacé par `DesignerFormBuilder`). |

### `src/pages/designer/` — Parcours Concepteur

| Fichier | Description |
|--------|-------------|
| **`DesignerFormList.vue`** | Liste des formulaires avec version, nombre de sections/gabarits. Liens vers édition, gabarits, versions. |
| **`DesignerFormBuilder.vue`** | Création/édition des champs du formulaire (titre, description, questions typées). |
| **`DesignerTemplates.vue`** | **Page dédiée** à la gestion des gabarits Mustache (nom, HTML, CSS). |
| **`DesignerVersions.vue`** | Consultation des informations de version (numéro, dates, questions). |

### `src/router/index.js`

| Fichier | Description |
|--------|-------------|
| **`index.js`** | Routes : `/auth/*` (Login, Register, ForgotPassword), `/mobile/*` (Terrain — accessible à tous les utilisateurs connectés), `/designer/*` (Concepteur — réservé aux rôles `concepteur` et `admin`), `/` redirige vers `/auth/login`, catch-all 404. Route guards : `requireAuth` et `requireRole`. |

### `src/styles/`

| Fichier | Description |
|--------|-------------|
| **`main.css`** | Styles globaux (Bootstrap, reset). |
| **`app-shell.css`** | Thème coque applicative (palette orange/pêche). |
| **`mobile-ui.css`** | Design system mobile (cartes, champs, boutons, barre de progression). |
| **`pages/*.css`** | Styles spécifiques par page bureau. |

---

## Flux fonctionnel

```
┌─────────────────────────────────────────────────────┐
│                   Accueil (Home)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Terrain      │  │  Concepteur  │  │ Outils    │ │
│  │  /mobile      │  │  /designer   │  │ /hub      │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┘ │
└─────────┼─────────────────┼─────────────────────────┘
          │                 │
          ▼                 ▼
   ┌──────────────┐  ┌──────────────────┐
   │ Saisie       │  │ Création         │
   │ terrain      │  │ formulaire       │
   │ + historique │  │ + versions       │
   │ + export PDF │  │ + gabarits       │
   └──────┬───────┘  └────────┬─────────┘
          │                   │
          ▼                   ▼
   ┌──────────────┐  ┌──────────────────┐
   │  Supabase    │  │  Supabase        │
   │  instances   │  │  formulaires     │
   └──────────────┘  └──────────────────┘
```

---

## Rôles (équivalent couches)

| Couche | Rôle dans ce projet |
|--------|---------------------|
| **Pages / vues** | Présentation et orchestration (appels services, état local, navigation). |
| **Composants** | UI réutilisable (ex. barre d'onglets). |
| **Layouts** | Enveloppe d'un groupe de routes (`/mobile`, `/designer`). |
| **Composables** | Logique et état réutilisables (export PDF). |
| **Services `lib/services`** | Accès données et règles métier (Supabase, CRUD, versionnement). |
| **Modèles `lib/models`** | Structures objet partagées côté client. |
| **Styles** | Thèmes globaux, shell, mobile, et feuilles par page. |

---

## Principes conservés

- Séparation **vue / logique métier** (services) et **données** (Supabase).
- **Deux parcours distincts** : Terrain (saisie) et Concepteur (création).
- Parcours **mobile-first** pour la saisie terrain.
- Gabarits intégrés dans `schema_json.templates` (pas de tables dédiées).
- Versionnement automatique des formulaires.
- Export PDF côté client via `html2pdf.js`.
