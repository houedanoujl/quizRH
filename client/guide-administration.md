# Quiz métier CIPREL : guide d'administration

Ce guide s'adresse à la personne qui s'occupe des trois appareils du quiz : la borne et les deux tablettes.

Les appareils fonctionnent sans internet et ne communiquent pas entre eux. Chacun garde ses propres participants. Il faut donc récupérer les données sur **chacun des trois**.

Le code PIN de l'administration ne figure pas dans ce document. Il vous est transmis séparément. Il est le même sur les trois appareils.

## Ouvrir l'administration

1. Revenez à l'écran d'accueil du quiz.
2. Touchez le logo 5 fois de suite, rapidement (en moins de 3 secondes).
3. Saisissez le code PIN, puis touchez « Valider ».

Le logo ne réagit pas pendant qu'un visiteur répond aux questions.

Après 5 codes faux, l'accès est bloqué pendant 5 minutes. Éteindre ou redémarrer l'appareil ne lève pas le blocage : il faut attendre.

Si personne ne touche l'écran pendant 90 secondes, l'appareil revient à l'accueil et l'administration se referme.

## Le jour de l'installation : nommer chaque appareil

À faire une seule fois sur chaque appareil :

1. Ouvrez l'administration.
2. Dans « Nom de cet appareil », saisissez `Borne`, `Tablette 1` ou `Tablette 2`.
3. Touchez « Enregistrer ».

Ce nom apparaît dans le fichier exporté. Il permet de savoir de quel appareil vient chaque participant.

## Récupérer la liste des participants

À faire sur chacun des trois appareils :

1. Branchez une clé USB.
2. Ouvrez l'administration. Le nombre de participants enregistrés s'affiche.
3. Touchez « Exporter en CSV ».
4. Dans la fenêtre qui s'ouvre, choisissez la clé USB, puis enregistrez.
5. Un message confirme le nombre de participants exportés et l'emplacement du fichier.

Le fichier s'ouvre avec Excel. Son nom contient le nom de l'appareil, la date et l'heure, par exemple `participants-ciprel-tablette-1-20261120-1730.csv`.

L'export ne supprime rien : les participants restent enregistrés sur l'appareil. Vous pouvez exporter autant de fois que vous voulez ; chaque fichier contient tous les participants depuis le début.

Transmettez les trois fichiers à l'équipe technique. Elle les réunit en un seul et repère les personnes qui ont participé sur plusieurs appareils.

Ces fichiers contiennent des noms, des adresses email et des numéros de téléphone. Ne les laissez pas sur une clé USB sans surveillance et ne les envoyez qu'aux personnes prévues par CIPREL.

## Fermer l'application

Ouvrez l'administration, puis touchez « Quitter l'application ».

L'application redémarre toute seule à l'allumage de l'appareil.

## En cas de problème

| Ce que vous voyez | Ce qu'il faut faire |
|---|---|
| « Code incorrect. » | Ressaisissez le code. Vous avez 5 essais. |
| « Trop d'essais. Réessayez dans 5 minutes. » | Attendez 5 minutes, sans redémarrer. |
| « Cette adresse email a déjà participé » | Normal : une adresse ne peut participer qu'une fois par appareil. |
| Le clavier à l'écran ne s'ouvre pas | Dans Windows : Paramètres › Heure et langue › Saisie › Clavier tactile, activez « Afficher le clavier tactile quand aucun clavier n'est connecté ». |
| « Vos réponses n'ont pas pu être enregistrées » | Prévenez l'équipe technique : le disque de l'appareil est peut-être plein ou protégé. |
| L'écran est figé | Éteignez puis rallumez l'appareil. Les participants déjà enregistrés sont conservés. |

## Où sont les données

Sur chaque appareil, les participants sont enregistrés dans le fichier `participants.json`, dans le dossier `%APPDATA%\CIPREL Quiz Métier`. Ne le modifiez pas et ne le supprimez pas : passez par l'export.
