const $ = (id) => document.getElementById(id);

const chf = (x) =>
  x.toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " CHF";

// 707.6 minutes → "11 h 48"
const duree = (minutes) => {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};

function lireNombre(texte) {
  const n = parseFloat(String(texte).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function remplirDetail(table, f) {
  const pct = (t) => (t * 100).toLocaleString("fr-CH", { maximumFractionDigits: 3 }) + " %";
  const lignes = [
    [`Salaire horaire (${f.heures.toLocaleString("fr-CH")} h × ${f.tauxHoraire.toFixed(2)})`, f.salaireHoraire],
    ["Vacances 8,33 %", f.vacances],
    ["Jours fériés 0,42 %", f.joursFeries],
    ["Nettoyage vêtements", f.nettoyage],
    ["Salaire brut", f.brut, "total"],
    ...f.deductions.map((d) => [
      d.taux ? `${d.nom} ${pct(d.taux)}`
        : `LPP <small>(salaire assuré ${Math.round(f.coordonne).toLocaleString("fr-CH")}/an)</small>`,
      -d.montant,
    ]),
    ["Salaire net", f.net, "total"],
  ];
  table.innerHTML = lignes
    .map(([l, m, c]) => `<tr class="${c || ""}"><td>${l}</td><td>${chf(m)}</td></tr>`)
    .join("");
}

function mettreAJour() {
  const heures = lireNombre($("heures").value);
  const avecLpp = $("lpp").checked;
  $("bloc-lpp").hidden = !avecLpp;

  if (!heures) {
    $("resultat").hidden = true;
    return;
  }

  let lpp = false;
  if (avecLpp) {
    const age = document.querySelector('input[name="age"]:checked').value;
    lpp = { taux: TAUX_LPP_AGE[age] };
  }

  const lausanne = calculerFiche(heures, TAUX.lausanne, lpp);
  const geneve = calculerFiche(heures, TAUX.geneve, lpp);

  $("lausanne-brut").textContent = chf(lausanne.brut);
  $("lausanne-net").textContent = chf(lausanne.net);
  $("geneve-brut").textContent = chf(geneve.brut);
  $("geneve-net").textContent = chf(geneve.net);
  remplirDetail($("lausanne-detail"), lausanne);
  remplirDetail($("geneve-detail"), geneve);

  const diffNet = geneve.net - lausanne.net;
  $("diff-net").textContent = chf(diffNet);
  $("diff-brut").textContent = `(${chf(geneve.brut - lausanne.brut)} brut)`;
  $("diff-annee").textContent = chf(diffNet * 12);

  // Heures offertes : la part de chaque heure qu'un salaire genevois aurait payée en plus
  // (1 − 21.45 / 24.60 ≈ 12.8 %, soit environ 1 heure sur 8).
  const partOfferte = 1 - TAUX.lausanne / TAUX.geneve;
  $("heures-offertes").textContent = duree(heures * partOfferte * 60);
  $("une-sur").textContent = Math.round(1 / partOfferte);
  $("par-heure").textContent = chf(TAUX.geneve - TAUX.lausanne);

  const minutesAnnee = heures * partOfferte * 60 * 12;
  $("heures-annee").textContent = `${Math.round(minutesAnnee / 60)} h`;
  const jours = Math.round(minutesAnnee / 60 / 8);
  $("jours-annee").textContent = `${jours} jour${jours > 1 ? "s" : ""}`;
  $("resultat").hidden = false;
}

$("heures").addEventListener("input", mettreAJour);

// Sur téléphone : le clavier se ferme tout seul quand on a fini de taper les heures
// (1,2 s sans frappe), ou tout de suite avec la touche OK / Entrée.
const ecranTactile = window.matchMedia("(pointer: coarse)").matches;
let minuteurClavier;
function fermerClavier() {
  clearTimeout(minuteurClavier);
  if (document.activeElement === $("heures")) $("heures").blur();
}
$("heures").addEventListener("input", () => {
  clearTimeout(minuteurClavier);
  if (ecranTactile && lireNombre($("heures").value)) minuteurClavier = setTimeout(fermerClavier, 1200);
});
$("heures").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); fermerClavier(); }
});
$("lpp").addEventListener("change", mettreAJour);
document.querySelectorAll('input[name="age"]').forEach((r) => r.addEventListener("change", mettreAJour));

// Ouvrir le détail d'une ville ouvre aussi l'autre, pour comparer ligne par ligne.
const details = document.querySelectorAll(".comparaison details");
details.forEach((d) =>
  d.addEventListener("toggle", () =>
    details.forEach((autre) => { if (autre.open !== d.open) autre.open = d.open; })
  )
);
mettreAJour();

// Bouton de partage : menu de partage du téléphone, sinon copie du lien.
$("partager").addEventListener("click", async () => {
  const lien = location.href.split("#")[0].split("?")[0];
  const texte = "Même travail, même salaire. Regarde combien le Coq te plume chaque mois :";
  if (navigator.share) {
    try { await navigator.share({ title: document.title, text: texte, url: lien }); } catch (e) { /* annulé */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(texte + " " + lien);
  } catch (e) {
    window.prompt("Copie ce lien :", lien);
    return;
  }
  $("copie").hidden = false;
  setTimeout(() => { $("copie").hidden = true; }, 4000);
});
