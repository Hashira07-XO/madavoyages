madavoyages/

│

├── api/                     # LE BACKEND (Serverless Functions)

│   ├── config/

│   │   └── db.js            # Connexion PostgreSQL

│   ├── models/              # LES MODÈLES (Logique de Données / Requêtes SQL)

│   │   └── Circuit.js

│   └── circuits.js          # LES CONTRÔLEURS (Gestion des requêtes HTTP)

│

├── public/                  # LE FRONTEND (Vues statiques et média)

│   ├── css/

│   │   └── style.css

│   ├── js/

│   │   ├── main.js          # Logique d'affichage et requêtes Fetch

│   │   └── admin.js

│   ├── index.html           # VUE 1 : Présentation de l'agence (Accueil)

│   ├── voyages.html         # VUE 2 : Catalogue et Réservation de sièges

│   └── admin.html           # VUE 3 : Gestion et Tableaux de bord

│

├── database/

│   └── schema.sql           # Script de création des tables

│

├── package.json             # Fichier de configuration Node.js

└── vercel.json              # Routage et règles Vercel

