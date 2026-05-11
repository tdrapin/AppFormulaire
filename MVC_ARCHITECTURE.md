# Architecture du projet — `src/` (à jour)

## Contexte

L’application est une **SPA Vue 3** (Composition API) avec **Vue Router**. On n’a pas un MVC serveur classique : la logique est répartie entre **vues (pages)**, **composants**, **composables**, **services** et **modèles** côté client. Les données réelles passent par **Supabase** (`SupabaseDataService` + `supabaseClient`) ; le parcours **`/mobile`** utilise en plus un **composable de démo** avec persistance `sessionStorage` pour prototyper sans base.

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
│   └── useMobileFormDemo.js
├── layouts/
│   └── MobileAppLayout.vue
├── lib/
│   ├── supabaseClient.js
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
│   └── mobile/
│       ├── MobileFormBuilder.vue
│       ├── MobileFormList.vue
│       ├── MobileReportDetail.vue
│       ├── MobileReportFill.vue
│       ├── MobileReportHistory.vue
│       └── MobileReportSummary.vue
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
| **`App.vue`** | Composant racine : coque visuelle (`app-shell`), zone `<router-view />`, marge « flush » pour `/mobile`, affichage conditionnel de la barre d’onglets basse selon `route.meta.hideBottomNav`. |
| **`main.js`** | Point d’entrée : crée l’app Vue, enregistre le router, importe les feuilles de style globales et par page (ordre chargé pour la surcharge des thèmes). |

### `src/assets/`

| Fichier | Description |
|--------|-------------|
| **`vue.svg`** | Icône / logo SVG fourni par le template Vite (asset statique). |

### `src/components/`

| Fichier | Description |
|--------|-------------|
| **`AppBottomTabs.vue`** | Barre de navigation principale (onglets bas) : Accueil, Formulaires, Historique, Outils ; surlignage de l’onglet actif selon le nom de route. |

### `src/composables/`

| Fichier | Description |
|--------|-------------|
| **`useMobileFormDemo.js`** | État partagé pour le parcours **`/mobile`** (liste de formulaires démo, session de saisie `fillSession`, historique de rapports) avec persistance **`sessionStorage`** et fonctions `addForm`, `updateForm`, `startFill`, `saveReportFromSession`. |

### `src/layouts/`

| Fichier | Description |
|--------|-------------|
| **`MobileAppLayout.vue`** | Layout parent des routes sous **`/mobile`** : conteneur `mobile-app` et `<router-view />` ; importe **`mobile-ui.css`**. |

### `src/lib/` — client Supabase & couche « modèle / service »

| Fichier | Description |
|--------|-------------|
| **`supabaseClient.js`** | Création du client Supabase à partir des variables d’environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) et helper **`isSupabaseConfigured()`**. |
| **`models/Form.js`** | Classe modèle « formulaire » générique (nom, description, champs, dates, méthodes `addField` / `removeField` / `toJSON`). |
| **`models/FormField.js`** | Modèle d’un champ (libellé, type, validation, etc.) — base objet pour les formulaires. |
| **`models/FormResponse.js`** | Modèle de réponse / soumission liée à un formulaire (structure côté application). |
| **`services/FormService.js`** | Service métier formulaires (CRUD / logique à étendre selon les besoins du projet). |
| **`services/ResponseService.js`** | Service orienté réponses / instances côté application. |
| **`services/SupabaseDataService.js`** | **Accès données réel** : lecture formulaires, création d’instances, gabarits, diagnostics / fixtures pour le Test Lab, etc. |
| **`utils/dateHelper.js`** | Utilitaires de formatage ou manipulation de dates. |
| **`utils/validators.js`** | Fonctions de validation réutilisables pour les formulaires ou les payloads. |

### `src/pages/` — vues « écrans »

| Fichier | Description |
|--------|-------------|
| **`Home.vue`** | Accueil : hero + grille de raccourcis vers le parcours mobile (formulaires, nouveau gabarit, historique, hub outils). |
| **`Hub.vue`** | Hub **Outils & bureau** : tuiles vers Administration PDF, Remplisseur web, Créateur, Test Lab. |
| **`Builder.vue`** | Page **Créateur (bureau)** : point d’entrée léger et liens vers le **concepteur mobile** (`/mobile/forms/new`) et la liste des gabarits. |
| **`Runner.vue`** | **Remplisseur connecté** : choix d’un formulaire Supabase, rendu dynamique des champs depuis `schema_json`, validation obligatoires, enregistrement d’instance. |
| **`Admin.vue`** | **Espace gestion** : sélection formulaire / gabarit, rendu Mustache, aperçu HTML, export **PDF** via `html2pdf.js`. |
| **`TestLab.vue`** | **Laboratoire** : actions de diagnostic Supabase, création de jeux de données de test, affichage de métriques / logs. |
| **`NotFound.vue`** | Page **404** avec liens de secours vers l’accueil, formulaires mobile, hub, etc. |
| **`mobile/MobileFormList.vue`** | Liste des **gabarits démo** (cartes, statut complet/incomplet), accès saisie et édition, bouton création. |
| **`mobile/MobileFormBuilder.vue`** | **Concepteur mobile** démo : titre, description, liste de questions (type, obligatoire), enregistrement dans `useMobileFormDemo`. |
| **`mobile/MobileReportFill.vue`** | **Saisie terrain démo** par blocs (sections), progression, validation, navigation vers le résumé. |
| **`mobile/MobileReportSummary.vue`** | **Résumé** des réponses avant action « Générer le document » (enregistrement rapport démo + redirection historique). |
| **`mobile/MobileReportHistory.vue`** | **Historique** des rapports démo (date, client, statut, liens Voir / Exporter simulé). |
| **`mobile/MobileReportDetail.vue`** | **Détail** d’un rapport démo (libellés issus du gabarit + valeurs saisies). |

### `src/router/`

| Fichier | Description |
|--------|-------------|
| **`index.js`** | Définition des routes : `/`, `/hub`, `/builder`, `/runner`, `/admin`, `/test-lab`, arbre **`/mobile`** avec redirections et **`meta.hideBottomNav`** pour masquer les onglets sur les écrans plein flux, catch-all **404**. |

### `src/styles/`

| Fichier | Description |
|--------|-------------|
| **`main.css`** | Styles globaux : import Bootstrap, variables de base, reset léger, hauteur `#app`. |
| **`app-shell.css`** | Thème **coque applicative** (palette orange / pêche), onglets bas, conteneur `.af-page`, harmonisation des cartes / boutons Bootstrap sur les pages bureau. |
| **`mobile-ui.css`** | **Design system** des écrans sous **`/mobile`** (cartes, champs, boutons pilule, bannières, barre de progression, etc.). |
| **`pages/Home.css`** | Styles spécifiques à l’accueil (hero, feuille qui remonte, grille). |
| **`pages/Builder.css`** | Styles associés à la page Builder (si utilisés). |
| **`pages/Runner.css`** | Styles du remplisseur (cartes, formulaires). |
| **`pages/Admin.css`** | Styles de l’administration (stats, prévisualisation, etc.). |
| **`pages/NotFound.css`** | Styles de la page 404. |
| **`pages/TestLab.css`** | Styles du Test Lab (métriques, cartes, logs). |

---

## Flux fonctionnel (réel dans le dépôt)

Deux parcours coexistent :

1. **Données Supabase** (Runner, Admin, Test Lab) : formulaires et instances en base, gabarits Mustache, export PDF depuis l’admin.
2. **Démo mobile** (`/mobile` + `useMobileFormDemo`) : gabarits et rapports stockés en **session navigateur** pour l’UI terrain sans configuration Supabase.

```
JSON schema (formulaires / schema_json)
   → saisie (Runner ou MobileReportFill)
   → stockage (Supabase ou session démo)
   → rendu Mustache + PDF (Admin, côté Supabase)
```

---

## Rôles (équivalent couches)

| Couche | Rôle dans ce projet |
|--------|---------------------|
| **Pages / vues** | Présentation et orchestration (appels services, état local, navigation). |
| **Composants** | UI réutilisable (ex. barre d’onglets). |
| **Layouts** | Enveloppe d’un groupe de routes (`/mobile`). |
| **Composables** | Logique et état réutilisables (démo mobile). |
| **Services `lib/services`** | Accès données et règles métier (Supabase, CRUD formulaires/réponses). |
| **Modèles `lib/models`** | Structures objet partagées côté client. |
| **Styles** | Thèmes globaux, shell, mobile, et feuilles par page. |

---

## Principes conservés

- Séparation **vue / logique métier** (services) et **données** (Supabase ou démo).
- Parcours **mobile-first** pour la saisie et la conception légère ; pages **bureau** pour PDF, diagnostic et saisie large.
- Code découpé par **domaine** (`lib/`, `pages/mobile/`, `router/`) pour faciliter la maintenance.
