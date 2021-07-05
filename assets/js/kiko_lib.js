// Librairie des fonction du logiciel KIKO écrit en C++
// ****************************************************

// Initialisation de variables-clés
let earthRadiusKm = 6371
let M_PI = Math.acos(-1.0)

// Chargement des latitudes/longitudes des centrales nucléaires françaises
// Il faut charger le fichier json et initialiser lat_long_CNPE ********************************************

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
    let u = sin((lat2r - lat1r) / 2);
    let v = sin((lon2r - lon1r) / 2);
    return 2.0 * earthRadiusKm * Math.asin(sqrt(u * u + cos(lat1r) * cos(lat2r) * v * v));
}

function convert_DMS_DD(coord) {
    // Fonction qui convertit des coordonnées GPS d'une station météo en Degrés, Minutes, Secondes en Degrés Décimaux
    // Ex : latitude: 45°38'24"N longitude : 05°52'36"E donnera latitude : 45.64   longitude : 5.8766
    // Pas de guard supplémentaire dans cette fonction : le format de la coordonnées DMS a déjà été vérifié lors de la création des fiches climatiques
    let n1 = coord.indexOf("°");
    let h = Number(coord.substr(0, n1 - 1));
    let m = Number(coord.substring(n1, 2)) / 60;
    let s = Number(coord.substring(n1 + 3, 2)) / 3600;

    let c = h + m + s;

    // Les coordonnées Sud et Ouest sont négatives
    let n4 = coord.indexOf("S");
    let n5 = coord.indexOf("W");

    if (n4 || n5) {c = -c;}

    return c;

}

/*
function centrale_la_plus_proche(latitude_station, longitude_station){
    // Fonction qui retourne la distance à vol d'oiseau (en kms) de la plus proche centrale nucléaire répertoriée sur le territoire français (IRSN.fr)
    // 19 centrales en exploitation en 2020 et 1 en construction (EPR Flamanville)
    // Outil de vérification : https://www.lexilogos.com/calcul_distances.htm

    // On calcule la distance de la station météo avec chacune des centrales nucléaires...
    vector < double > distance_centrales{ };
    for (auto ll: lat_long_CNPE) {
        distance_centrales.push_back(distanceEarth(convert_DMS_DD(latitude_station), convert_DMS_DD(longitude_station), ll.first, ll.second));

    }

    // ... et on renvoit la distance minimale
    vector < double >:: iterator result = std:: min_element(distance_centrales.begin(), distance_centrales.end());
    return distance_centrales[std:: distance(distance_centrales.begin(), result)];

}
*/