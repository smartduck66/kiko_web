// Utilitaire "mode batch" (node csv_to_json.js) permettant de créer des fichiers json à partir de fichiers csv 'open data'
// ************************************************************************************************************************

// Transformation d'un fichier CSV des communes françaises (https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/)
// en un fichier json contenant le nom, la latitude et la longitude de chaque commune française référencée

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

let text = fs.readFileSync("../data_source/communes.csv","utf8");
var allTextLines = text.split(/\r\n|\n/);

for (let i=0;i< allTextLines.length; i++) {
    let item = new communes(); // note the "new" keyword here
    
    let fields = allTextLines[i].split(";");

    item.cp = fields[2];
    item.ville = fields[1];
    let coords = fields[5].split(",");
    item.latitude = coords[0];
    item.longitude = coords[1];
    
    fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
    
}

fs.writeFileSync('../data/communes.json', JSON.stringify(fiches,null,2));    // Création du json final sur disque

// ***********************************************************************************************************************************

// Transformation d'un fichier CSV des sites Seveso (https://public.opendatasoft.com/explore/dataset/sites-seveso/export/?flg=fr&location=9,44.52588,1.0643&basemap=jawg.streets)
// en un fichier json contenant la latitude, la longitude, le nom de l'usine et la commune hébergeant chaque site classé seveso

class seveso {
    latitude;
    longitude;
    nom;
    commune;
    statut_seveso;
}

let fiches1 = [];
let fs1 = require("fs");

// Balayage du fichier csv, enrichissement de l'Array fiches, création du JSON sur disque
let text1 = fs1.readFileSync("../data_source/sites-seveso.csv","utf8");
var allTextLines1 = text1.split(/\r\n|\n/);

for (let i=0;i< allTextLines1.length; i++) {
    let item = new seveso(); // note the "new" keyword here
    
    let fields = allTextLines1[i].split(";");

    let coords = fields[0].split(",");
    item.latitude = coords[0];
    item.longitude = coords[1];
    item.nom = fields[2];
    item.commune = fields[3];
    item.statut_seveso = fields[12];
    item.site = "Sté " + item.nom + " à "+ item.commune + " - " + item.statut_seveso;

    fiches1.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
    
}

fs.writeFileSync('../data/seveso.json', JSON.stringify(fiches1,null,2));    // Création du json final sur disque
