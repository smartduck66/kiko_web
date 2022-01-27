/* eslint-disable no-unexpected-multiline */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
//
// Ensemble des fonctions JS utilisées en mode interactif par index.html
// *********************************************************************
//

// Ligne supprimée post-génération JS car require n'est pas compris par le browser
const distances = require("../js/distances.js");

// Formatage
const euros = Intl.NumberFormat("fr", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const milliers = Intl.NumberFormat("fr", {
  style: "decimal",
  maximumFractionDigits: 0,
});

localStorage.clear(); // Initialisation du stockage local avant chargement des différents fichiers json

// Load du fichier json contenant les coordonnées des CNPE (pour la fenêtre modale des risques)
fetch("assets/data/centrales.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    localStorage.cnpe = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
  })
  .catch(function (err) {
    console.log("error: " + err);
  });

// Load du fichier json contenant les coordonnées des sites seveso (pour la fenêtre modale des risques)
fetch("assets/data/seveso.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    localStorage.seveso = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
  })
  .catch(function (err) {
    console.log("error: " + err);
  });

// Load du fichier json contenant les départements/régions (pour la fenêtre modale)
fetch("assets/data/departements-region.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    localStorage.dpt = JSON.stringify(data); // Stockage local du fichier json pour le réutiliser lors de cette session
  })
  .catch(function (err) {
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
    const station =
      data[
        data.findIndex((x: { indicatif: string }) => x.indicatif == "78640001")
      ];

    document.getElementById("en-tete")!.innerHTML =
      "<b>" +
      station.indicatif +
      " - " +
      station.ville +
      " (alt. : " +
      station.altitude +
      " m)</b>";
    document.getElementById("tmoy")!.innerHTML = station.temp_moy + "°";
    document.getElementById("tmin")!.innerHTML = station.temp_min + "°";
    document.getElementById("tmax")!.innerHTML = station.temp_max + "°";
    document.getElementById("cnpe")!.innerHTML = station.distance_cnpe + " kms";
    document.getElementById("soleil")!.innerHTML =
      milliers.format(station.ensoleillement) + " h/an";
    document.getElementById("pluie")!.innerHTML =
      milliers.format(station.pluie) + " mm/an";
    document.getElementById("vent")!.innerHTML =
      milliers.format(station.vent) + " j/an";
    document.getElementById("prix")!.innerHTML =
      euros.format(station.prix_maisons) + "/m2";
  })
  .catch(function (err) {
    console.log("error: " + err);
  });

interface fiche_climatique {
  indicatif: string;
  ville: string;
  departement: string;
  altitude: number;
  latitude: string;
  longitude: string;
  temp_moy: number;
  temp_min: number;
  temp_max: number;
  ensoleillement: string;
  pluie: string;
  vent: string;
  distance_cnpe: number;
  prix_maisons: string;
}

function affichage_fiches<Type extends fiche_climatique[]>(
  results: Type
): void {
  // Affichage des fiches par colonne
  const c1: string[] = [];
  const c2: string[] = [];
  const c3: string[] = [];
  const c4: string[] = [];
  const c5: string[] = [];
  const c6: string[] = [];
  const c7: string[] = [];
  const c8: string[] = [];
  const c9: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const ref: string = results[i].indicatif;
    if (window.screen.width > 768) {
      c1.push("<p>");
      c1.push(ref);
      c1.push(" ");
      c1.push(results[i].ville);
      c1.push(" (");
      c1.push(results[i].altitude.toString());
      c1.push(" m)</p>");
    } else {
      c1.push(
        `<p><a onclick="showModal_ref('` + ref + `')">` + ref + "</a></p>"
      );
    } // En mobile, affichage seulement de l'indicatif (modale pour le détail)
    c2.push("<p>" + results[i].temp_moy + "</p>");
    c3.push("<p>" + results[i].temp_min + "</p>");
    c4.push("<p>" + results[i].temp_max + "</p>");
    c5.push("<p>");
    if (isNaN(Number(results[i].ensoleillement))) {
      c5.push("-");
    } else {
      c5.push(milliers.format(Number(results[i].ensoleillement)));
    }
    c5.push("</p>");
    c6.push("<p>");
    if (isNaN(Number(results[i].pluie))) {
      c6.push("-");
    } else {
      c6.push(milliers.format(Number(results[i].pluie)));
    }
    c6.push("</p>");
    c7.push("<p>");
    if (isNaN(Number(results[i].vent))) {
      c7.push("-");
    } else {
      c7.push(milliers.format(Number(results[i].vent)));
    }
    c7.push("</p>");
    c8.push("<p>" + results[i].distance_cnpe + "</p>");
    if (isNaN(Number(results[i].prix_maisons))) {
      c9.push("<p>-</p>");
    } else {
      c9.push("<p>" + euros.format(Number(results[i].prix_maisons)) + "</p>");
    }
  }

  // On concatène chaque élément de l'array pour chaque colonne, afin d'obtenir une seule string HTML à afficher
  document.getElementById("results1")!.innerHTML = "".concat(...c1);
  document.getElementById("results2")!.innerHTML = "".concat(...c2);
  document.getElementById("results3")!.innerHTML = "".concat(...c3);
  document.getElementById("results4")!.innerHTML = "".concat(...c4);
  document.getElementById("results5")!.innerHTML = "".concat(...c5);
  document.getElementById("results6")!.innerHTML = "".concat(...c6);
  document.getElementById("results7")!.innerHTML = "".concat(...c7);
  document.getElementById("results8")!.innerHTML = "".concat(...c8);
  document.getElementById("results9")!.innerHTML = "".concat(...c9);

  document.getElementById("occurences")!.innerHTML = results.length.toString();
}

function filtres(): void {
  // Saisie des filtres

  const data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques

  // Récupération et sécurisation des paramétres saisis
  let p1 = Number(
    (<HTMLInputElement>document.getElementById("min_temp")).value
  );
  let p2 = Number(
    (<HTMLInputElement>document.getElementById("max_temp")).value
  );
  if (p1 > p2) {
    p2 = [p1, (p1 = p2)][0]; // swap
    (<HTMLInputElement>document.getElementById("min_temp")).value =
      p1.toString();
    (<HTMLInputElement>document.getElementById("max_temp")).value =
      p2.toString();
  }

  let p3 = Number(
    (<HTMLInputElement>document.getElementById("min_soleil")).value
  );
  let p4 = Number(
    (<HTMLInputElement>document.getElementById("max_soleil")).value
  );
  if (p3 > p4) {
    p4 = [p3, (p3 = p4)][0]; // swap
    (<HTMLInputElement>document.getElementById("min_soleil")).value =
      p3.toString();
    (<HTMLInputElement>document.getElementById("max_soleil")).value =
      p4.toString();
  }

  let p5 = Number(
    (<HTMLInputElement>document.getElementById("min_pluie")).value
  );
  let p6 = Number(
    (<HTMLInputElement>document.getElementById("max_pluie")).value
  );
  if (p5 > p6) {
    p6 = [p5, (p5 = p6)][0]; // swap
    (<HTMLInputElement>document.getElementById("min_pluie")).value =
      p5.toString();
    (<HTMLInputElement>document.getElementById("max_pluie")).value =
      p6.toString();
  }

  let p7 = Number(
    (<HTMLInputElement>document.getElementById("min_vent")).value
  );
  let p8 = Number(
    (<HTMLInputElement>document.getElementById("max_vent")).value
  );
  if (p7 > p8) {
    p8 = [p7, (p7 = p8)][0]; // swap
    (<HTMLInputElement>document.getElementById("min_vent")).value =
      p7.toString();
    (<HTMLInputElement>document.getElementById("max_vent")).value =
      p8.toString();
  }

  // Sélection des fiches climatiques et tri ascendant
  let results = data;
  if (p1 + p2 > 0) {
    results = results.filter(
      (x: { temp_moy: number }) => x.temp_moy >= p1 && x.temp_moy <= p2
    );
    results.sort(function (a: { temp_moy: number }, b: { temp_moy: number }) {
      return a.temp_moy - b.temp_moy;
    });
  }
  if (p3 + p4 > 0) {
    results = results.filter(
      (x: { ensoleillement: number }) =>
        x.ensoleillement >= p3 && x.ensoleillement <= p4
    );
    results.sort(function (
      a: { ensoleillement: number },
      b: { ensoleillement: number }
    ) {
      return a.ensoleillement - b.ensoleillement;
    });
  }
  if (p5 + p6 > 0) {
    results = results.filter(
      (x: { pluie: number }) => x.pluie >= p5 && x.pluie <= p6
    );
    results.sort(function (a: { pluie: number }, b: { pluie: number }) {
      return a.pluie - b.pluie;
    });
  }
  if (p7 + p8 > 0) {
    results = results.filter(
      (x: { vent: number }) => x.vent >= p7 && x.vent <= p8
    );
    results.sort(function (a: { vent: number }, b: { vent: number }) {
      return a.vent - b.vent;
    });
  }

  affichage_fiches(results);
}

function departement(): void {
  // Fiches d'un département donné

  const data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques

  // Récupération du paramétre saisi
  const p1 = (<HTMLInputElement>document.getElementById("fiches_dep")).value;

  // Sélection des fiches climatiques
  let results = data;
  if (p1 != "") {
    results = results.filter(
      (x: { departement: string }) => x.departement == p1
    );
  }

  affichage_fiches(results);
}

function risques_commune(): void {
  // Affichage d'une modale contenant les risques liés à la commune (code postal saisi)

  // Récupération du paramétre saisi
  const p1 = (<HTMLInputElement>document.getElementById("risques_cp")).value;

  // Affichage de la modale
  showModal_risques(p1);
}

function ResetFiltres(): void {
  (<HTMLInputElement>document.getElementById("min_temp")).value = "";
  (<HTMLInputElement>document.getElementById("max_temp")).value = "";
  (<HTMLInputElement>document.getElementById("min_soleil")).value = "";
  (<HTMLInputElement>document.getElementById("max_soleil")).value = "";
  (<HTMLInputElement>document.getElementById("min_pluie")).value = "";
  (<HTMLInputElement>document.getElementById("max_pluie")).value = "";
  (<HTMLInputElement>document.getElementById("min_vent")).value = "";
  (<HTMLInputElement>document.getElementById("max_vent")).value = "";
  (<HTMLInputElement>document.getElementById("occurences")).value = "";
  (<HTMLInputElement>document.getElementById("fiches_dep")).value = "78";
  (<HTMLInputElement>document.getElementById("risques_cp")).value = "78140";

  document.getElementById("occurences")!.innerHTML = "";

  for (let i = 1; i < 10; i++) {
    document.getElementById("results" + i.toString())!.innerHTML = "";
  }
}

function showModal_ref(ref: string): void {
  const element = document.getElementById("modal");
  element!.classList.add("is-active");

  const data = JSON.parse(localStorage.fc); // Récupération locale des fiches climatiques
  const station =
    data[data.findIndex((x: { indicatif: string }) => x.indicatif == ref)];
  const data1 = JSON.parse(localStorage.dpt); // Récupération locale des départements
  const dpt_searched: string = station.indicatif.substring(0, 2);
  let dpt_toDisplay = "";
  if (Number(dpt_searched) < 97) {
    // Guard pour les DOM (inutile dans notre cas)
    const departement =
      data1[
        data1.findIndex((x: { num_dep: string }) => x.num_dep == dpt_searched)
      ];
    dpt_toDisplay = departement.dep_name;
  }
  document.getElementById("results_modal")!.innerHTML =
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

function showModal_risques(cp: string): void {
  const data_cnpe = JSON.parse(localStorage.cnpe); // Récupération locale des coordonnées des Centrales Nucléaires
  const data_seveso = JSON.parse(localStorage.seveso); // Récupération locale des coordonnées des sites seveso

  const element = document.getElementById("modal");
  element!.classList.add("is-active");
  let risques = "";

  // Connexion à la base distante pour le fichier des communes, trop volumineux pour être traité en local (> 4 Mo)
  // Ligne supprimée post-génération JS car require n'est pas compris par le browser
  const faunadb = require("faunadb");
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: "fnAEdsVp-CAAwLklyuBILPAZb1qpPnzx5ZKT4aMo",
    domain: "db.eu.fauna.com",
    port: 443,
    scheme: "https",
  });

  client
    .query(q.Get(q.Match(q.Index("code_postal"), cp)))
    .then((ret: JSON) => {
      const result = Object.values(ret); // fauna renvoie ref, ts, data
      const ville: string = result[2].ville;
      const lat: number = result[2].latitude;
      const lon: number = result[2].longitude;

      const cnpe = distances.site_dangereux_le_plus_proche(data_cnpe, lat, lon); // Fonction 'importée' de distances.js
      const seveso = distances.site_dangereux_le_plus_proche(
        data_seveso,
        lat,
        lon
      ); // Fonction 'importée' de distances.js
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
      document.getElementById("results_modal")!.innerHTML = risques;
    })
    .catch(
      (err: string) =>
        (document.getElementById("results_modal")!.innerHTML =
          "Erreur : " + err)
    );
}

function hideModal(): void {
  const element = document.getElementById("modal");
  document.getElementById("results_modal")!.innerHTML = "";
  element!.classList.remove("is-active");
}
