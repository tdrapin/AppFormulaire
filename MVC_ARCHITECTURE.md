# Architecture de AppFormulaire (version projet)

## Objectif
AppFormulaire est une application **mobile-first** qui permet :
- de définir des formulaires en JSON,
- de saisir des données terrain,
- de générer un document final HTML puis PDF.

Cette architecture sert de référence pour l’implémentation dans le dépôt.

---

## Organisation du code (proposée)

```
src/
├── lib/                              (données + services)
│   ├── models/                       - modèles métiers
│   │   ├── Form.js                    - modèle formulaire
│   │   ├── FormField.js               - modèle champ
│   │   ├── FormTemplate.js            - modèle gabarit
│   │   └── FormInstance.js            - modèle instance
│   │
│   ├── services/                     - logique applicative
│   │   ├── FormService.js             - CRUD formulaires
│   │   ├── TemplateService.js         - CRUD gabarits
│   │   ├── InstanceService.js         - CRUD instances
│   │   ├── RenderService.js           - Mustache + HTML
│   │   └── PdfService.js              - export PDF
│   │
│   └── utils/                        - helpers
│       ├── validators.js             - validations simples
│       └── dateHelper.js             - formats date
│
├── components/                       (éléments UI réutilisables)
│   ├── MobileHeader.vue
│   ├── MobileFooter.vue
│   ├── FieldInput.vue
│   └── SectionCard.vue
│
├── pages/                            (écrans principaux)
│   ├── Home.vue                      - liste formulaires
│   ├── Builder.vue                   - création formulaire
│   ├── Runner.vue                    - saisie instance
│   ├── Summary.vue                   - résumé + rendu
│   └── History.vue                   - historique des rapports
│
├── router/
│   └── index.js
│
├── styles/
│   └── main.css
│
├── App.vue
└── main.js
```

---

## Flux fonctionnel (du JSON au PDF)

```
Utilisateur
   ↓
Création d’un formulaire (schema_json)
   ↓
Enregistrement en base (formulaires)
   ↓
Création d’un gabarit HTML (gabarits)
   ↓
Liaison formulaire ↔ gabarit
   ↓
Saisie d’une instance (donnees_json)
   ↓
Rendu Mustache (HTML final)
   ↓
Export PDF (html2pdf.js)
```

---

## Rôle des couches

### Modèles
Représentent les structures de données : formulaire, champ, instance, gabarit.

### Services
Contiennent la logique métier :
- chargement des formulaires
- création d’instances
- rendu HTML
- export PDF

### Pages
Affichent les écrans mobiles et orchestrent les services.

---

## Principes appliqués
- séparation claire des responsabilités
- logique métier isolée dans les services
- interfaces adaptées mobile-first
- code simple et maintenable
