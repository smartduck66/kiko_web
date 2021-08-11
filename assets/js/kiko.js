// Ensemble des fonctions JS utilisées en mode interactif par index.html
// *********************************************************************
//

// Formatage
const euros = Intl.NumberFormat("fr", {style: "currency", currency: "EUR", maximumFractionDigits: 0});
const milliers = Intl.NumberFormat("fr", {style: "decimal", maximumFractionDigits: 0});

localStorage.clear();   // Initialisation du stockage local avant chargemet des différents fichiers json

// Load du fichier json contenant les coordonnées des CNPE (pour la fenêtre modale des risques)
fetch("assets/data/centrales.json")
             
.then(function (response) {
    return response.json();
})
.then(function (data) {
   localStorage.cnpe = JSON.stringify(data);    // Stockage local du fichier json pour le réutiliser lors de cette session
   
})
.catch(function (err) {
    console.log('error: ' + err);
});

// Load du fichier json contenant les coordonnées des sites seveso (pour la fenêtre modale des risques)
fetch("assets/data/seveso.json")
             
.then(function (response) {
    return response.json();
})
.then(function (data) {
   localStorage.seveso = JSON.stringify(data);    // Stockage local du fichier json pour le réutiliser lors de cette session
   
})
.catch(function (err) {
    console.log('error: ' + err);
});

// Load du fichier json contenant les départements/régions (pour la fenêtre modale)
fetch("assets/data/departements-region.json")
             
.then(function (response) {
    return response.json();
})
.then(function (data) {
   localStorage.dpt = JSON.stringify(data);    // Stockage local du fichier json pour le réutiliser lors de cette session
   
})
.catch(function (err) {
    console.log('error: ' + err);
});

// Load du fichier json contenant les coordonnées géographiques de chaque commune (pour la fenêtre modale)
fetch("assets/data/communes.json")
             
.then(function (response) {
    return response.json();
})
.then(function (data) {
   localStorage.communes = JSON.stringify(data);    // Stockage local du fichier json pour le réutiliser lors de cette session
   
})
.catch(function (err) {
    console.log('error: ' + err);
});

// Load du fichier json contenant l'ensemble des fiches climatiques
fetch("assets/data/fc.json")
             
.then(function (response) {
    return response.json();
})
.then(function (data) {
   localStorage.fc = JSON.stringify(data);    // Stockage local du fichier json pour le réutiliser lors de cette session
   // Affichage valeur de référence
   let station = data[data.findIndex(x => x.indicatif == "78640001")];
   document.getElementById('en-tete').innerHTML = '<b>'+station.indicatif + ' - ' + station.ville + ' (alt. : ' + station.altitude + ' m)</b>'; 
   document.getElementById('tmoy').innerHTML = station.temp_moy + '°';
   document.getElementById('tmin').innerHTML = station.temp_min + '°';
   document.getElementById('tmax').innerHTML = station.temp_max + '°';
   document.getElementById('cnpe').innerHTML = station.distance_cnpe + ' kms';
   document.getElementById('soleil').innerHTML = milliers.format(station.ensoleillement) + ' h/an';
   document.getElementById('pluie').innerHTML = milliers.format(station.pluie) + ' mm/an';
   document.getElementById('vent').innerHTML = milliers.format(station.vent) + ' j/an';
   document.getElementById('prix').innerHTML = euros.format(station.prix_maisons) + '/m2';
})
.catch(function (err) {
    console.log('error: ' + err);
});

function affichage_fiches(results){
    // Affichage des fiches par colonne

    let [c1, c2, c3, c4, c5, c6, c7, c8, c9] = [[], [], [], [], [], [], [], [], []] // Initialisation multiple d'arrays en une seule ligne

    for (let i=0;i< results.length; i++) {
    let ref = results[i].indicatif;
    if (window.screen.width>768) {
        c1.push("<p>");
        c1.push(ref);
        c1.push(" ");
        c1.push(results[i].ville);
        c1.push(" (");
        c1.push(results[i].altitude);
        c1.push(" m)</p>");
    } else {c1.push(`<p><a onclick="showModal_ref('`+ ref +`')">` + ref + "</a></p>");}  // En mobile, affichage seulement de l'indicatif (modale pour le détail)
    c2.push("<p>" + results[i].temp_moy + "</p>");
    c3.push("<p>" + results[i].temp_min + "</p>");
    c4.push("<p>" + results[i].temp_max + "</p>");
    c5.push("<p>");
    if (isNaN(results[i].ensoleillement)) {c5.push(0);} else {c5.push(milliers.format(Number(results[i].ensoleillement)));}
    c5.push("</p>");
    c6.push("<p>");
    if (isNaN(results[i].pluie)) {c6.push(0);} else {c6.push(milliers.format(Number(results[i].pluie)));}
    c6.push("</p>");
    c7.push("<p>");
    if (isNaN(results[i].vent)) {c7.push(0);} else {c7.push(milliers.format(Number(results[i].vent)));}
    c7.push("</p>");
    c8.push("<p>" + results[i].distance_cnpe + "</p>");
    if (isNaN(results[i].prix_maisons)) {c9.push("<p>-</p>");} else {c9.push("<p>" + euros.format(results[i].prix_maisons) + "</p>");}
    }
    // On concatène chaque élément de l'array pour chaque colonne, afin d'obtenir une seule string HTML à afficher
    document.getElementById('results1').innerHTML = "".concat(...c1);
    document.getElementById('results2').innerHTML = "".concat(...c2);
    document.getElementById('results3').innerHTML = "".concat(...c3);
    document.getElementById('results4').innerHTML = "".concat(...c4);
    document.getElementById('results5').innerHTML = "".concat(...c5);
    document.getElementById('results6').innerHTML = "".concat(...c6);
    document.getElementById('results7').innerHTML = "".concat(...c7);
    document.getElementById('results8').innerHTML = "".concat(...c8);
    document.getElementById('results9').innerHTML = "".concat(...c9);

    document.getElementById('occurences').innerHTML = results.length;
}

function filtres() {
    // Saisie des filtres

    let data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques

    // Récupération et sécurisation des paramétres saisis
    let p1 = Number(document.getElementById('min_temp').value);
    let p2 = Number(document.getElementById('max_temp').value);
    if (p1 > p2) {
        p2 = p1;
        document.getElementById('max_temp').value = p2;
    }

    let p3 = Number(document.getElementById('min_soleil').value);
    let p4 = Number(document.getElementById('max_soleil').value);
    if (p3 > p4) {
        p4 = p3;
        document.getElementById('max_soleil').value = p4;
    }

    let p5 = Number(document.getElementById('min_pluie').value);
    let p6 = Number(document.getElementById('max_pluie').value);
    if (p5 > p6) {
        p6 = p5;
        document.getElementById('max_pluie').value = p6;
    }

    let p7 = Number(document.getElementById('min_vent').value);
    let p8 = Number(document.getElementById('max_vent').value);
    if (p7 > p8) {
        p8 = p7;
        document.getElementById('max_vent').value = p8;
    }

    // Sélection des fiches climatiques et tri ascendant
    let results = data;
    if (p1 != "" && p2 != "") {
        results = results.filter(x => x.temp_moy >= p1 && x.temp_moy <= p2);
        results.sort(function(a,b){return a.temp_moy - b.temp_moy});
    }
    if (p3 != "" && p4 != "") {
        results = results.filter(x => x.ensoleillement >= p3 && x.ensoleillement <= p4);
        results.sort(function(a,b){return a.ensoleillement - b.ensoleillement});
    }
    if (p5 != "" && p6 != "") {
        results = results.filter(x => x.pluie >= p5 && x.pluie <= p6);
        results.sort(function(a,b){return a.pluie - b.pluie});
    }
    if (p7 != "" && p8 != "") {
        results = results.filter(x => x.vent >= p7 && x.vent <= p8);
        results.sort(function(a,b){return a.vent - b.vent});
    }

    affichage_fiches(results);
}

function departement() {
    // Fiches d'un département donné

    let data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques

    // Récupération du paramétre saisi
    let p1 = document.getElementById('fiches_dep').value;

    // Sélection des fiches climatiques
    let results = data;
    if (p1 != "") {results = results.filter(x => x.departement == p1);}

    affichage_fiches(results);
}

function risques_commune() {
    // Affichage d'une modale contenant les risques liés à la commune (code postal saisi)

    // Récupération du paramétre saisi
    let p1 = document.getElementById('risques_cp').value;

    // Affichage de la modale
    showModal_risques(p1);

}

function ResetFiltres() {
    document.getElementById('min_temp').value = "";
    document.getElementById('max_temp').value = "";
    document.getElementById('min_soleil').value = "";
    document.getElementById('max_soleil').value = "";
    document.getElementById('min_pluie').value = "";
    document.getElementById('max_pluie').value = "";
    document.getElementById('min_vent').value = "";
    document.getElementById('max_vent').value = "";
    document.getElementById('occurences').innerHTML = "";
    document.getElementById('fiches_dep').value = "78";
    document.getElementById('risques_cp').value = "78140";
    for (let i=1;i< 10; i++) {
        document.getElementById('results' + i.toString()).innerHTML = "";
    } 

}   

function showModal_ref(ref) {
    var element = document.getElementById("modal");
    element.classList.add("is-active");
    
    let data = JSON.parse(localStorage.fc);     // Récupération locale des fiches climatiques
    let station = data[data.findIndex(x => x.indicatif == ref)]
    let data1 = JSON.parse(localStorage.dpt);   // Récupération locale des départements
    let dpt_searched = station.indicatif.substring(0,2);
    let dpt_toDisplay = "";  
    if (Number(dpt_searched) < 97) {            // Guard pour les DOM (inutile dans notre cas)
        let departement = data1[data1.findIndex(x => x.num_dep == dpt_searched)];
        dpt_toDisplay = departement.dep_name;
    } 
    document.getElementById('results_modal').innerHTML = "<p>" + station.indicatif + "</p><p>" + 
        station.ville + "</p><p>" + dpt_toDisplay + "</p><p>" + "Altitude : "+ station.altitude + " m</p>";

}    

function showModal_risques(cp) {
    let data = JSON.parse(localStorage.communes);       // Récupération locale des coordonnées géographiques des communes
    let data_cnpe = JSON.parse(localStorage.cnpe);      // Récupération locale des coordonnées des Centrales Nucléaires
    let data_seveso = JSON.parse(localStorage.seveso);  // Récupération locale des coordonnées des sites seveso

    var element = document.getElementById("modal");
    element.classList.add("is-active");
    let risques ="";
        
    try {
        let index = data.findIndex(x => x.cp==cp);      // Si pas de correspondance, le 'catch' prend le relai
        let ville = data[index]["ville"];
        let lat = data[index]["latitude"];
        let lon = data[index]["longitude"];
        let cnpe = site_dangereux_le_plus_proche(data_cnpe, lat, lon);
        let seveso = site_dangereux_le_plus_proche(data_seveso, lat, lon);
        risques = "<p>" + cp + "</p><p>" + ville + "</p><p>" + "CNPE la plus proche : "+ Math.trunc(cnpe.distance) + " kms ("+ cnpe.site + ")</p>" 
            + "Site Seveso le plus proche : "+ Math.trunc(seveso.distance) + " kms - "+ seveso.site + "</p>";
    
    }
    catch (ex) {
        risques = "Pas de données";
    }
    
    document.getElementById('results_modal').innerHTML = risques;

}    

function hideModal() {
    var element = document.getElementById("modal");
    document.getElementById('results_modal').innerHTML = "";
    element.classList.remove("is-active");

}  