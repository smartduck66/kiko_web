// Utilitaire "mode batch" (node csv_to_json.js) permettant de créer des fichiers json à partir de fichiers csv 'open data'
// ************************************************************************************************************************

// Transformation d'un fichier CSV des communes françaises (https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/)
// en un fichier json contenant le nom, la latitude et la longitude de chaque commune française référencée
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
// en un fichier json contenant la latitude, la longitude, le nom de l'usine et la commune hébergeant chaque site classé seveso

class seveso {
  latitude: number;
  longitude: number;
  nom: string;
  commune: string;
  statut_seveso: string;
  site: string;

  constructor() {
    this.latitude = 0;
    this.longitude = 0;
    this.nom = "";
    this.commune = "";
    this.statut_seveso = "";
    this.site = "";
  }
}

const fiches1: seveso[] = [];

// Balayage du fichier csv, enrichissement de l'Array fiches, création du JSON sur disque
const text1 = fs1.readFileSync("../data_source/sites-seveso.csv", "utf8");
const allTextLines1 = text1.split(/\r\n|\n/);

for (let i = 0; i < allTextLines1.length; i++) {
  const item = new seveso(); // note the "new" keyword here

  const fields = allTextLines1[i].split(";");

  const coords = fields[0].split(",");
  item.latitude = Number(coords[0]);
  item.longitude = Number(coords[1]);
  item.nom = fields[2];
  item.commune = fields[3];
  item.statut_seveso = fields[12];
  item.site =
    "Sté " + item.nom + " à " + item.commune + " - " + item.statut_seveso;

  fiches1.push(item); // Enrichissement du 'vecteur' contenant l'ensemble des fiches
}

fs1.writeFileSync("../data/seveso.json", JSON.stringify(fiches1, null, 2)); // Création du json final sur disque
