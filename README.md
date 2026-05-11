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
