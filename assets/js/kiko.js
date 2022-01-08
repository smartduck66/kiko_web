/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Ensemble des fonctions JS utilisées en mode interactif par index.html
// *********************************************************************
//
//import {site_dangereux_le_plus_proche} from '../js/distances.js';
// On 'importe' des fonctions de distances.js via require mais il faut alors supprimer la ligne var distances = require('../js/distances.js'); post-génération
// eslint-disable-next-line @typescript-eslint/no-var-requires
//var distances = require("../js/distances.js");
// Formatage
var euros = Intl.NumberFormat("fr", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
});
var milliers = Intl.NumberFormat("fr", {
    style: "decimal",
    maximumFractionDigits: 0
});
localStorage.clear(); // Initialisation du stockage local avant chargement des différents fichiers json
// Load du fichier json contenant les coordonnées des CNPE (pour la fenêtre modale des risques)
fetch("assets/data/centrales.json")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    localStorage.cnpe = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
})["catch"](function (err) {
    console.log("error: " + err);
});
// Load du fichier json contenant les coordonnées des sites seveso (pour la fenêtre modale des risques)
fetch("assets/data/seveso.json")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    localStorage.seveso = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
})["catch"](function (err) {
    console.log("error: " + err);
});
// Load du fichier json contenant les départements/régions (pour la fenêtre modale)
fetch("assets/data/departements-region.json")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    localStorage.dpt = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
})["catch"](function (err) {
    console.log("error: " + err);
});
// Load du fichier json contenant les coordonnées géographiques de chaque commune (pour la fenêtre modale)
fetch("assets/data/communes.json")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    localStorage.communes = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
})["catch"](function (err) {
    console.log("error: " + err);
});
// Load du fichier json contenant l'ensemble des fiches climatiques
fetch("assets/data/fc.json")
    .then(function (response) {
    return response.json();
})
    .then(function (data) {
    localStorage.fc = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
    // Affichage valeur de référence
    var station = data[data.findIndex(function (x) { return x.indicatif == "78640001"; })];
    document.getElementById("en-tete").innerHTML =
        "<b>" +
            station.indicatif +
            " - " +
            station.ville +
            " (alt. : " +
            station.altitude +
            " m)</b>";
    document.getElementById("tmoy").innerHTML = station.temp_moy + "°";
    document.getElementById("tmin").innerHTML = station.temp_min + "°";
    document.getElementById("tmax").innerHTML = station.temp_max + "°";
    document.getElementById("cnpe").innerHTML = station.distance_cnpe + " kms";
    document.getElementById("soleil").innerHTML =
        milliers.format(station.ensoleillement) + " h/an";
    document.getElementById("pluie").innerHTML =
        milliers.format(station.pluie) + " mm/an";
    document.getElementById("vent").innerHTML =
        milliers.format(station.vent) + " j/an";
    document.getElementById("prix").innerHTML =
        euros.format(station.prix_maisons) + "/m2";
})["catch"](function (err) {
    console.log("error: " + err);
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function affichage_fiches(results) {
    // Affichage des fiches par colonne
    var c1 = [];
    var c2 = [];
    var c3 = [];
    var c4 = [];
    var c5 = [];
    var c6 = [];
    var c7 = [];
    var c8 = [];
    var c9 = [];
    for (var i = 0; i < results.length; i++) {
        var ref = results[i].indicatif;
        if (window.screen.width > 768) {
            c1.push("<p>");
            c1.push(ref);
            c1.push(" ");
            c1.push(results[i].ville);
            c1.push(" (");
            c1.push(results[i].altitude);
            c1.push(" m)</p>");
        }
        else {
            c1.push("<p><a onclick=\"showModal_ref('" + ref + "')\">" + ref + "</a></p>");
        } // En mobile, affichage seulement de l'indicatif (modale pour le détail)
        c2.push("<p>" + results[i].temp_moy + "</p>");
        c3.push("<p>" + results[i].temp_min + "</p>");
        c4.push("<p>" + results[i].temp_max + "</p>");
        c5.push("<p>");
        if (isNaN(results[i].ensoleillement)) {
            c5.push("-");
        }
        else {
            c5.push(milliers.format(Number(results[i].ensoleillement)));
        }
        c5.push("</p>");
        c6.push("<p>");
        if (isNaN(results[i].pluie)) {
            c6.push("-");
        }
        else {
            c6.push(milliers.format(Number(results[i].pluie)));
        }
        c6.push("</p>");
        c7.push("<p>");
        if (isNaN(results[i].vent)) {
            c7.push("-");
        }
        else {
            c7.push(milliers.format(Number(results[i].vent)));
        }
        c7.push("</p>");
        c8.push("<p>" + results[i].distance_cnpe + "</p>");
        if (isNaN(results[i].prix_maisons)) {
            c9.push("<p>-</p>");
        }
        else {
            c9.push("<p>" + euros.format(results[i].prix_maisons) + "</p>");
        }
    }
    // On concatène chaque élément de l'array pour chaque colonne, afin d'obtenir une seule string HTML à afficher
    document.getElementById("results1").innerHTML = "".concat.apply("", c1);
    document.getElementById("results2").innerHTML = "".concat.apply("", c2);
    document.getElementById("results3").innerHTML = "".concat.apply("", c3);
    document.getElementById("results4").innerHTML = "".concat.apply("", c4);
    document.getElementById("results5").innerHTML = "".concat.apply("", c5);
    document.getElementById("results6").innerHTML = "".concat.apply("", c6);
    document.getElementById("results7").innerHTML = "".concat.apply("", c7);
    document.getElementById("results8").innerHTML = "".concat.apply("", c8);
    document.getElementById("results9").innerHTML = "".concat.apply("", c9);
    document.getElementById("occurences").innerHTML = results.length.toString();
}
function filtres() {
    // Saisie des filtres
    var data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques
    // Récupération et sécurisation des paramétres saisis
    var p1 = Number(document.getElementById("min_temp").value);
    var p2 = Number(document.getElementById("max_temp").value);
    if (p1 > p2) {
        p2 = [p1, (p1 = p2)][0]; // swap
        document.getElementById("min_temp").value =
            p1.toString();
        document.getElementById("max_temp").value =
            p2.toString();
    }
    var p3 = Number(document.getElementById("min_soleil").value);
    var p4 = Number(document.getElementById("max_soleil").value);
    if (p3 > p4) {
        p4 = [p3, (p3 = p4)][0]; // swap
        document.getElementById("min_soleil").value =
            p3.toString();
        document.getElementById("max_soleil").value =
            p4.toString();
    }
    var p5 = Number(document.getElementById("min_pluie").value);
    var p6 = Number(document.getElementById("max_pluie").value);
    if (p5 > p6) {
        p6 = [p5, (p5 = p6)][0]; // swap
        document.getElementById("min_pluie").value =
            p5.toString();
        document.getElementById("max_pluie").value =
            p6.toString();
    }
    var p7 = Number(document.getElementById("min_vent").value);
    var p8 = Number(document.getElementById("max_vent").value);
    if (p7 > p8) {
        p8 = [p7, (p7 = p8)][0]; // swap
        document.getElementById("min_vent").value =
            p7.toString();
        document.getElementById("max_vent").value =
            p8.toString();
    }
    // Sélection des fiches climatiques et tri ascendant
    var results = data;
    if (p1 && p2) {
        results = results.filter(function (x) { return x.temp_moy >= p1 && x.temp_moy <= p2; });
        results.sort(function (a, b) {
            return a.temp_moy - b.temp_moy;
        });
    }
    if (p3 && p4) {
        results = results.filter(function (x) {
            return x.ensoleillement >= p3 && x.ensoleillement <= p4;
        });
        results.sort(function (a, b) {
            return a.ensoleillement - b.ensoleillement;
        });
    }
    if (p5 && p6) {
        results = results.filter(function (x) { return x.pluie >= p5 && x.pluie <= p6; });
        results.sort(function (a, b) {
            return a.pluie - b.pluie;
        });
    }
    if (p7 && p8) {
        results = results.filter(function (x) { return x.vent >= p7 && x.vent <= p8; });
        results.sort(function (a, b) {
            return a.vent - b.vent;
        });
    }
    affichage_fiches(results);
}
function departement() {
    // Fiches d'un département donné
    var data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques
    // Récupération du paramétre saisi
    var p1 = document.getElementById("fiches_dep").value;
    // Sélection des fiches climatiques
    var results = data;
    if (p1 != "") {
        results = results.filter(function (x) { return x.departement == p1; });
    }
    affichage_fiches(results);
}
function risques_commune() {
    // Affichage d'une modale contenant les risques liés à la commune (code postal saisi)
    // Récupération du paramétre saisi
    var p1 = document.getElementById("risques_cp").value;
    // Affichage de la modale
    showModal_risques(p1);
}
function ResetFiltres() {
    document.getElementById("min_temp").value = "";
    document.getElementById("max_temp").value = "";
    document.getElementById("min_soleil").value = "";
    document.getElementById("max_soleil").value = "";
    document.getElementById("min_pluie").value = "";
    document.getElementById("max_pluie").value = "";
    document.getElementById("min_vent").value = "";
    document.getElementById("max_vent").value = "";
    document.getElementById("occurences").value = "";
    document.getElementById("fiches_dep").value = "78";
    document.getElementById("risques_cp").value = "78140";
    document.getElementById("occurences").innerHTML = "";
    for (var i = 1; i < 10; i++) {
        document.getElementById("results" + i.toString()).innerHTML = "";
    }
}
function showModal_ref(ref) {
    var element = document.getElementById("modal");
    element.classList.add("is-active");
    var data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques
    var station = data[data.findIndex(function (x) { return x.indicatif == ref; })];
    var data1 = JSON.parse(localStorage.dpt); // Récupération locale des départements
    var dpt_searched = station.indicatif.substring(0, 2);
    var dpt_toDisplay = "";
    if (Number(dpt_searched) < 97) {
        // Guard pour les DOM (inutile dans notre cas)
        var departement_1 = data1[data1.findIndex(function (x) { return x.num_dep == dpt_searched; })];
        dpt_toDisplay = departement_1.dep_name;
    }
    document.getElementById("results_modal").innerHTML =
        "<p>" +
            station.indicatif +
            "</p><p>" +
            station.ville +
            "</p><p>" +
            dpt_toDisplay +
            "</p><p>" +
            "Altitude : " +
            station.altitude +
            " m</p>";
}
function showModal_risques(cp) {
    var data = JSON.parse(localStorage.communes); // Récupération locale des coordonnées géographiques des communes
    var data_cnpe = JSON.parse(localStorage.cnpe); // Récupération locale des coordonnées des Centrales Nucléaires
    var data_seveso = JSON.parse(localStorage.seveso); // Récupération locale des coordonnées des sites seveso
    var element = document.getElementById("modal");
    element.classList.add("is-active");
    var risques = "";
    try {
        var index = data.findIndex(function (x) { return x.cp === cp; }); // Si pas de correspondance, le 'catch' prend le relai
        var ville = data[index]["ville"];
        var lat = data[index]["latitude"];
        var lon = data[index]["longitude"];
        var cnpe = distances.site_dangereux_le_plus_proche(data_cnpe, lat, lon); // Fonction 'importée' de distances.js
        var seveso = distances.site_dangereux_le_plus_proche(data_seveso, lat, lon); // Fonction 'importée' de distances.js
        risques =
            "<p>" +
                cp +
                "</p><p>" +
                ville +
                "</p><p>" +
                "CNPE la plus proche : " +
                Math.trunc(cnpe.distance) +
                " kms (" +
                cnpe.site +
                ")</p>" +
                "Site Seveso le plus proche : " +
                Math.trunc(seveso.distance) +
                " kms - " +
                seveso.site +
                "</p>";
    }
    catch (ex) {
        risques = "Pas de données";
    }
    document.getElementById("results_modal").innerHTML = risques;
}
function hideModal() {
    var element = document.getElementById("modal");
    document.getElementById("results_modal").innerHTML = "";
    element.classList.remove("is-active");
}
