# Combien le Coq t'a plumé ce mois-ci ?

Lausanne **21,45 CHF/h**, Genève **24,60 CHF/h**. Même travail.

Tu entres tes heures du mois, tu coches si tu cotises à la LPP (le site demande alors ton âge), et le site affiche :
- la différence nette et brute ce mois-ci,
- les heures non payées comparé à Genève (≈ 1 heure sur 8),
- la différence sur un an, en francs, en heures et en jours,
- les deux fiches complètes côte à côte.

Pensé d'abord pour le téléphone. Aucune donnée n'est envoyée : tout est calculé dans le navigateur.
## Méthode de calcul

Arrondi aux 5 centimes :

| Élément | Taux |
|---|---|
| Indemnité de vacances | 8,33 % du salaire horaire |
| Indemnité jours fériés | 0,42 % du salaire horaire |
| Nettoyage des vêtements | 20 CHF (non soumis aux cotisations) |
| AVS | 5,3 % |
| AC | 1,1 % |
| LPCFam | 0,09 % |
| AANP | 0,425 % |
| IJM | 0,705 % |
| LPP (si cochée) | calculée selon l'âge, voir ci-dessous |

### LPP (2e pilier)

Calculée pour chaque tarif, avec les montants légaux 2026 :

- salaire annuel = salaire AVS du mois × 12 ;
- salaire assuré = salaire annuel − 26 460 CHF, au minimum 3 780 CHF et au maximum 64 260 CHF ;
- LPP du mois = salaire assuré × taux employé ÷ 12. Le taux est estimé selon l'âge choisi (un tap) : 3,365 % à 25-34 ans, mis à l'échelle des bonifications légales (7 / 10 / 15 / 18 %) pour les autres tranches, 0,35 % avant 25 ans (cotisation risque seulement).

Pour la plupart des temps partiels, le salaire assuré est le minimum des deux côtés, donc la LPP est la même à Lausanne et à Genève. Au-delà d'environ 2 500 CHF brut par mois, elle augmente avec le salaire.

Tests : `node test.js`.

Pour changer un taux, modifie `TAUX` ou `PARAMS` dans `calcul.js`.

## Mettre le site en ligne (GitHub Pages)

1. Sur GitHub, va dans **Settings → Pages**.
2. Dans *Source*, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
3. Après une minute, le site est disponible à l'adresse `https://<ton-pseudo>.github.io/<nom-du-depot>/`.

## Fichiers

- `index.html` : la page
- `style.css` : le design (mobile d'abord, deux colonnes sur ordinateur)
- `calcul.js` : le calcul de la fiche
- `app.js` : la logique de la page
- `test.js` : tests du calcul
- `coq.png` : l'illustration (tramée en bitmap)
