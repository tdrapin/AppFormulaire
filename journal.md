# Journal — Stage Xtralog (notes perso)

## Étapes

1. Recueillir les formulaires papier existants + cas d’usage (quotidien/hebdo, mobile terrain, contraintes).
2. Benchmark des solutions VueJS (rendu de formulaire, validation, conditions, builder) et choix d’approche.
3. Définir le modèle JSON V1 (en-tête, pied, sections, champs typés, validations, conditions simples).
4. Définir le schéma Supabase (Postgres) V1 (multi-tenant) + règles de sécurité (RLS).
5. Mettre en place l’auth + gestion des tenants (rôles admin/editor/viewer).
6. Développer le “Form Builder” V1 (créer/éditer un template JSON, versioning/clonage).
7. Développer le “Runner” V1 (saisie mobile/desktop, sauvegarde des réponses).
8. Ajouter l’offline + synchronisation (stockage local, file d’attente, résolution de conflits simple).
9. Ajouter l’administration et l’exploitation des données (liste, recherche, filtres, exports).
10. Ajouter l’export PDF (V1 simple : champs + valeurs ; V2 mise en page proche papier si nécessaire).
11. Gestion des fichiers (photos/signatures) si requis (Storage + permissions).
12. Clarifier et réaliser l’intégration Delphi (consommation API, app dédiée, ou interface avec existant).
13. Stabiliser (tests, perf, sécurité) et consolider la matière pour le mémoire.
