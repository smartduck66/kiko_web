// Bibliothéque JavaScript utilisée en mode "batch" - Dernière version : 6/12/2021
// Mode d'emploi : 
// 1. Une fois/an, lancer dans cet ordre :
//      - node kiko_init.js mf : chargement des données climatiques de Météo France (MF)
//      - node kiko_init.js immo : création du fichier prix_maisons_m2.json correspondant aux prix immobiliers des maisons   
//      - node kiko_init.js clim : création du fichier fc.json à partir des données climatiques de Météo France      
// 2. Mise à jour du site Web, hébergé sur netlify, via git
// **********************************************************************************************************************

// On 'importe' des fonctions de distances.js
const distances = require('../js/distances.js'); 

// Chargement des prix au m2 et des coordonnées des CNPE
const prix_m2 = require('../data/prix_maisons_m2.json');    
const lat_long_CNPE = require('../data/centrales.json');    

// Constantes communes à l'ensemble des traitements
const https =  require("https");
const fs = require("fs");
const ref = require('../data/ListeFichesClimatiques.json');
const nb_fiches = Object.keys(ref.refcli).length;

function extract_alone_value(ref, pattern, data, value_name){
    // Fonction qui extrait une valeur seule   
    let match = data.match(pattern);
    if (match !== null) {
        return match[0];

    } else throw new Error("La fiche " + ref + " semble ne pas avoir de données : " + value_name);
}

function extract_value_in_a_list(ref, pattern, data, value_name){
    // Fonction qui extrait une valeur dans une liste
    let match = data.match(pattern);
    if (match !== null) {
        // Guard : on teste la présence d'une mention ("Données non disponibles" ou "Statistiques...") au lieu de valeurs
        let offset = value_name.length + 3; // L'offset permet de "sauter" le titre du bloc de données ; +3 correspond aux caractères parasites : CR,LF...
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



// *********************************************************************************************************************************************
// Main : récupération de l'argument passé en ligne de commande et exécution de la portion de code correspondante
// *********************************************************************************************************************************************
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

switch (myArgs[0]) {
case 'mf':
    console.log("Chargement des données climatiques brutes en provenance du site de Météo France");

    // Balayage de l'ensemble des fiches MF et création des fichiers .data sur disque (assets/ficheclim)
    for (let i=0;i< nb_fiches; i++) {
        let filename = ref.refcli[i].ref + ".data";
        console.log("Chargement de la fiche climatique de la ville : " + ref.refcli[i].town); 
        let url = "https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_" + filename;

        let request = https.get(url);

        request.on("response", response => {
            let httpStatus = response.statusCode;

            response.setEncoding("utf-8");
            let body = "";
            response.on("data", chunk => {body += chunk;});
          
            response.on("end", () => {
                if (httpStatus === 200) {
                    fs.writeFileSync('../ficheclim/' + filename, body);    // Création du fichier brut, mode texte, sur disque

                } else {
                    new Error('HTTP status ${response.statusCode}');

                }
            });

            request.on("error", error => {
                console.log(error);
            });

        })
    }
    break;

case 'clim':
    console.log("Création du fichier fc.json regroupant les fiches climatiques");

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

    // Balayage de l'ensemble des fiches MF, enrichissement de l'Array fiches, création du JSON sur disque
    for (let i=0;i< nb_fiches; i++) {
        let text = fs.readFileSync("../ficheclim/" + ref.refcli[i].ref + ".data","utf8");
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
            item.prix_maisons = prix_m2[prix_m2.findIndex(x => x.dpt==item.departement)]["prix"].toString();
        }
        catch (ex) {
            item.prix_maisons = "-";
        }

        fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches climatiques
        
    }

    fs.writeFileSync('../data/fc.json', JSON.stringify(fiches,null,2));    // Création du json final sur disque
    break;

case 'immo':
    // Chargement du fichier des valeurs foncières et création du fichier afférent sur le disque dur
	// Source : https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/
    console.log("Création du fichier prix_maisons_m2.json correspondant aux prix immobiliers des maisons");
    
    // Dernières valeurs disponibles complètes : 2020 - Chargées le 6 décembre 2021
    let url = "https://static.data.gouv.fr/resources/demandes-de-valeurs-foncieres/20211020-111113/valeursfoncieres-2020.txt";
    let filename = "../data_source/valeursfoncieres-2020.txt";
    
    let request = https.get(url);

    request.on("response", response => {
        let httpStatus = response.statusCode;
        
        response.setEncoding("utf-8");
        let body = "";
        response.on("data", chunk => {body += chunk;});
        
        response.on("end", () => {
            if (httpStatus === 200) {
                // On crée le fichier sur disque si tout est OK (400 Mo pour 2020, 3 millions de lignes) *************************************************
                // Champs ci-dessous pour chaque ligne du fichier --------------------------------------
                // Code service CH
                // Reference document
                // 1 Articles CGI
                // 2 Articles CGI
                // 3 Articles CGI
                // 4 Articles CGI
                // 5 Articles CGI
                // No disposition
                // Date mutation
                // Nature mutation
                // Valeur fonciere
                // No voie
                // B
                // T
                // Q
                // Type de voie
                // Code voie
                // Voie
                // Code postal
                // Commune
                // Code departement
                // Code commune
                // Prefixe de section
                // Section
                // No plan
                // No Volume
                // 1er lot
                // Surface Carrez du 1er lot
                // 2eme lot
                // Surface Carrez du 2eme lot
                // 3eme lot
                // Surface Carrez du 3eme lot
                // 4eme lot
                // Surface Carrez du 4eme lot
                // 5eme lot
                // Surface Carrez du 5eme lot
                // Nombre de lots
                // Code type local
                // Type local
                // Identifiant local
                // Surface reelle bati
                // Nombre pieces principales
                // Nature culture
                // Nature culture speciale
                // Surface terrain
                fs.writeFileSync(filename, body);    // Création du fichier brut, mode texte, sur disque
                fs.appendFileSync(filename, "|||||||999999|99/99/9999|Vente|99999999,99|99||RUE|9999||99999||99||||||||||||||||9|9|||||||999") // Guard à la fin du fichier

            } else {
                new Error('HTTP status ${response.statusCode}');

            }
        });

        request.on("error", error => {
            console.log(error);
        });

    })

    // Création du fichier prix_maisons_m2.json *****************************************************************************
    class prix_maisons {
        dpt;
        prix;
        nb_ventes;
    }

    // Balayage du fichier des valeurs foncières, enrichissement de l'Array fiches, création du JSON sur disque
    let fiches1 = [];
    let cumul_prix = cumul_surface = nb_vente = num_line = 0;
    let current_district = "01";

    var lineReader = require('readline').createInterface({  // Nouveau packade depuis Node 4.0.0 qui facilite la lecture d'un fichier ligne à ligne
        input: require('fs').createReadStream(filename)
    });
    
    lineReader.on('line', function (line_read) {
        if (num_line > 0) {                             // on saute la 1ère ligne du fichier
            let fields = line_read.split("|");
            let item = new prix_maisons();              // note the "new" keyword here
            
            let departement = fields[18];
            let prix = !fields[10] ? 0 : Number(fields[10].substring(0, fields[10].indexOf(",")));	// Guard si le prix est vide ; suppression des décimales sinon
            let type_bien = fields[36];
            let surface = !fields[38] ? 0 : Number(fields[38]);         // Guard si la surface est vide
            
            if (departement == current_district) {
                if (type_bien == "Maison" && prix / surface < 50000) {	// Guard : on ne retient pas les prix au m2 hors norme (vente de domaine, etc.)
                    cumul_prix += prix; 
                    cumul_surface += surface; 
                    ++nb_vente;
                    
                }
            
            }
            else {
                item.prix = cumul_surface ? Math.trunc(cumul_prix / cumul_surface).toString() : "0";	// Guard : pour le département 2B, pas de maison donc pas de surface...
                item.nb_ventes = nb_vente.toString();
                item.dpt = current_district;
                console.log( "Traitement du département " + item.dpt + " : prix moyen au m2 = " + item.prix + " euros ("+ item.nb_ventes + " ventes)");
                fiches1.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
                current_district = departement;
                cumul_prix = cumul_surface = nb_vente = 0;
                
            }
        }
        ++num_line;				
    });
    
    lineReader.on('close', function (line_read) {
        fs.writeFileSync('../data/prix_maisons_m2.json', JSON.stringify(fiches1,null,2));    // Création du json final sur disque

    });

    break;

default:
    console.log("Désolé mais seule l'une des 3 commandes suivantes est autorisée : mf, clim, immo");
}



