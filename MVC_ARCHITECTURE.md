# Architecture MVC de AppFormulaire

## Structure du projet

```
src/
├── lib/                                (MODEL)
│   ├── models/                         - Classes de modèles de données
│   │   ├── Form.js                     - Modèle formulaire
│   │   ├── FormField.js                - Modèle champ de formulaire
│   │   └── FormResponse.js             - Modèle réponse à formulaire
│   │
│   ├── services/                       - Logique métier (Contrôleurs)
│   │   ├── FormService.js              - Service de gestion des formulaires
│   │   └── ResponseService.js          - Service de gestion des réponses
│   │
│   └── utils/                          - Fonctions utilitaires
│       ├── validators.js               - Validateurs (email, téléphone, etc.)
│       └── dateHelper.js               - Formatage et manipulation de dates
│
├── components/                         (VIEW - Composants réutilisables)
│   └── HelloWorld.vue                  - Composants réutilisables
│
├── pages/                              (VIEW - Pages principales)
│   ├── Home.vue                        - Accueil
│   ├── Builder.vue                     - Création de formulaires
│   ├── Runner.vue                      - Remplissage de formulaires
│   ├── Admin.vue                       - Gestion et statistiques
│   └── NotFound.vue                    - Page 404
│
├── router/
│   └── index.js                        - Configuration des routes
│
├── styles/
│   └── main.css                        - Feuilles de style globales
│
├── assets/                             - Ressources (images, icônes, etc.)
│
├── App.vue                             - Composant racine (template)
└── main.js                             - Point d'entrée Vue
```

## Pattern MVC expliqué

### **Model (lib/)**
Représente les données et la logique métier:
- **Classes de modèles** (`models/`) - Structure des données
- **Services** (`services/`) - Logique métier, opérations sur les données
- **Utilitaires** (`utils/`) - Fonctions réutilisables

### **View (pages/, components/)**
Affiche les données à l'utilisateur:
- **Pages** (`pages/`) - Écrans complets du projet
- **Composants** (`components/`) - Éléments réutilisables

### **Controller (intégré dans les .vue)**
Gère les interactions utilisateur:
- Les fichiers `.vue` importent les services et les utilisent
- Pas de fichiers controller séparés (Vue gère cela nativement)

## Flux MVC dans l'app

```
Utilisateur (Interface)
       ↓
     Vue (pages/*.vue, components/*.vue)
       ↓
 Controllers (logique dans .vue avec imports de services)
       ↓
 Services (lib/services/*.js)
       ↓
 Models (lib/models/*.js)
       ↓
   Données
```

## Exemple d'utilisation

### Dans une page (Vue)

```javascript
// pages/Builder.vue
import FormService from '@/lib/services/FormService.js'
import FormField from '@/lib/models/FormField.js'

export default {
  methods: {
    createNewForm() {
      // Appeler le service (logique métier)
      const newForm = FormService.createForm('Mon formulaire', 'Description')
      
      // Créer un champ avec le modèle
      const field = new FormField(null, 'Nom complet', 'text', true)
      FormService.addFieldToForm(newForm.id, field)
    }
  }
}
```

## Avantages de cette architecture

✅ **Séparation des responsabilités** - Données, logique, affichage séparés
✅ **Réutilisabilité** - Services utilisables dans toutes les pages
✅ **Maintenabilité** - Facile de localiser et modifier du code
✅ **Testabilité** - Logique métier testable indépendamment
✅ **Scalabilité** - Facile d'ajouter de nouvelles pages/services
