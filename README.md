"# kiko_web"
Derniers travaux v1.07 : 27/01/2022 - fauna.db

Tests en local : lancer 'netlify dev' dans le répertoire racine du site
Typescript : suffixer les modules avec l'extension 'ts' ; exécuter par exemple 'tsc kiko.ts', qui génère kiko.js
Formatage du code avec Prettier : npx prettier --write .
Vérification dynamique du code avec eslint dans l'éditeur ; sinon en mode CLI 'eslint csv_to_json.ts'
Dépendances : bulma.css, fontawesome, fauna db
Import de communes.json dans fauna : fauna import --path=./assets/data/communes.json --collection=communes --append
Pipeline de compilation TS : node pipe_par

Recommandation : passer le site en production au "checker" HTML régulièrement -> https://validator.w3.org/
