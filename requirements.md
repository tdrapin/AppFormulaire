# Requirements - Plateforme Formulaires Xtralog

## Outils obligatoires
- Docker Desktop (avec WSL2 sur Windows)
- Git

## Stack technique

### Frontend
- **Vue 3** + TypeScript + Vite (dev rapide, build optimisé)
- **Vue Router** (navigation Builder/Runner/Admin)
- **Bootstrap 5** (UI mobile-first)
- **Zod** (validation JSON Schema côté front)
- **Ajv** (validation strict JSON Schema)
- **pdfmake** (export PDF simple)
- **@supabase/supabase-js** (auth + DB + RLS multi-tenant)

### Backend (à configurer plus tard)
- Supabase (PostgreSQL + RLS + Storage)

## Ports
- `5173` : Vite dev server (Vue)
- `54321` : Supabase local (quand on le branchera)

## Lancer l'environnement
```bash
docker compose up --build
```

Puis ouvre : http://localhost:5173

## Ajouter une dépendance
```bash
docker compose run --rm web npm install <package-name>
docker compose up
```

## Structure du projet
```
AppFormulaire/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── formModel.ts
│   │   ├── validation.ts
│   ├── styles/
│   └── types/
├── public/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── vite.config.ts
├── tsconfig.json
└── requirements.md
```
