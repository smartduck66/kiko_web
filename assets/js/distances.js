// Code partagé entre le module kiko_init.js (node) et le module kiko.js (browser)
// Inspiration : https://caolan.uk/articles/writing-for-node-and-the-browser/
(function (exports) {
  // Initialisation de variables-clés
  var EARTH_RADIUS_KM = 6371;
  var M_PI = Math.acos(-1.0);
  // This function converts decimal degrees to radians
  function deg2rad(deg) {
    return (deg * M_PI) / 180;
  }
  //  This function converts radians to decimal degrees
  function rad2deg(rad) {
    return (rad * 180) / M_PI;
  }
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
    var lat1r = deg2rad(lat1d);
    var lon1r = deg2rad(lon1d);
    var lat2r = deg2rad(lat2d);
    var lon2r = deg2rad(lon2d);
    var u = Math.sin((lat2r - lat1r) / 2);
    var v = Math.sin((lon2r - lon1r) / 2);
    return (
      2.0 *
      EARTH_RADIUS_KM *
      Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v))
    );
  }
  exports.convert_DMS_DD = function (coord) {
    // Fonction qui convertit des coordonnées GPS d'une station météo en Degrés, Minutes, Secondes en Degrés Décimaux
    // Ex : latitude: 45°38'24"N longitude : 05°52'36"E donnera latitude : 45.64   longitude : 5.8766
    // Pas de guard supplémentaire dans cette fonction : le format de la coordonnées DMS a déjà été vérifié lors de la création des fiches climatiques
    var deg = coord.indexOf("\u00B0");
    var min = coord.indexOf("'");
    var sec = coord.indexOf('"');
    var h = Number(coord.substring(0, deg));
    var m = Number(coord.substring(deg + 1, min)) / 60;
    var s = Number(coord.substring(min + 1, sec)) / 3600;
    var c = h + m + s;
    // Les coordonnées Sud et Ouest sont négatives
    var n4 = coord.indexOf("S");
    var n5 = coord.indexOf("W");
    if (n4 != -1 || n5 != -1) {
      c = -c;
    }
    return c;
  };
  exports.site_dangereux_le_plus_proche = function (
    coords_sites_dangereux,
    latitude_to_test,
    longitude_to_test
  ) {
    // Fonction qui retourne la distance à vol d'oiseau (en kms) de la plus proche centrale nucléaire répertoriée sur le territoire français (IRSN.fr)
    // 19 centrales en exploitation en 2020 et 1 en construction (EPR Flamanville)
    // Outil de vérification : https://www.lexilogos.com/calcul_distances.htm
    var distance_sites_dangereux = /** @class */ (function () {
      function distance_sites_dangereux() {
        this.distance = 0;
        this.site = "";
      }
      return distance_sites_dangereux;
    })();
    var fiches = [];
    for (var i = 0; i < coords_sites_dangereux.length; i++) {
      var item = new distance_sites_dangereux(); // note the "new" keyword here
      item.distance = distanceEarth(
        latitude_to_test,
        longitude_to_test,
        coords_sites_dangereux[i].latitude,
        coords_sites_dangereux[i].longitude
      );
      item.site = coords_sites_dangereux[i].site;
      fiches.push(item);
    }
    fiches.sort(function (a, b) {
      return a.distance - b.distance;
    });
    // ... et on renvoit la distance minimale
    return fiches[0];
  };
})(typeof exports === "undefined" ? (this["distances"] = {}) : exports);
