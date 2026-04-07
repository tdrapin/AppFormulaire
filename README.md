# AppFormulaire — Plateforme collaborative VueJS/Supabase/JSON

**Xtralog Stage 2026** | Formulaires techniques (création, gestion, exploitation, PDF)

## 🎯 Objectif

Permettre à des clients industriels (anonymes) de :
- **Créer** des formulaires techniques (en-tête, pied de page, champs typés)
- **Réutiliser** des templates et les décliner
- **Saisir** sur mobile/desktop (offline possible)
- **Exploiter** les données (filtres, historiques, exports)
- **Exporter** en PDF

## 🟦 Stack technique

| Layer | Tech |
|-------|------|
| **Frontend** | Vue 3 + TypeScript + Vite |
| **UI** | Bootstrap 5 (mobile-first) |
| **Formulaires** | JSON + renderer/builder maison |
| **Validation** | Zod + Ajv |
| **PDF** | pdfmake |
| **Backend/Auth** | Supabase (PostgreSQL + RLS + multi-tenant) |
| **Containerization** | Docker + Docker Compose |

## 📋 Fonctionnalités V1

- [x] Structure du projet (Vite + Vue Router)
- [ ] Modèle JSON de formulaires (schéma flexible)
- [ ] Auth Supabase + multi-tenant
- [ ] Form Builder (créer/éditer un template)
- [ ] Form Runner (saisir un formulaire)
- [ ] Offline/sync (IndexedDB + upload)
- [ ] Exploitation (filtres, recherche)
- [ ] Export PDF simple
- [ ] Delphi (intégration ou portage)

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop (WSL2)
- Git

### Lancer
```bash
git clone https://github.com/tdrapin/AppFormulaire.git
cd AppFormulaire
docker compose up --build
```

Ouvre : http://localhost:5173

### Ajouter une lib
```bash
docker compose run --rm web npm install <nom-package>
docker compose up
```

## 📁 Structure du projet

```
src/
├── main.ts                 # Entry point
├── App.vue                 # Root component
├── router/
│   └── index.ts            # Vue Router config
├── pages/
│   ├── Builder.vue         # Créer/éditer un formulaire
│   ├── Runner.vue          # Remplir un formulaire
│   └── Admin.vue           # Gestion des données
├── components/
│   ├── FormRenderer.vue    # Affiche un formulaire JSON
│   ├── FormBuilder.vue     # Compose un formulaire (Builder)
│   └── ...
├── lib/
│   ├── supabase.ts         # Client Supabase init
│   ├── formModel.ts        # Types/interfaces JSON formulaires
│   ├── validation.ts       # Zod/Ajv schemas
│   ├── pdf.ts              # Export pdfmake
│   └── offline.ts          # IndexedDB + sync (V2)
├── types/
│   └── index.ts            # Types globaux TypeScript
└── styles/
    └── main.css            # Bootstrap + custom
```

## 🔐 Multi-tenant & sécurité

- RLS (Row Level Security) au niveau Supabase/PostgreSQL
- Un user ne voit que les données de son tenant
- Validation stricte côté front (Zod) + côté back (Postgres)

## 📝 Journal de stage

Suivi hebdo : [journal.md](./journal.md)

## 📚 Ressources

- [Vue 3 Docs](https://vuejs.org)
- [Supabase Docs](https://supabase.com/docs)
- [Zod Validation](https://zod.dev)
- [pdfmake Docs](http://pdfmake.org)

## 👤 Auteur

**tdrapin** — Xtralog Stage 2026
