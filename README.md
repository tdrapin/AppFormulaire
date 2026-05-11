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
