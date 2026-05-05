# 📱 Maquettes Mobile

Versions adaptées au **mobile** de l'application de création et gestion de formulaires. Toutes les pages sont optimisées pour les petits écrans avec une interface ergonomique et intuitive.

## 📋 Pages disponibles

### 1. **home-mobile.html** - Accueil
- Dashboard principal de l'utilisateur
- Liste des formulaires créés
- Affichage des statistiques
- Accès rapide aux actions principales
- Navigation par menu inférieur (bottom menu)

### 2. **form-builder-mobile.html** - Éditeur de forms (Mobile)
- Création et édition de formulaires
- Palette de champs en **bottom sheet** (glissez vers le haut)
- Canvas optimisé pour une colonne
- Boutons d'action tactiles (Éditer, Supprimer)
- Prévisualisation du titre en temps réel
- Toolbar réduite en bas de l'écran

### 3. **form-runner-mobile.html** - Affichage & Remplissage
- Interface de remplissage optimisée mobile
- Sections dépliables
- Validation en temps réel
- Barre de progression au top
- Boutons Submit/Précédent au bas
- Modal de confirmation de succès

### 4. **login-mobile.html** - Connexion
- Design minimaliste et épuré
- Champs tactiles facilement accessibles
- Connexion sociale (placeholder)
- Lien d'inscription
- Récupération mot de passe

### 5. **register-mobile.html** - Inscription
- Formulaire d'inscription simplifié
- Indicateur de force du mot de passe
- Validation progressive
- Conditions d'utilisation
- Mode scroll pour contenu long

## 🎨 Principes de Design

### Ergonomie Mobile
- ✅ **Boutons larges** : Minimum 44x44px pour tactile
- ✅ **Espacement** : 16-20px entre les éléments
- ✅ **Une colonne** : Pas de layout complexe sur mobile
- ✅ **Modals/Sheets** : Navigation intuitive et fluide
- ✅ **Bottom Navigation** : Menu inférieur pour l'accès rapide

### Interaction
- ✅ **Feedback Tactile** : Animations scale et couleur au toucher
- ✅ **Transitions Fluides** : Toutes les interactions animated
- ✅ **États Clairs** : Actif, Hover, Focus visuellement distincts
- ✅ **Récupération Facile** : Possibilité d'annuler/revenir facilement

### Performance
- ✅ **Pas de JavaScript lourd** : Code minimaliste
- ✅ **CSS Optimisé** : Pas de frameworks CSS externes
- ✅ **Images Emoji** : Pas de dependencies externes
- ✅ **Mobile-first** : Progressive enhancement

## 🔧 Limitations Intentionnelles

Certaines fonctionnalités ont été **simplifiées ou limitées** pour mobile :

| Fonctionnalité | Bureau | Mobile | Raison |
|---|---|---|---|
| Multiple colonnes | ✅ | ❌ | Trop d'espace |
| Drag & Drop | ✅ | ⚠️ | Tactile complexe |
| Propriétés avancées | ✅ | ⚠️ | Modal simplifié |
| Preview en temps réel | ✅ | ⚠️ | Limité par l'écran |
| Many fields visible | ✅ | ⚠️ | Scroll dans sections |

## 🚀 Navigation Mobile

```
home-mobile.html
    ├── form-builder-mobile.html (Créer nouveau)
    ├── form-runner-mobile.html (Remplir)
    ├── login-mobile.html (Déconnexion)
    └── Paramètres (placeholder)

login-mobile.html
    ├── register-mobile.html (Créer compte)
    └── home-mobile.html (Connexion réussie)

register-mobile.html
    └── login-mobile.html (Retour)
```

## 📐 Viewport et Responsive

Toutes les pages utilisent :
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Breakpoints CSS :
- **Mobile** : < 480px
- **Tablet** : 480px - 768px
- **Desktop** : > 768px (non utilisé ici)

## 🎯 Optimisations Tactiles

### Tailles de touch targets
- Boutons : 44x44px minimum
- Inputs : 40px de hauteur
- Checkboxes/Radios : 18x18px + padding

### Éviter les problèmes courants
- ✅ Pas de :hover (remplacé par :active)
- ✅ Pas de double tap zoom
- ✅ Padding suffisant autour clickable items
- ✅ Feedback visuel immédiat

## 📱 Tester en Local

1. Ouvrir dans un navigateur mobile ou émulateur
2. DevTools : F12 → Toggle Device Toolbar (Ctrl+Shift+M)
3. Sélectionner presets : iPhone, iPad, etc.
4. Tester interactions tactiles

## 🔄 Intégration avec le Backend

Les formulaires et pages sont statiques. Pour intégration réelle :

1. **form-builder-mobile.html** : Connecter au serveur pour sauvegarder les formulaires
2. **form-runner-mobile.html** : POST les données au backend
3. **login/register** : API d'authentification

Exemples de endpoints attendus :
```
POST /api/forms - Créer formulaire
GET /api/forms/:id - Récupérer formulaire
POST /api/responses - Sauvegarder réponse
POST /api/auth/login - Connexion
POST /api/auth/register - Inscription
```

## 🎪 Fichiers Inclus

- `home-mobile.html` - Dashboard
- `form-builder-mobile.html` - Éditeur
- `form-runner-mobile.html` - Formulaire à remplir
- `login-mobile.html` - Page de connexion
- `register-mobile.html` - Page d'inscription

Chaque fichier est **standalone** et peut être testé indépendamment.

---

**Version** : 1.0 - Mobile Mockup UI
**Créé** : Avril 2026
**Plateforme** : HTML5 + CSS3 + Vanilla JS
