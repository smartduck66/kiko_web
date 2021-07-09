// Librairie des fonctions du logiciel KIKO écrit en C++
// *****************************************************
// TODO : traduire immo_data_load_from_data_gouv() pour charger annuellement les prix immobiliers des maisons
// TODO : traduire climat_data_load_from_meteo_france() pour créer les fiches climatiques

// Initialisation de variables-clés
let earthRadiusKm = 6371;
let M_PI = Math.acos(-1.0);

// Création des objets en mémoire : fiches climatiques (#1), prix au m2 (#2) et coordonnées des CNPE (#3)
// Ex de Web API : fetch("../data/centrales.json") .then(response => {return response.json();}) .then(data => console.log(data));
// TO DO - coeur du système (#1)
// const prix_m2 = require('../data/prix_maisons_m2.json');    //(#2)
// const lat_long_CNPE = require('../data/centrales.json');    //(#3)
// fetch("assets/data/centrales.json") .then(response => {return response.json();}) .then(data => {const lat_long_CNPE = data;});
async function fetchText() {
    let response = await fetch("assets/data/centrales.json");
    return await response.text();

}
const lat_long_CNPE = fetchText();
console.log(lat_long_CNPE);

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
    return 2.0 * earthRadiusKm * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
    
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
