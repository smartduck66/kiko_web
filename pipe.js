// Squelette de pipeline d'intégration (plus évolué : utiliser gulp.js)
// Utilisation : 'node pipe' à la racine
// 10/01/2022 : la 'parallélisation' n'apporte a priori pas grand chose

const fs = require("fs");

const child_process = require("child_process");
let tsc1 = child_process.execSync("tsc assets/js/kiko.ts");
let tsc2 = child_process.execSync("tsc assets/js/kiko_init.ts");
let tsc3 = child_process.execSync("tsc assets/js/distances.ts");
let tsc4 = child_process.execSync("tsc assets/js/csv_to_json.ts");

let tsc5 = child_process.execSync("npx prettier --write .");


// Suppression de la ligne '...require("../js/distances.js' dans le fichier kiko.js généré par tsc
const code_lines = [];
const filename = "./assets/js/kiko.js";
const lineReader = require("readline").createInterface({
  // Nouveau package depuis Node 4.0.0 qui facilite la lecture d'un fichier ligne à ligne
  input: require("fs").createReadStream(filename),
});

lineReader.on("line", function (line_read) {
  if (line_read != 'var distances = require("../js/distances.js");') {
    code_lines.push(line_read);
  }
});

lineReader.on("close", function () {
  // Réécriture du fichier source sur disque
  let output = fs.createWriteStream("./assets/js/kiko.js");
  for (let i = 0; i < code_lines.length; i++) {
    output.write(code_lines[i] + "\n");
  }
  output.end();
});
