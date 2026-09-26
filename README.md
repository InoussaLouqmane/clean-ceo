<div align="center">

# 🗑️♟️ CLEAN CEO

**Un empire de la collecte de déchets, vu du ciel, en isométrique.**

Jeu 2D de gestion/logistique développé pendant un workshop game design.
Fais grandir ta flotte (ouvriers → tricycle → camion), collecte chez tes clients,
signe de nouveaux contrats, et regarde tes FCFA et ton XP grimper.

[![Phaser](https://img.shields.io/badge/Phaser-3-8B5CF6?logo=phaser&logoColor=white)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Status](https://img.shields.io/badge/status-en_construction-orange)](./STATUS.md)
[![Deployed on Vercel](https://img.shields.io/badge/deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://clean-ceo.vercel.app)

</div>

---

## 🎮 Le concept

Le joueur gère une petite entreprise de collecte de déchets dans une ville vue en
isométrique. Des ouvriers à pied, puis des tricycles, puis des camions, collectent
chez les clients (restaurants, écoles, hôpitaux, marchés...). Chaque collecte
rapporte de l'argent (FCFA) et de l'expérience (XP) ; investir dans du matériel
plus rapide, signer des contrats et ne pas faire attendre ses clients fait grandir
l'empire.

> 🚧 Ce dépôt est construit étape par étape. Le détail de chaque session (ce qui
> est fait, bloqué, à valider) est dans [`STATUS.md`](./STATUS.md), journal
> jamais réécrit.

## ✨ Ce qui fonctionne aujourd'hui

### Menu et technique

- 🏠 **Main Menu** (DOM/CSS) : fond de ville, logo, Nouvelle partie / Reprendre partie /
  Comment jouer / Options, musique en boucle, son et volume mémorisés. Il
  s'affiche tout de suite ; le jeu (Phaser + carte + assets) se télécharge en
  arrière-plan, avec des phrases d'ambiance sur l'écran de chargement
- 🗺️ Rendu isométrique dimétrique (tuiles 64×32) plein écran, responsive,
  profondeur triée, ville entourée d'une mer de nuages
- 🖱️ **Caméra** : glisser pour panner (souris et tactile), molette / pincement
  pour zoomer, inertie au relâchement, dézoom limité
- 📱 **Mobile** : invitation à tourner le téléphone en paysage, HUD compact
- ⚙️ **Menu en jeu** : son, volume, reprendre, retour à l'accueil
- 💾 **Sauvegarde automatique** (localStorage) et « Reprendre partie » depuis le menu

### Jeu

- 🎯 **Niveau 1 « L'affaire du cousin »**, jouable de bout en bout : saisie du
  prénom, tutoriel guidé par Karim (dialogues façon Stardew avec portraits,
  doigt et spotlight, caméra qui rejoint le bâtiment visé), collectes chez 3
  restaurants, premier recrutement, écran de fin qui fait passer au niveau 2
- 🏢 **Tous les bâtiments cliquables** (88 bâtiments nommés), fiche par
  bâtiment : client, demande de contrat, pas encore de contrat, ou info
- ♻️ **Boucle de collecte** : jauge d'accumulation au pied des clients, bulle
  verte quand c'est prêt, anneau pendant la collecte, sélecteur d'unités par
  type + bouton « Collecter »
- 🚚 **Unités** : ouvriers à pied, tricycles et camions (conducteur inclus),
  carburant déduit du gain, usure, panne et réparation
- 🛒 **Boutique plein écran à onglets** : Personnel & équipement, Contrats,
  Améliorations (7 améliorations permanentes), Premium (simulé, prix en XOF,
  « Arrive bientôt »)
- 📈 **Niveaux par l'XP** (100 / 300 / 600...) avec annonce des déblocages
- 📜 **Quêtes** : carnet dans le HUD, 40 quêtes, récompenses réclamées à la main
- 🔔 **Contrats** : à chaque niveau, de nouveaux établissements demandent un
  contrat (bulle à cloche), signature depuis la fiche ou la boutique
- 😠 **Mécontentement** (branche `mecontentement`, pas encore sur `main`) :
  chaque client a une patience ; au-delà, bulle rouge et la collecte fait
  perdre de l'XP

### Outils d'équipe

- 🎨 **Éditeur de carte en jeu** (ajouter `?edit` à l'adresse) : calques
  Sol / Routes / Bâtiments / Détails, peinture et gomme à la souris, ajout
  d'assets personnalisés, annuler / rétablir (Ctrl+Z / Ctrl+Y), export JSON
- 🧪 `?debug` expose l'état du jeu (`window.__CLEAN_CEO__`) pour les tests
  automatisés

## 🔜 Pas encore là

- **Suite du mécontentement** : « 3 retards = contrat résilié, -15 XP » (prévu
  dans le document de conception)
- **Niveau 2 « À son compte »** : scénario et mécaniques propres (bennes de
  quartier et saturation, affichées « Bientôt » pour l'instant)
- **Unités visibles sur la carte** : ouvriers, tricycles et camions ne se
  déplacent pas encore dans les rues ; le QG n'a pas encore de rôle de jeu
  (futur point de départ des unités)
- **Vrais sons** : les effets sont synthétisés en attendant (seule la musique
  du menu est un vrai fichier)
- **Visuels placeholders** : icône du carnet de quêtes, visuels des packs
  premium, portraits du joueur (2 expressions sur celles prévues)
- **Premium réel** : aucun paiement, la boutique premium est une maquette
- **Équilibrage** : montants des améliorations, quêtes et packs à régler en jouant

Voir [`STATUS.md`](./STATUS.md) pour le détail précis et la prochaine étape.

## 🕹️ Live demo

👉 **[Jouer à la démo](https://clean-ceo.vercel.app)**

*(La démo est déployée depuis `main` : elle n'inclut pas ce qui est encore sur
une branche, comme le mécontentement.)*

## 🧱 Stack technique

| | |
|---|---|
| Moteur de jeu | [Phaser 3](https://phaser.io/) |
| Build / dev server | [Vite](https://vitejs.dev/) |
| Langage | JavaScript vanilla (ES modules), pas de framework, pas de TypeScript |
| UI (menus, HUD, dialogues) | DOM/CSS par-dessus le canvas, typo Oxanium |
| Déploiement | [Vercel](https://vercel.com/) |

## 🎨 Direction artistique

Vue isométrique dimétrique, ratio de tuile **64×32 px (2:1)**. Palette verrouillée
(aussi source des design tokens de l'UI, `src/menu/tokens.css`) :

| | | | | | | | | | | | |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ![#1B1712](https://placehold.co/40x40/1B1712/1B1712.png) | ![#6B5A46](https://placehold.co/40x40/6B5A46/6B5A46.png) | ![#8C7860](https://placehold.co/40x40/8C7860/8C7860.png) | ![#4C6B3F](https://placehold.co/40x40/4C6B3F/4C6B3F.png) | ![#6E8F52](https://placehold.co/40x40/6E8F52/6E8F52.png) | ![#9C5B3E](https://placehold.co/40x40/9C5B3E/9C5B3E.png) | ![#C98F5E](https://placehold.co/40x40/C98F5E/C98F5E.png) | ![#5B4632](https://placehold.co/40x40/5B4632/5B4632.png) | ![#1F5E52](https://placehold.co/40x40/1F5E52/1F5E52.png) | ![#C79A3B](https://placehold.co/40x40/C79A3B/C79A3B.png) | ![#A23B2A](https://placehold.co/40x40/A23B2A/A23B2A.png) | ![#F1E9D2](https://placehold.co/40x40/F1E9D2/F1E9D2.png) |
| `#1B1712` | `#6B5A46` | `#8C7860` | `#4C6B3F` | `#6E8F52` | `#9C5B3E` | `#C98F5E` | `#5B4632` | `#1F5E52` | `#C79A3B` | `#A23B2A` | `#F1E9D2` |

## 🚀 Démarrage rapide

Prérequis : [Node.js](https://nodejs.org/) 18+ et npm.

```bash
# Installer les dépendances
npm install

# Lancer le serveur de dev (hot reload)
npm run dev

# Build de production → dist/
npm run build

# Prévisualiser le build de production
npm run preview
```

`npm run dev` ouvre un serveur local (Vite l'affiche dans le terminal, généralement
`http://localhost:5173`). Ajouter `?edit` pour l'éditeur de carte, `?debug` pour
les tests.

## 📁 Structure du projet

```
index.html               Point d'entrée HTML
vite.config.js           Config Vite (dossier public/ servi tel quel)

public/assets/           Assets statiques, servis tels quels par Vite
  tiles/                  Tuiles de sol et de route (64×32)
  buildings/              Bâtiments (clients, maison de Karim, QG, déchetteries)
  buildings-web/          Versions réduites des bâtiments, utilisées en jeu
  characters/             Portraits de Karim et du joueur, sprites ouvrier
  vehicles/               Tricycle, camion
  props/                  Poubelles de rue, décor de rue
  decor/                  Décor hors carte (nuages...)
  map-custom/             Assets ajoutés dans l'éditeur, sortis en fichiers
  menu/                   Fond et logo du Main Menu
  sound/                  Musique du Main Menu
  ui/                     Icônes (boutique, économie...)
public/maps/
  default-map.json        Carte chargée à chaque lancement (format propre au projet)
  net-empire.tmj          Export Tiled d'origine, converti une seule fois (historique)

src/
  main.js                 Point d'entrée : UNIQUEMENT le Main Menu, sans Phaser
  game.js                 Crée le Phaser.Game (chargé à la demande depuis le menu)
  menu/                   Main Menu DOM/CSS, sons, pré-chargement, tokens.css
  CameraController.js     Pan / zoom / inertie, désactivable pendant l'édition
  mapData.js              Format de carte (grille de clés de texture) + export
  mapLoader.js            Chargement des assets, rendu et profondeur des sprites
  mapDecor.js             Décor hors zone (sol infini, arbres, nuages), purement visuel
  customAssets.js         Assets personnalisés de l'éditeur
  editor/                 Éditeur de carte (?edit) : peinture, panneau DOM, ajout d'assets
  scenes/
    MapScene.js           Scène principale : carte + jeu (ou éditeur avec ?edit)
    CalibrationScene.js   Ancienne grille de calibration, inutilisée par défaut
  game/
    economy.js            TOUS les chiffres du jeu (montants, durées, seuils, améliorations)
    GameState.js          Seule source de vérité de la partie
    events.js / save.js   Bus d'événements, sauvegarde localStorage
    GameController.js     Relie l'état, la carte et l'UI
    CityBuildings.js      Bâtiments cliquables, jauges et bulles
    buildingRegistry.js   Noms et types de clients des bâtiments
    quests.js             Catalogue des quêtes
    DialogueManager.js    Enchaînement des répliques (say / prompt / waitUntil)
    portraits.js          Portraits disponibles (Karim, joueur)
    level1/               Script (répliques) et déroulé du tutoriel du niveau 1
    ui/                   HUD, boutique, fiche bâtiment, carnet, dialogues, menu en jeu...
```

## 📚 Documentation du projet

| Fichier | Contenu |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Décisions verrouillées : stack, palette, vue isométrique, bug connu de Phaser sur le tile-picking, règles de code du gameplay |
| [`STATUS.md`](./STATUS.md) | Journal *append-only* : ce qui est fait, bloqué, et la prochaine étape, session par session |

## 🤖 Reprendre ce projet (humain ou agent IA)

Ce projet est pensé pour être repris sans contexte préalable, y compris par une autre
session Claude Code ou un autre agent IA :

1. Lire [`CLAUDE.md`](./CLAUDE.md) pour les décisions déjà verrouillées.
2. Lire la **dernière entrée** de [`STATUS.md`](./STATUS.md) pour savoir où le projet
   en est et quelle est la prochaine étape.
3. Ne jamais réécrire une entrée précédente de STATUS.md : toujours en ajouter une
   nouvelle, datée, en bas du fichier.
