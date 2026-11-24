// Calcul d'une fiche de salaire horaire.
// Tous les montants sont arrondis aux 5 centimes, comme sur les fiches.

const TAUX = {
  // Taux effectif 21,4467 (= 64,34 / 3), affiché 21.45.
  lausanne: 64.34 / 3,
  geneve: 24.60,
};

const PARAMS = {
  vacances: 0.0833,        // Indemnité de vacances 8,33 %
  joursFeries: 0.0042,     // Indemnité jours fériés 0,42 %
  nettoyage: 20.00,        // Indemnité nettoyage des vêtements (non soumise aux cotisations)
  cotisations: [
    { nom: "AVS", taux: 0.053 },
    { nom: "AC", taux: 0.011 },
    { nom: "LPCFam", taux: 0.0009 },
    { nom: "AANP", taux: 0.00425 },
    { nom: "IJM", taux: 0.00705 },
  ],
};

// LPP (2e pilier) — montants légaux 2026 (OFAS)
const LPP = {
  deductionCoordination: 26460,  // CHF / an
  coordonneMin: 3780,            // CHF / an
  coordonneMax: 64260,           // CHF / an
  // Part employé estimée à 25-34 ans, en % du salaire coordonné (≈ 10.60 CHF/mois sur le salaire coordonné minimal).
  tauxEmploye: 0.03365,
};

// Taux employé estimé selon l'âge : le taux de base (25-34 ans) est mis à l'échelle
// des bonifications de vieillesse légales (7 / 10 / 15 / 18 %).
// Avant 25 ans, pas d'épargne vieillesse : seulement une petite cotisation risque (estimée).
const TAUX_LPP_AGE = {
  18: 0.0035,
  25: LPP.tauxEmploye,
  35: LPP.tauxEmploye * 10 / 7,
  45: LPP.tauxEmploye * 15 / 7,
  55: LPP.tauxEmploye * 18 / 7,
};

function arrondi5(x) {
  return Math.round(Math.round(x * 20) / 20 * 100) / 100;
}

function salaireDeBase(heures, tauxHoraire) {
  const salaireHoraire = arrondi5(heures * tauxHoraire);
  const vacances = arrondi5(salaireHoraire * PARAMS.vacances);
  const joursFeries = arrondi5(salaireHoraire * PARAMS.joursFeries);
  const brut = arrondi5(salaireHoraire + vacances + joursFeries + PARAMS.nettoyage);
  const baseCotisations = arrondi5(brut - PARAMS.nettoyage);
  return { salaireHoraire, vacances, joursFeries, brut, baseCotisations };
}

// Salaire coordonné annuel : salaire AVS du mois × 12, moins la déduction de coordination,
// borné entre le minimum et le maximum légaux.
function salaireCoordonne(baseMensuelle) {
  const annuel = baseMensuelle * 12;
  return Math.min(LPP.coordonneMax, Math.max(LPP.coordonneMin, annuel - LPP.deductionCoordination));
}

// lpp : false (pas de LPP) ou { taux } (part employé en % du salaire coordonné)
function calculerFiche(heures, tauxHoraire, lpp = false) {
  const b = salaireDeBase(heures, tauxHoraire);

  const deductions = PARAMS.cotisations.map((c) => ({
    nom: c.nom,
    taux: c.taux,
    montant: arrondi5(b.baseCotisations * c.taux),
  }));

  let coordonne = null;
  if (lpp) {
    coordonne = salaireCoordonne(b.baseCotisations);
    deductions.push({ nom: "LPP", taux: null, montant: arrondi5(coordonne * lpp.taux / 12) });
  }

  const totalDeductions = arrondi5(deductions.reduce((s, d) => s + d.montant, 0));
  const net = arrondi5(b.brut - totalDeductions);

  return {
    heures, tauxHoraire, ...b, nettoyage: PARAMS.nettoyage,
    coordonne, deductions, totalDeductions, net,
  };
}

if (typeof module !== "undefined")
  module.exports = { TAUX, PARAMS, LPP, TAUX_LPP_AGE, arrondi5, salaireCoordonne, calculerFiche };
