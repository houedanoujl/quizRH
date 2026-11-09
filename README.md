# CIPREL : Quel métier est fait pour vous ?

Quiz métier pour une borne tactile Windows **hors ligne**. Il compte 18 questions oui/non et dure 2 minutes au chrono. À la fin, le quiz recommande un métier parmi cinq : RH, Production, Maintenance, Qualité ou Comptabilité. Le visiteur peut emporter ses résultats grâce à un QR code.

## Fonctionnement

- **Questions et métiers** : tout est dans `data/questions.js` et `data/metiers.js`.
  - Le métier dépend des **2 soft skills dominantes**, qui forment une paire. Chacune des 15 paires possibles renvoie à un métier, et chaque métier en reçoit 3.
  - Les textes de présentation des métiers se saisissent dans le champ `texte` de `data/metiers.js`.
- **Participants** : ils sont enregistrés sur le disque de la borne, dans `participants.json`.
  - Une adresse email ne peut participer qu'une fois.
  - Le consentement est obligatoire.
- **QR code** : il est généré sur la borne et contient le texte des résultats (prénom, métier, soft skills). Il n'inclut ni l'email ni le téléphone.
- **Inactivité** : après 90 s sans toucher l'écran, la borne revient à l'accueil.
- **Administration** : touchez 5 fois rapidement le logo, puis entrez le code PIN. La page affiche le nombre de participants. Elle permet d'exporter un CSV pour Excel (par exemple sur une clé USB) et de quitter l'application.

## Développement

```bash
yarn install --ignore-engines   # Node 22.22+ : --ignore-engines inutile
yarn dev                         # navigateur, données dans localStorage
yarn borne:dev                   # à lancer dans un second terminal : fenêtre Electron sur le serveur de dev
yarn export:client               # régénère client/questions.csv et client/metiers.csv
```

## Construire l'installateur Windows

```bash
BORNE_ADMIN_PIN=1234 yarn borne:build   # → dist-borne/CIPREL Quiz Métier Setup x.y.z.exe
```

- `BORNE_ADMIN_PIN` (4 à 8 chiffres) fixe le code PIN de l'administration. Il est **obligatoire** : sans lui, le build échoue. Après 5 codes faux, l'accès est bloqué 5 minutes.
- `NUXT_PUBLIC_QUIZ_DURATION` fixe la durée du quiz en secondes (120 par défaut).
- La compilation Windows fonctionne depuis macOS, sans Wine (testé). L'installateur n'est pas signé.

## Installation sur la borne

Prérequis : Windows 10 ou 11 en **64 bits**. Pour une version 32 bits, ajoutez `ia32` dans `build.win.target[0].arch`.

1. Lancez l'installateur `.exe`. L'application s'ouvre en plein écran (kiosque) et démarre avec Windows.
   - L'installateur n'est pas signé. SmartScreen affiche alors « Windows a protégé votre ordinateur » : cliquez sur « Informations complémentaires », puis sur « Exécuter quand même ».
   - Sur un écran tactile, le kiosque n'empêche pas les balayages depuis les bords (centre de notifications, vue des tâches). Désactivez-les avec la stratégie de groupe « Autoriser le balayage des bords » ou avec l'accès attribué de Windows.
2. Les données sont enregistrées dans `%APPDATA%\CIPREL Quiz Métier\participants.json`. Pour utiliser un autre dossier, définissez la variable `BORNE_DATA_DIR`.
3. Clavier tactile : vérifiez qu'il s'ouvre quand on touche un champ du formulaire. Pour cela, activez dans Windows le réglage *Paramètres › Heure et langue › Saisie › Clavier tactile › Afficher le clavier tactile quand aucun clavier n'est connecté*.
4. Pour fermer l'application, passez par l'administration (« Quitter l'application ») ou, avec un clavier branché, utilisez Alt+F4.
