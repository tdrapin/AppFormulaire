# Journal — AppFormulaire

## Objectif du projet
Créer une application **mobile-first** pour :
- définir des formulaires via un modèle JSON,
- saisir des données terrain (instances),
- générer un document final HTML puis PDF.

Ce journal décrit le processus fonctionnel de bout en bout, indépendamment de l’implémentation technique.

---

## Processus complet (version actuelle)

### 1) Création d’un formulaire (modèle)
**But :** définir la structure des champs.

**Étapes :**
1. L’utilisateur ouvre l’interface “Création”.
2. Il saisit le titre et la description du formulaire.
3. Il ajoute des sections (ex : Informations, Données techniques).
4. Dans chaque section, il ajoute des champs typés :
   - texte
   - date
   - nombre
   - zone de texte
5. Le formulaire est converti en **schema_json**.
6. Le formulaire est enregistré dans la table `formulaires`.

**Sortie :** un enregistrement `formulaires` avec `schema_json`.

---

### 2) Création / choix d’un gabarit
**But :** définir le modèle visuel de sortie.

**Étapes :**
1. Le gabarit HTML est créé avec des balises Mustache.
2. Il est enregistré dans la table `gabarits`.
3. Le formulaire est lié au gabarit via `formulaire_gabarits`.

**Sortie :** gabarit HTML lié au formulaire.

---

### 3) Saisie d’une instance (réponse)
**But :** enregistrer des données réelles.

**Étapes :**
1. L’utilisateur sélectionne un formulaire.
2. Le système génère le formulaire à partir du `schema_json`.
3. L’utilisateur saisit les valeurs.
4. Les données sont stockées dans `donnees_json`.
5. Une instance est créée dans `instances`.

**Sortie :** une ligne `instances` avec `donnees_json`.

---

### 4) Génération HTML (rendu)
**But :** fusionner le gabarit et les données.

**Étapes :**
1. Récupérer :
   - le `schema_json` du formulaire (layout),
   - le gabarit HTML,
   - les instances associées.
2. Construire un objet de rendu :
   - `layout`
   - `instances`
3. Appliquer Mustache : `render(template, data)`.

**Sortie :** un HTML final prêt à être affiché ou exporté.

---

### 5) Génération PDF
**But :** exporter un document final.

**Étapes :**
1. Cibler le HTML généré.
2. Lancer l’export avec `html2pdf.js`.
3. Télécharger le PDF.

**Sortie :** document PDF généré côté client.

---

## Périmètre actuel
- Application mobile (smartphone)
- Pas d’authentification utilisateur pour l’instant
- Gabarit unique par formulaire
- Export PDF côté client uniquement

---

## Prochaines étapes prévues
1. Finaliser l’interface mobile
2. Intégrer l’export PDF
3. Ajouter validation minimale des champs
4. Préparer la phase authentification (plus tard)
