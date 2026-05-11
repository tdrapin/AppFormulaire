# AppFormulaire

Application Vue 3 pour :
- afficher des formulaires dynamiques stockés en JSON (`formulaires.schema_json`),
- enregistrer des instances de saisie (`instances.donnees_json`),
- rendre un document HTML avec Mustache (`gabarits.html_content` + `css_content`),
- exporter le rendu en PDF via `html2pdf.js`.

## Variables d'environnement

Créer un fichier `.env` à la racine avec :

```bash
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<votre-anon-key>
VITE_TEMP_USER_ID=11111111-1111-1111-1111-111111111111
```

## Démarrage

```bash
npm install
npm run dev
```

## Flux implémenté

1. **Runner (`/runner`)**
   - Charge les formulaires depuis Supabase.
   - Affiche dynamiquement les sections/champs du JSON.
   - Enregistre une instance dans la table `instances`.

2. **Admin (`/admin`)**
   - Charge les gabarits liés au formulaire (`formulaire_gabarits`).
   - Charge les instances associées.
   - Rend le template Mustache avec le contexte `{ layout, instances }`.
   - Exporte le résultat en PDF.
# AppFormulaire

Application **mobile-first** de création et saisie de formulaires dynamiques avec génération de rapports PDF.

---

## Objectif
AppFormulaire permet de :
- créer un formulaire via un modèle JSON,
- saisir des données sur mobile,
- générer un document final (HTML puis PDF).

L’application est centrée sur l’usage terrain et la simplicité.

---

## Fonctionnement global

### 1) Création du formulaire (modèle)
Le formulaire est défini sous forme de JSON (sections + champs typés). Il est stocké dans la table `formulaires`.

### 2) Gabarit HTML
Un gabarit Mustache définit la mise en page finale. Il est stocké dans `gabarits` puis lié au formulaire.

### 3) Saisie d’une instance
Les données saisies par l’utilisateur sont stockées dans `instances` sous forme de JSON.

### 4) Rendu HTML
Le gabarit est fusionné avec les données pour produire un HTML final.

### 5) Export PDF
Le HTML final est exporté en PDF via `html2pdf.js`.

---

## Schéma de base (Supabase)

```sql
CREATE TABLE gabarits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    html_content TEXT NOT NULL,
    css_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE formulaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    schema_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE formulaire_gabarits (
    formulaire_id UUID REFERENCES formulaires(id) ON DELETE CASCADE,
    gabarit_id UUID REFERENCES gabarits(id) ON DELETE CASCADE,
    PRIMARY KEY (formulaire_id, gabarit_id)
);

CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formulaire_id UUID REFERENCES formulaires(id) ON DELETE CASCADE,
    donnees_json JSONB NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Démarrage local

```bash
npm install
npm run dev
```

---

## Périmètre actuel
- Mobile uniquement
- Pas d’authentification utilisateur
- Gabarit unique par formulaire
- Export PDF côté client

---

## Documentation
- `journal.md` : processus fonctionnel et étapes
- `MVC_ARCHITECTURE.md` : architecture et flux applicatifs
- `maquette/mobile/README.md` : principes de design mobile
