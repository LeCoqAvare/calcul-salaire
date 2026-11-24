// Tests du calcul (exemples inventés). Lancer avec : node test.js
const { calculerFiche, LPP, TAUX, TAUX_LPP_AGE } = require("./calcul.js");

const auto = { taux: LPP.tauxEmploye };
const cas = [
  // Sans LPP
  { heures: 100, taux: TAUX.lausanne, lpp: false, brut: 2352.30, net: 2174.60 },
  { heures: 100, taux: 24.60, lpp: false, brut: 2695.25, net: 2491.40 },
  // LPP auto, salaire assuré minimal des deux côtés → même LPP
  { heures: 60, taux: TAUX.lausanne, lpp: auto, brut: 1419.40, net: 1302.20 },
  { heures: 60, taux: 24.60, lpp: auto, brut: 1625.15, net: 1492.30 },
  // LPP auto, salaire assez haut → LPP plus élevée à Genève
  { heures: 130, taux: TAUX.lausanne, lpp: auto, brut: 3052.00, net: 2793.05 },
  { heures: 130, taux: 24.60, lpp: auto, brut: 3497.85, net: 3189.95 },
  // Taux selon l'âge, salaire assuré minimal (3 780/an)
  { heures: 60, taux: TAUX.lausanne, lpp: { taux: TAUX_LPP_AGE[18] }, brut: 1419.40, lppAttendu: 1.10 },
  { heures: 60, taux: TAUX.lausanne, lpp: { taux: TAUX_LPP_AGE[25] }, brut: 1419.40, lppAttendu: 10.60 },
  { heures: 60, taux: TAUX.lausanne, lpp: { taux: TAUX_LPP_AGE[35] }, brut: 1419.40, lppAttendu: 15.15 },
  { heures: 60, taux: TAUX.lausanne, lpp: { taux: TAUX_LPP_AGE[45] }, brut: 1419.40, lppAttendu: 22.70 },
  { heures: 60, taux: TAUX.lausanne, lpp: { taux: TAUX_LPP_AGE[55] }, brut: 1419.40, lppAttendu: 27.25 },
];

let ok = true;
for (const c of cas) {
  const r = calculerFiche(c.heures, c.taux, c.lpp);
  const lpp = r.deductions.find((d) => d.nom === "LPP")?.montant ?? 0;
  const bon = Math.abs(r.brut - c.brut) < 0.001 &&
    (c.net === undefined || Math.abs(r.net - c.net) < 0.001) &&
    (c.lppAttendu === undefined || Math.abs(lpp - c.lppAttendu) < 0.001);
  ok = ok && bon;
  console.log(`${bon ? "OK " : "ERR"} ${c.heures} h à ${c.taux} : brut ${r.brut.toFixed(2)}, LPP ${lpp.toFixed(2)}, net ${r.net.toFixed(2)}`);
}
process.exit(ok ? 0 : 1);
