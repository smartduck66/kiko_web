// Utilitaire "mode batch" (node csv_to_json.js) permettant de créer des fichiers json à partir de fichiers csv 'open data'
// ************************************************************************************************************************

// Transformation d'un fichier CSV des communes françaises (https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/)
// en un fichier json contenant le nom, la latitude et la longitude de chaque commune française référencée
// Import de communes.json dans fauna via shell : fauna import --path=./assets/data/communes.json --collection=communes --append
class communes {
  cp: string;
  ville: string;
  latitude: number;
  longitude: number;

  constructor() {
    this.cp = "";
    this.ville = "";
    this.latitude = 0;
    this.longitude = 0;
  }
}

const fiches: communes[] = [];
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as fs1 from "fs";

// Balayage du fichier csv, enrichissement de l'Array fiches, création du JSON sur disque
// Format : Code_commune_INSEE;Nom_commune;Code_postal;Ligne_5;Libellé_d_acheminement;coordonnees_gps
// Ex : 05024;VALDOULE;05150;STE MARIE;VALDOULE;44.4677366709,5.50388863719

const text = fs1.readFileSync("../data_source/communes.csv", "utf8");
const allTextLines = text.split(/\r\n|\n/);

for (let i = 0; i < allTextLines.length; i++) {
  const item = new communes(); // note the "new" keyword here

  const fields = allTextLines[i].split(";");

  item.cp = fields[2];
  item.ville = fields[1];
  const coords = fields[5].split(",");
  item.latitude = Number(coords[0]);
  item.longitude = Number(coords[1]);

  fiches.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
}

fs1.writeFileSync("../data/communes.json", JSON.stringify(fiches, null, 2)); // Création du json final sur disque

// ***********************************************************************************************************************************

// Transformation d'un fichier CSV des sites Seveso (https://public.opendatasoft.com/explore/dataset/sites-seveso/export/?flg=fr&location=9,44.52588,1.0643&basemap=jawg.streets)
// en un fichier json contenant le nom de l'usine et la commune hébergeant chaque site classé seveso, la latitude, la longitude

class seveso {
  site: string;
  latitude: number;
  longitude: number;

  constructor() {
    this.site = "";
    this.latitude = 0;
    this.longitude = 0;
  }
}

const fiches1: seveso[] = [];

// Balayage du fichier csv, enrichissement de l'Array fiches, création du JSON sur disque
const text1 = fs1.readFileSync("../data_source/sites-seveso.csv", "utf8");
const allTextLines1 = text1.split(/\r\n|\n/);

for (let i1 = 0; i1 < allTextLines1.length; i1++) {
  const item1 = new seveso(); // note the "new" keyword here

  const fields1 = allTextLines1[i1].split(";");

  const coords1 = fields1[0].split(",");
  item1.site = "Sté " + fields1[2] + " à " + fields1[3] + " - " + fields1[12];
  item1.latitude = Number(coords1[0]);
  item1.longitude = Number(coords1[1]);

  fiches1.push(item1); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
}

fs1.writeFileSync("../data/seveso.json", JSON.stringify(fiches1, null, 2)); // Création du json final sur disque

// ***********************************************************************************************************************************

// Transformation d'un fichier CSV contenant la liste des fiches climatiques (https://donneespubliques.meteofrance.fr/?fond=produit&id_produit=117&id_rubrique=39)
// en un fichier json contenant la référence de la station météo et le nom de la ville

class fiche_clim_MF {
  ref: string;
  town: string;

  constructor() {
    this.ref = "";
    this.town = "";
  }
}

const fiches2: fiche_clim_MF[] = [];

// Balayage du fichier txt, enrichissement de l'Array fiches, création du JSON sur disque
const text2 = fs1.readFileSync("../data_source/listeFC_MF.csv", "utf8");
const allTextLines2 = text2.split(/\r\n|\n/);

for (let i2 = 0; i2 < allTextLines2.length; i2++) {
  const item2 = new fiche_clim_MF(); // note the "new" keyword here

  const fields2 = allTextLines2[i2].split(";");

  item2.ref = fields2[0];
  item2.town = fields2[1];

  fiches2.push(item2); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
}

fs1.writeFileSync(
  "../data/ListeFichesClimatiques.json",
  JSON.stringify(fiches2, null, 2)
); // Création du json final sur disque
