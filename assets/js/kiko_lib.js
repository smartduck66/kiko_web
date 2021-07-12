// Librairie des fonctions du logiciel KIKO écrit en C++
// *****************************************************
// TODO : traduire immo_data_load_from_data_gouv() pour charger annuellement les prix immobiliers des maisons
// TODO : traduire climat_data_load_from_meteo_france() pour créer les fiches climatiques

// Initialisation de variables-clés
let earthRadiusKm = 6371;
let M_PI = Math.acos(-1.0);

// Chargement des prix au m2 et des coordonnées des CNPE
// Ex de Web API : fetch("assets/data/centrales.json") .then(response => {return response.json();}) .then(data => console.log(data));
const prix_m2 = require('../data/prix_maisons_m2.json');    
const lat_long_CNPE = require('../data/centrales.json');    

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

/* Tests
let lat_to_test=`43°54'30"N`;
let long_to_test=`00°30'00"W`;
console.log(centrale_la_plus_proche(lat_to_test, long_to_test));
*/

// Création du fichier json central regroupant les fiches climatiques
const ref = require('../data/ListeFichesClimatiques.json');
const nb_fiches = Object.keys(ref.refcli).length

class data_MF {
    indicatif;
    indicatif;
    altitude;
    temp_moy;
    temp_min;
    temp_max;
    ensoleillement;
    pluie;
    vent;
    distance_cnpe;
    prix_maisons;

}

var fiches = [];
const fs = require("fs");
console.log(fs.readFileSync("../ficheclim/"+ref.refcli[0].ref+".data","utf8"));
// Balayage de l'ensemble des fiches MF, enrichissement de l'Array fiches, création du JSON sur disque
for (let i=0;i< nb_fiches; i++) {
    let text = fs.readFileSync("../ficheclim/"+ref.refcli[i].ref+".data","utf8");
    var item = new data_MF(); // note the "new" keyword here
    
    item.indicatif = ref.refcli[i].ref;
    item.ville = ref.refcli[i].town;

    // regex sur : AMBERIEU (01)      Indicatif : 01089001, alt : 250m, lat : 45°58'30"N, lon : 05°19'42"E;
    let pattern1 = / /;
    let match1 = text.match(pattern1);
    if (match1 !== null) { 
        item.departement = match1[0];
        item.altitude = match1[1];
        item.latitude = match1[2];
        item.longitude = match1[3];
    } else throw new Error("La fiche " + ref.refcli[i].ref + " semble ne pas avoir de données dpt, altitude, latitude ou longitude !");

    // regex sur Température moyenne (Moyenne en °C);
    //        ;       2.5;       3.8;       7.5;      10.5;      14.9;      18.2;      20.8;      20.3;      16.4;      12.5;       6.6;       3.5;      11.5;
    item.temp_moy="10.2";
    item.temp_min="8.9";
    item.temp_max="13.3";
    
    // regex sur Durée d'insolation (Moyenne en heures);
    //        ;      71.7;      96.9;     166.5;     187.7;     215.6;     250.1;     284.9;     252.2;     183.6;       120;      68.9;      50.2;    1948.3;
    item.ensoleillement="2000";
    
    // regex sur Précipitations : Hauteur moyenne mensuelle (mm);
    //        ;      83.7;      73.3;      80.1;      95.2;     116.6;      91.7;      77.7;      82.1;       111;     120.1;     107.6;      95.3;    1134.4;
    item.pluie="876";
    
    // regex sur Nombre moyen de jours avec rafales;
//     >= 16 m/s   ;         -;       3.4;       4.3;       3.4;       2.6;       1.7;       2.1;       1.3;       1.5;       2.4;       3.0;       3.9;         -;
    item.vent="10";
    
    
    item.distance_cnpe=Math.trunc(centrale_la_plus_proche(item.latitude, item.longitude)).toString();
    item.prix_maisons=prix_m2[prix_m2.findIndex(x => x.dpt==item.departement)]["prix"];
    
    fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches climatiques
}

fs.writeFileSync('../data/fc.json', JSON.stringify(fiches));    // Création du json final sur disque



/*
		ss << setw(8) << left << x.ref << " - " << setw(25) << left << x.town <<
			" (" << setw(4) << right << to_string(x.altitude) << " m)" <<
			" - T moy : " << setw(4) << right << d2s(x.mean_temps[12], 1) <<
			" deg - T min : " << setw(4) << right << d2s(x.min_temps[12], 1) <<
			" deg - T max : " << setw(4) << right << d2s(x.max_temps[12], 1) <<
			" deg - soleil : " << setw(4) << right << d2s(x.solar_radiation_duration[12], 0) << " h/an" <<
			" - pluie : " << setw(4) << right << d2s(x.mean_rain[12], 0) << " mm/mois" <<
			" - rafales de vent : " << setw(3) << right << d2s(x.wind_mean_days(0, 12), 0) << " j/an" <<
			" - dist. Centrale : " << setw(5) << right << d2s(centrale_la_plus_proche(x.latitude, x.longitude, lat_long_CNPE), 0) << " kms" <<
			" - [prix maisons : " << setw(5) << right << prix << endl;


*/