// Code partagé entre le module kiko_init.js (node) et le module kiko.js (browser)
// Inspiration : https://caolan.uk/articles/writing-for-node-and-the-browser/

(function(exports){

    // Initialisation de variables-clés
    const EARTH_RADIUS_KM = 6371;
    const M_PI = Math.acos(-1.0);

    // This function converts decimal degrees to radians
    function deg2rad(deg: number) { return (deg * M_PI / 180); }
    
    //  This function converts radians to decimal degrees
    function rad2deg(rad: number) { return (rad * 180 / M_PI); }

    function distanceEarth(lat1d: number, lon1d: number, lat2d: number, lon2d: number) {
        /**
        * Returns the distance between two points on the Earth.
        * Direct translation from http://en.wikipedia.org/wiki/Haversine_formula
        * @param lat1d Latitude of the first point in degrees
        * @param lon1d Longitude of the first point in degrees
        * @param lat2d Latitude of the second point in degrees
        * @param lon2d Longitude of the second point in degrees
        * @return The distance between the two points in kilometers
        */

        let lat1r:number = deg2rad(lat1d);
        let lon1r:number = deg2rad(lon1d);
        let lat2r:number = deg2rad(lat2d);
        let lon2r:number = deg2rad(lon2d);
        let u:number = Math.sin((lat2r - lat1r) / 2);
        let v:number = Math.sin((lon2r - lon1r) / 2);
        return 2.0 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
        
    }

    exports.convert_DMS_DD= function(coord: string) {
        // Fonction qui convertit des coordonnées GPS d'une station météo en Degrés, Minutes, Secondes en Degrés Décimaux
        // Ex : latitude: 45°38'24"N longitude : 05°52'36"E donnera latitude : 45.64   longitude : 5.8766
        // Pas de guard supplémentaire dans cette fonction : le format de la coordonnées DMS a déjà été vérifié lors de la création des fiches climatiques
        let deg:number = coord.indexOf(`°`);
        let min:number = coord.indexOf(`'`);
        let sec:number = coord.indexOf(`"`);
        let h:number = Number(coord.substring(0, deg));
        let m:number = Number(coord.substring(deg + 1, min)) / 60;
        let s:number = Number(coord.substring(min + 1, sec)) / 3600;
        let c:number = h + m + s;

        // Les coordonnées Sud et Ouest sont négatives
        let n4:number = coord.indexOf("S");
        let n5:number = coord.indexOf("W");

        if (n4!= -1 || n5!= -1) {c = -c;}
        
        return c;

    }

    exports.site_dangereux_le_plus_proche = function(coords_sites_dangereux: any[], latitude_to_test: number, longitude_to_test: number){
        // Fonction qui retourne la distance à vol d'oiseau (en kms) de la plus proche centrale nucléaire répertoriée sur le territoire français (IRSN.fr)
        // 19 centrales en exploitation en 2020 et 1 en construction (EPR Flamanville)
        // Outil de vérification : https://www.lexilogos.com/calcul_distances.htm

        class distance_sites_dangereux {
            distance: number;
            site: string;

            constructor() {
                this.distance=0;
                this.site="";
              }
        }
        
        let fiches: distance_sites_dangereux[] = [];

        for (let i=0;i< coords_sites_dangereux.length; i++) {
            let item = new distance_sites_dangereux(); // note the "new" keyword here

            item.distance = distanceEarth(Number(latitude_to_test), Number(longitude_to_test), 
                Number(coords_sites_dangereux[i].latitude), Number(coords_sites_dangereux[i].longitude));
            
            item.site = coords_sites_dangereux[i].site;
            
            fiches.push(item);

        }
        fiches.sort(function(a,b){return a.distance - b.distance});

        // ... et on renvoit la distance minimale
        return fiches[0];

    }

})(typeof exports === 'undefined'? this['distances']={}: exports);






