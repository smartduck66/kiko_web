// Transformation d'un fichier CSV des communes françaises (https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/)
// en un fichier json contenant le nom, la latitude et la longitude de chaque commune française référencée
// Utilisation en mode batch : node csv_to_json.js

class communes {
    cp;
    ville;
    latitude;
    longitude;
}

let fiches = [];
let fs = require("fs");

// Balayage du fichier csv, enrichissement de l'Array fiches, création du JSON sur disque
// Format : Code_commune_INSEE;Nom_commune;Code_postal;Ligne_5;Libellé_d_acheminement;coordonnees_gps
// Ex : 05024;VALDOULE;05150;STE MARIE;VALDOULE;44.4677366709,5.50388863719

let text = fs.readFileSync("../data/communes.csv","utf8");
var allTextLines = text.split(/\r\n|\n/);

for (let i=0;i< allTextLines.length; i++) {
    let item = new communes(); // note the "new" keyword here
    
    let fields = allTextLines[i].split(";");

    item.cp = fields[2];
    item.ville = fields[1];
    let coords = fields[5].split(",");
    item.latitude = coords[0];
    item.longitude = coords[1];
    
    fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches climatiques
    
}

fs.writeFileSync('../data/communes.json', JSON.stringify(fiches));    // Création du json final sur disque

