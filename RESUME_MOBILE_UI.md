# Résumé — Interface mobile (formulaires dynamiques & PDF)

Ce document résume ce qui a été mis en place pour répondre au brief de conception UI mobile : parcours terrain, création de gabarit, résumé avant génération, liste des formulaires et historique des rapports.

## Objectif

Fournir une **interface mobile-first** cohérente (fond clair, cartes blanches, accents bleus, typo sans empattement **DM Sans**), avec **barre d’en-tête** (retour + titre + sous-titre) et **zone d’action fixe en bas** pour les boutons principaux, validation visuelle des champs obligatoires et messages d’erreur explicites.

## Fichiers ajoutés ou modifiés

### Styles

- **`src/styles/mobile-ui.css`** — Design system mobile : variables (`--m-bg`, `--m-accent`, etc.), en-tête sticky, cartes, champs, états d’erreur, badges d’étapes, interrupteurs, boutons primaires/ghost, pied d’écran fixe avec marge *safe area*.

### État de démo (sans obligation Supabase)

- **`src/composables/useMobileFormDemo.js`** — État partagé (singleton module) : liste de formulaires avec `schema_json` (sections / champs), session de saisie `fillSession`, historique `reports`, persistance **`sessionStorage`**, formulaires et exemples de rapports par défaut, actions `addForm`, `updateForm`, `startFill`, `saveReportFromSession`.

### Layout

- **`src/layouts/MobileAppLayout.vue`** — Enveloppe `/mobile` qui charge `mobile-ui.css` et affiche le `<router-view />` des écrans mobiles.

### Pages (écrans A à E)

| Écran | Fichier | Rôle |
|--------|---------|------|
| **D** — Liste des formulaires | `src/pages/mobile/MobileFormList.vue` | Cartes (nom, description, statut complet/incomplet), lien vers saisie, lien « Modifier le gabarit », boutons bas : nouveau formulaire + historique. |
| **B** — Création / édition gabarit | `src/pages/mobile/MobileFormBuilder.vue` | Titre + description, liste de questions (intitulé, type texte/date/nombre/textarea, obligatoire, suppression), « Ajouter une question », « Continuer » (création ou mise à jour selon la route). |
| **A** — Saisie rapport | `src/pages/mobile/MobileReportFill.vue` | En-tête avec titre/sous-titre du schéma, **blocs par section** avec numérotation des questions (Q1, Q2…), validation des obligatoires sur « Suivant », navigation entre blocs puis passage au résumé. |
| **C** — Résumé avant PDF | `src/pages/mobile/MobileReportSummary.vue` | Bandeau avec illustration type document, compte sections/questions, cartes par section avec aperçu des réponses, « Générer le document » (enregistre un rapport démo et redirige vers l’historique). |
| **E** — Historique | `src/pages/mobile/MobileReportHistory.vue` | Liste (date, client, statut terminé/brouillon), actions « Voir » / « Exporter » (export simulé par `alert`). |
| Détail rapport | `src/pages/mobile/MobileReportDetail.vue` | Lecture seule d’un rapport (libellés issus du gabarit + réponses), export PDF démo. |

### Routage et navigation

- **`src/router/index.js`** — Préfixe **`/mobile`** avec routes enfants : `forms`, `forms/new`, `forms/:formId/edit`, `report/:formId`, `report/:formId/summary`, `history`, `history/:reportId` (détail placé avant la route `history` pour le bon ordre de correspondance).

### Application principale et assets

- **`src/App.vue`** — Lien de navigation **« Mobile UI »** vers `/mobile` (le shell Bootstrap reste utilisé hors parcours mobile).
- **`index.html`** — Polices Google **DM Sans** (préconnexion + feuille de styles).

## Comportements implémentés

- Boutons principaux **fixés en bas** sur les écrans concernés (liste + historique gèrent leurs CTA en conséquence).
- **Champs obligatoires** : bordure / halo d’erreur + message sous le champ si l’utilisateur tente « Suivant » sans remplir.
- **Résumé** : si aucune session de saisie (accès direct), **bandeau d’erreur** invitant à repasser par la liste.
- **Exporter** : comportement **démonstration** (pas de génération PDF réelle branchée ici).

## Accès rapide

Lancer l’app (`npm run dev`), puis ouvrir **`/mobile`** (ou le lien **Mobile UI** dans la barre du haut).

---

*Document généré pour résumer l’implémentation UI mobile dans le dépôt AppFormulaire.*
