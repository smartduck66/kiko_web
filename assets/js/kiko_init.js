// Création du fichier json à partir des données climatiques de Météo France
// Mode d'emploi : 
// 1. node kiko_init.js en partant de la ligne de commande, une fois/an
// 2. Mise à jour du site Web, hébergé sur netlify, via git
// **********************************************************************************************************************
// TODO : traduire immo_data_load_from_data_gouv() pour charger annuellement les prix immobiliers des maisons (C++ à date)
// TODO : traduire climat_data_load_from_meteo_france() pour créer les fiches climatiques à partir du site de Météo France (C++ à date)

// Initialisation de variables-clés
const EARTH_RADIUS_KM = 6371;
const M_PI = Math.acos(-1.0);

// Chargement des prix au m2 et des coordonnées des CNPE
let prix_m2 = require('../data/prix_maisons_m2.json');    
let lat_long_CNPE = require('../data/centrales.json');    

// This function converts decimal degrees to radians
function deg2rad(deg) { return (deg * M_PI / 180); }

//  This function converts radians to decimal degrees
function rad2deg(rad) { return (rad * 180 / M_PI); }

function distanceEarth(lat1d, lon1d, lat2d, lon2d) {
    /**
    * Returns the distance between two points on the Earth.
    * Direct translation from http://en.wikipedia.org/wiki/Haversine_formula
    * @param lat1d Latitude of the first point in degrees
    * @param lon1d Longitude of the first point in degrees
    * @param lat2d Latitude of the second point in degrees
    * @param lon2d Longitude of the second point in degrees
    * @return The distance between the two points in kilometers
    */

    let lat1r = deg2rad(lat1d);
    let lon1r = deg2rad(lon1d);
    let lat2r = deg2rad(lat2d);
    let lon2r = deg2rad(lon2d);
    let u = Math.sin((lat2r - lat1r) / 2);
    let v = Math.sin((lon2r - lon1r) / 2);
    return 2.0 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
    
}

function convert_DMS_DD(coord) {
    // Fonction qui convertit des coordonnées GPS d'une station météo en Degrés, Minutes, Secondes en Degrés Décimaux
    // Ex : latitude: 45°38'24"N longitude : 05°52'36"E donnera latitude : 45.64   longitude : 5.8766
    // Pas de guard supplémentaire dans cette fonction : le format de la coordonnées DMS a déjà été vérifié lors de la création des fiches climatiques
    let deg = coord.indexOf(`°`);
    let min = coord.indexOf(`'`);
    let sec = coord.indexOf(`"`);
    let h = Number(coord.substr(0, deg));
    let m = Number(coord.substring(deg + 1, min)) / 60;
    let s = Number(coord.substring(min + 1, sec)) / 3600;
    let c = h + m + s;

    // Les coordonnées Sud et Ouest sont négatives
    let n4 = coord.indexOf("S");
    let n5 = coord.indexOf("W");

    if (n4!= -1 || n5!= -1) {c = -c;}
    
    return c;

}

function centrale_la_plus_proche(latitude_station, longitude_station){
    // Fonction qui retourne la distance à vol d'oiseau (en kms) de la plus proche centrale nucléaire répertoriée sur le territoire français (IRSN.fr)
    // 19 centrales en exploitation en 2020 et 1 en construction (EPR Flamanville)
    // Outil de vérification : https://www.lexilogos.com/calcul_distances.htm

    // On calcule la distance de la station météo avec chacune des centrales nucléaires...
    let distance_centrales = new Array();

    for (let i=0;i< lat_long_CNPE.length; i++) {
        distance_centrales.push(distanceEarth(convert_DMS_DD(latitude_station), convert_DMS_DD(longitude_station), 
        Number(lat_long_CNPE[i].latitude), Number(lat_long_CNPE[i].longitude)));

    }

    // ... et on renvoit la distance minimale
    return Math.min(...distance_centrales);

}

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

    item.distance_cnpe = Math.trunc(centrale_la_plus_proche(item.latitude, item.longitude)).toString();
    
    try {
        item.prix_maisons = prix_m2[prix_m2.findIndex(x => x.dpt==item.departement)]["prix"];
    }
    catch (ex) {
        item.prix_maisons = "indisponible";
    }

    fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches climatiques
    
}

fs.writeFileSync('../data/fc.json', JSON.stringify(fiches));    // Création du json final sur disque

