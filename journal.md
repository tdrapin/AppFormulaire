# Journal — AppFormulaire

## Objectif du projet
Créer une application **mobile-first** pour :
- définir des formulaires via un modèle JSON,
- saisir des données terrain (instances),
- générer des documents PDF.

---

## Architecture actuelle

### Deux parcours distincts

#### 1) Parcours Terrain (`/mobile`)
**But :** saisir des données sur le terrain, consulter l'historique, exporter en PDF.

**Pages :**
- `MobileFormList` — liste des formulaires disponibles pour la saisie
- `MobileReportFill` — saisie terrain par sections avec validation
- `MobileReportSummary` — résumé avant enregistrement
- `MobileReportHistory` — historique des instances avec dossiers par formulaire, recherche, export individuel et groupé
- `MobileReportDetail` — détail d'une instance avec choix du gabarit et export PDF
- `MobileBatchDetail` — visualisation groupée de plusieurs instances avec choix du gabarit et export PDF

**Fonctionnalités :**
- Sélection d'un formulaire → saisie → enregistrement dans Supabase
- Nom unique horodaté généré automatiquement (ex: `Rapport_2026-05-17_21h00m00`)
- Export PDF individuel (via `MobileReportDetail`) et **export groupé** (via `MobileBatchDetail`)
- Barre de recherche dans l'historique
- Sélection multiple par checkboxes → "Voir" → page groupée avec choix du gabarit → export PDF

#### 2) Parcours Concepteur (`/designer`)
**But :** créer et gérer les formulaires, leurs versions et leurs gabarits d'export.

**Pages :**
- `DesignerFormList` — liste des formulaires avec version, nombre de sections/gabarits
- `DesignerFormBuilder` — création/édition des champs du formulaire
- `DesignerTemplates` — **page dédiée** à la gestion des gabarits Mustache

**Fonctionnalités :**
- Création et modification de formulaires (champs typés : texte, date, nombre, zone de texte)
- Versionnement automatique : toute modification incrémente la version
- Gabarits stockés dans `schema_json.templates` (propriétés `html`, `css`)
- Un formulaire peut avoir plusieurs gabarits nommés
- **Gabarit actif** : un toggle permet de définir quel gabarit est utilisé par défaut pour l'export
- Page dédiée aux gabarits (pas mélangée avec la création de formulaire)

---

## Structure des données

### Table `formulaires`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Clé primaire |
| nom | text | Titre du formulaire |
| schema_json | jsonb | Structure complète (meta, sections, fields, templates) |
| gabarit_actif_id | text | ID du gabarit actif (ex: `tpl_xxx`) |
| version | integer | Numéro de version (incrémenté automatiquement) |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Date de modification |

### Table `instances`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Clé primaire |
| formulaire_id | uuid | Référence au formulaire |
| nom | text | Nom unique horodaté (ex: `Rapport_2026-05-17_21h00m00`) |
| donnees_json | jsonb | Réponses saisies |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Date de modification |

### Structure de `schema_json`
```json
{
  "meta": {
    "title": "Nom du formulaire",
    "version": 1,
    "created_at": "2026-05-17"
  },
  "description": "Description du formulaire",
  "sections": [
    {
      "id": "sec_xxx",
      "title": "Nom de la section",
      "fields": [
        {
          "id": "q_xxx",
          "label": "Intitulé du champ",
          "type": "text|date|number|textarea",
          "required": true
        }
      ]
    }
  ],
  "templates": [
    {
      "id": "tpl_xxx",
      "name": "Interne",
      "html": "<h1>{{_nom}}</h1>...",
      "css": "body { font-family: sans-serif; }"
    }
  ]
}
```

---

## Processus complet

### 1) Création d'un formulaire (Concepteur)
1. L'utilisateur ouvre le **Concepteur** (`/designer`)
2. Il crée un nouveau formulaire avec titre, description, questions typées
3. Le formulaire est enregistré dans `formulaires` avec `schema_json` et version 1
4. Il peut modifier le formulaire : la version est incrémentée automatiquement
5. Il peut gérer les gabarits dans une **page dédiée** (`/designer/forms/:id/templates`)

### 2) Gestion des gabarits (Concepteur)
1. Depuis la liste des formulaires, cliquer sur "Gabarits"
2. Ajouter/modifier/supprimer des gabarits Mustache (nom, HTML, CSS optionnel)
3. Les gabarits sont stockés dans `schema_json.templates`
4. Un formulaire peut avoir plusieurs gabarits
5. **Toggle "Activer"** : un seul gabarit peut être actif à la fois (stocké dans `gabarit_actif_id`)
6. Le gabarit actif est pré-sélectionné lors de l'export

### 3) Saisie d'une instance (Terrain)
1. L'utilisateur sélectionne un formulaire dans la liste terrain
2. Le système génère le formulaire à partir du `schema_json`
3. L'utilisateur saisit les valeurs par sections
4. Validation des champs obligatoires
5. Enregistrement dans `instances` avec un nom horodaté unique

### 4) Consultation des instances (Terrain)
1. Les instances sont affichées par dossier de formulaire
2. Barre de recherche pour filtrer
3. Chaque instance peut être ouverte → page de détail avec choix du gabarit → export PDF
4. **Export groupé** : sélection multiple par checkboxes → "Voir" → page groupée avec choix du gabarit → export PDF

### 5) Génération PDF
1. Récupération du gabarit depuis `schema_json.templates` (ou gabarit par défaut)
2. Fusion avec les données de l'instance via Mustache
3. Export via `window.print()` (ouverture d'une nouvelle fenêtre avec le HTML + déclenchement de l'impression)

---

## Fonctionnalités implémentées
- ✅ Authentification utilisateur (email/mot de passe via Supabase Auth)
- ✅ Trois rôles : **Terrain**, **Concepteur**, **Admin**
- ✅ Route guards : `/mobile/*` (terrain), `/designer/*` (concepteur/admin)
- ✅ Barre d'onglets adaptée au rôle
- ✅ Création, modification de formulaires (Concepteur)
- ✅ Versionnement automatique des formulaires
- ✅ Gestion des gabarits dans une page dédiée (Concepteur)
- ✅ Un formulaire peut avoir plusieurs gabarits
- ✅ Gabarit actif (toggle + colonne `gabarit_actif_id`)
- ✅ Création d'instances avec nom horodaté unique
- ✅ Suppression d'instance (terrain : uniquement ses propres instances)
- ✅ Liste des instances par formulaire (dossiers)
- ✅ Barre de recherche dans l'historique
- ✅ Export PDF individuel (avec choix du gabarit)
- ✅ Export PDF groupé (sélection multiple → visualisation → choix gabarit → export)
- ✅ Rendu HTML via Mustache
- ✅ Validation des champs obligatoires
- ✅ Affichage mobile-first
- ✅ Deux parcours distincts (Terrain / Concepteur)
- ✅ Page Outils commune (profil, paramètres, déconnexion)
- ✅ Gestion des comptes (admin) : création, modification, suppression d'utilisateurs
- ✅ Navigation claire depuis l'accueil

## Fonctionnalités à venir
- ⬜ Duplication de formulaires
- ⬜ Duplication de gabarits
- ⬜ Édition des instances existantes
- ⬜ Filtres avancés dans l'historique

---

## Périmètre
- Application mobile (smartphone) et responsive desktop
- Authentification utilisateur via Supabase Auth (3 rôles)
- Export PDF côté client uniquement (via `window.print()`)
- Base de données Supabase

## Utilisateurs de test
Trois comptes de test sont disponibles (voir `supabase-seed-users.sql`) :
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| terrain@test.com | password123 | Terrain |
| concepteur@test.com | password123 | Concepteur |
| admin@test.com | password123 | Administrateur |
