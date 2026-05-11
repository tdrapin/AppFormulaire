# Maquettes Mobile — AppFormulaire

Cette section décrit les principes UI mobile utilisés pour la refonte des interfaces.

---

## Objectif mobile
Concevoir une interface **simple, claire et rapide**, adaptée aux techniciens sur le terrain.

- Utilisation à une main
- Lecture facile en extérieur
- Actions principales accessibles en bas d’écran

---

## Pages principales (mobile-first)

### 1) Accueil
- Liste des formulaires disponibles
- Accès rapide aux actions
- Statut des formulaires (complet / incomplet)

### 2) Création de formulaire
- Titre + description
- Ajout de sections et de champs
- Choix du type de champ
- Marquage « obligatoire »

### 3) Saisie d’un rapport
- Questions en cartes
- Champs bien espacés
- Progression simple

### 4) Résumé avant génération
- Vue globale des réponses
- Validation finale
- Bouton « Générer le document »

### 5) Historique
- Liste des rapports saisis
- Tri par date
- Actions rapides (voir / exporter)

---

## Principes d’ergonomie mobile
- Boutons larges (minimum 44x44px)
- Une seule colonne
- Espacement généreux
- Navigation simple
- Feedback visuel immédiat

---

## Contraintes actuelles
- Application mobile uniquement
- Pas d’authentification utilisateur
- Pas de fonctionnalités desktop

---

## Intégration backend (cible)
- Lecture des formulaires depuis Supabase
- Sauvegarde des instances
- Rendu HTML Mustache
- Export PDF local
