// Bibliothéque JavaScript utilisée en mode "batch"
// Création du fichier json à partir des données climatiques de Météo France
// Mode d'emploi : 
// 1. node kiko_init.js en partant de la ligne de commande, une fois/an
// 2. Mise à jour du site Web, hébergé sur netlify, via git
// **********************************************************************************************************************
// TODO : traduire immo_data_load_from_data_gouv() pour charger annuellement les prix immobiliers des maisons (C++ à date)
// TODO : traduire climat_data_load_from_meteo_france() pour créer les fiches climatiques à partir du site de Météo France (C++ à date)

// On 'importe' des fonctions de distances.js
let distances = require('../js/distances.js'); 

// Chargement des prix au m2 et des coordonnées des CNPE
let prix_m2 = require('../data/prix_maisons_m2.json');    
let lat_long_CNPE = require('../data/centrales.json');    


function extract_alone_value(ref, pattern, data, value_name){
    // Fontion qui extrait une valeur seule   
    let match = data.match(pattern);
    if (match !== null) {
        return match[0];

    } else throw new Error("La fiche " + ref + " semble ne pas avoir de données : " + value_name);
}

function extract_value_in_a_list(ref, pattern, data, value_name){
    // Fontion qui extrait une valeur dans une liste
    let match = data.match(pattern);
    if (match !== null) {
        // Guard : on teste la présence d'une mention ("Données non disponibles" ou "Statistiques...") au lieu de valeurs
        let offset = value_name.length + 4; // L'offset permet de "sauter" le titre du bloc de données ; +4 correspond aux caractères parasites : CR,LF...
        let mention = data.substr(match.index + offset, 1);
       
        switch (mention) {
            case "D":
                // Données non disponibles
                return "indisponible";
 
            case "S":
                offset +=50; // On augmente l'offset à cause de la mention "Statistiques établies..."
                
            default:
                // On est positionné au début du jeu de données (janvier à décembre, + une valeur moyenne), séparées par des points-virgules
                let s1 = data.substr(match.index + offset, 156); // 156 correspond au nombre d'octets du jeu de données
                let s2 = s1.split(";");
                return s2[13].trimStart();  // On ne renvoit que la moyenne annuelle

        }

    } else throw new Error("La fiche " + ref + " semble ne pas avoir de données : " + value_name);

}


// Création du fichier json central regroupant les fiches climatiques synthétisées
let ref = require('../data/ListeFichesClimatiques.json');
let nb_fiches = Object.keys(ref.refcli).length

class data_MF {
    indicatif;
    ville;
    departement;
    altitude;
    latitude;
    longitude;
    temp_moy;
    temp_min;
    temp_max;
    ensoleillement;
    pluie;
    vent;
    distance_cnpe;
    prix_maisons;

}

let fiches = [];
let fs = require("fs");

// Balayage de l'ensemble des fiches MF, enrichissement de l'Array fiches, création du JSON sur disque
for (let i=0;i< nb_fiches; i++) {
    let text = fs.readFileSync("../ficheclim/"+ref.refcli[i].ref+".data","utf8");
    let item = new data_MF(); // note the "new" keyword here
     
    item.indicatif = ref.refcli[i].ref;
    item.ville = ref.refcli[i].town;
     
    let s = extract_alone_value(item.indicatif, /\(\d{1,3}\)/, text, "département");
    item.departement = s.substring(s.indexOf("(")+1,s.indexOf(")"));
    
    s = extract_alone_value(item.indicatif, /alt : \d+m/, text, "altitude");
    item.altitude = s.substring(s.indexOf(":")+2,s.indexOf("m"));

    s = extract_alone_value(item.indicatif, /lat : .+,/, text, "latitude");
    item.latitude = s.substring(s.indexOf(":")+2,s.indexOf(","));

    s = extract_alone_value(item.indicatif, /lon : .+;/, text, "longitude");
    item.longitude = s.substring(s.indexOf(":")+2,s.indexOf(";"));

    item.temp_moy = extract_value_in_a_list(item.indicatif, /Température moyenne/, text, "Température moyenne (Moyenne en °C)");

    item.temp_max = extract_value_in_a_list(item.indicatif, /Température maximale/, text, "Température maximale (Moyenne en °C)");

    item.temp_min = extract_value_in_a_list(item.indicatif, /Température minimale/, text, "Température minimale (Moyenne en °C)");

    item.ensoleillement = extract_value_in_a_list(item.indicatif, /Durée d'insolation/, text, "Durée d'insolation (Moyenne en heures)");

    item.pluie = extract_value_in_a_list(item.indicatif, /Précipitations : Hauteur moyenne mensuelle/, text, "Précipitations : Hauteur moyenne mensuelle (mm)");

    item.vent = extract_value_in_a_list(item.indicatif, /Nombre moyen de jours avec rafales/, text, "Nombre moyen de jours avec rafales");

    let d = distances.site_dangereux_le_plus_proche(lat_long_CNPE, distances.convert_DMS_DD(item.latitude), distances.convert_DMS_DD(item.longitude));
    item.distance_cnpe = Math.trunc(d.distance).toString();
    
    try {
        item.prix_maisons = prix_m2[prix_m2.findIndex(x => x.dpt==item.departement)]["prix"];
    }
    catch (ex) {
        item.prix_maisons = "-";
    }

    fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches climatiques
    
}

fs.writeFileSync('../data/fc.json', JSON.stringify(fiches,null,2));    // Création du json final sur disque