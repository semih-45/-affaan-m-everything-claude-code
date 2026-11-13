/* ============================================================
   BURTOS — CONTENU DE LA PUBLICITÉ
   Tout ce qui est modifiable sans toucher au code est ici :
   produits, textes, avis, communes, coordonnées, minutage.
   Après modification : relancer  ./outils/tout-generer.sh
   ============================================================ */
window.BURTOS_CONFIG = {
  duree: 35,          // secondes
  fps: 30,

  // Minutage des 6 scènes [début, fin] en secondes (calé sur 120 BPM : 1 temps = 0,5 s)
  scenes: {
    intro:     [0, 5],
    selection: [5, 13],
    telephone: [13, 18.5],
    avis:      [18.5, 23],
    carte:     [23, 30],
    final:     [30, 35],
  },

  marque: {
    nom: 'BUR-TOS',
    logo: '../assets/logo/logo-rond.png',
    accroche: 'NE LAISSE PAS TON *VENTRE* *VIDE* AVANT DE DORMIR !',   // *mot* = mot en jaune
    depuis: "SUR LES ROUTES D'ORLÉANS DEPUIS 2023",
    horaires: ['20H00', '05H00'],
    zone: 'ORLÉANS ET ALENTOURS',
    jours: '7J/7',
    slogan: 'LA NUIT EST PLUS *GOURMANDE* AVEC *BURTOS\u00a0!*',
  },

  // Coordonnées affichées (laisser '' pour masquer une ligne)
  contact: {
    telephone: '06 42 55 24 72',
    snapchat: 'BUR-TOS45',
    instagram: '',            // ex. '@burtos45' — s'affiche automatiquement si renseigné
  },

  // SCÈNE 2 — Produits (ordre = ordre de défilement). 1 produit = 1 seconde.
  // Pour remplacer un produit : changer photo / nom ; prix: '' = pas de prix affiché.
  // stats = jauges décoratives (0 à 1).
  produits: [
    { nom: 'POULET MERGUEZ',             categorie: 'TACOS',  photo: '../assets/produits/poulet-merguez.jpg',             prix: '', stats: [0.92, 0.95, 0.85] },
    { nom: 'LE MONTAGNARD',              categorie: 'BURGER', photo: '../assets/produits/le-montagnard.jpg',              prix: '', stats: [0.97, 0.90, 0.93] },
    { nom: 'VIANDE TENDERS',             categorie: 'TACOS',  photo: '../assets/produits/viande-tenders.jpg',             prix: '', stats: [0.90, 0.98, 0.88] },
    { nom: 'LE BIG STATES',              categorie: 'BURGER', photo: '../assets/produits/le-big-states.jpg',              prix: '', stats: [0.95, 0.99, 0.86] },
    { nom: 'CORDON-BLEU TENDERS',        categorie: 'TACOS',  photo: '../assets/produits/cordon-bleu-tenders.jpg',        prix: '', stats: [0.96, 0.93, 0.97] },
    { nom: 'LE SPICY',                   categorie: 'BURGER', photo: '../assets/produits/le-spicy.jpg',                   prix: '', stats: [0.91, 0.89, 0.99] },
    { nom: 'VIANDE HACHÉE POULET CURRY', categorie: 'TACOS',  photo: '../assets/produits/viande-hachee-poulet-curry.jpg', prix: '', stats: [0.94, 0.97, 0.90] },
  ],
  statsNoms: ['GOURMANDISE', 'GÉNÉROSITÉ', 'FONDANT'],
  selectionTitre: 'CHOISIS TON BURTOS',

  // SCÈNE 3 — Conversation (mise en situation)
  conversation: [
    { de: 'client', texte: "Bonsoir, j'aimerais commander un tacos et trois burgers sur Orléans." },
    { de: 'burtos', texte: 'Bonsoir ! Avec plaisir 😁 Vous êtes situé où ?' },
    { de: 'client', texte: 'Avenue de la République, à Orléans.' },
    { de: 'burtos', texte: "Parfait ! On s'occupe de vous !" },
    { de: 'client', texte: 'Top, merci beaucoup !' },
  ],
  conversationTitres: ['UNE PETITE FAIM ?', 'QUELQUES MESSAGES SUFFISENT,', "BURTOS S'OCCUPE DU RESTE !"],
  mentionSituation: 'MISE EN SITUATION',

  // SCÈNE 4 — Avis (EXEMPLES : à remplacer par de vrais témoignages autorisés avant diffusion)
  avisTitre: 'ET NOS CLIENTS EN PARLENT *MIEUX* *QUE* *NOUS* !',
  avis: [
    { nom: 'LOLA',    etoiles: 5, texte: 'Top, hyper bon et bien chaud !' },
    { nom: 'KARIM',   etoiles: 5, texte: 'Livreur très aimable, rapide et efficace !' },
    { nom: 'DÉBORAH', etoiles: 5, texte: 'Merci de sauver nos faims de nuit ❤️' },
  ],

  // SCÈNE 5 — Carte. lat/lon réels ; etq = côté de l'étiquette (h haut, b bas, g gauche, d droite)
  carte: {
    centre: { nom: 'ORLÉANS', lat: 47.9029, lon: 1.9093 },
    rayonKm: 30,
    proches: [
      { nom: 'SARAN',                    lat: 47.951, lon: 1.876, etq: 'g' },
      { nom: 'SAINT-JEAN-DE-BRAYE',      lat: 47.913, lon: 1.972, etq: 'd' },
      { nom: 'OLIVET',                   lat: 47.863, lon: 1.900, etq: 'b' },
      { nom: 'INGRÉ',                    lat: 47.920, lon: 1.826, etq: 'g' },
      { nom: 'FLEURY-LES-AUBRAIS',       lat: 47.933, lon: 1.918, etq: 'd' },
      { nom: 'CHÉCY',                    lat: 47.894, lon: 2.027, etq: 'b' },
      { nom: 'SAINT-PRYVÉ-SAINT-MESMIN', lat: 47.882, lon: 1.868, etq: 'b' },
      { nom: 'SEMOY',                    lat: 47.934, lon: 1.955, etq: 'h' },
      { nom: 'SAINT-JEAN-DE-LA-RUELLE',  lat: 47.913, lon: 1.866, etq: 'g' },
    ],
    lointaines: [
      { nom: 'ARTENAY',               lat: 48.082, lon: 1.878, etq: 'h' },
      { nom: 'LA FERTÉ-SAINT-AUBIN',  lat: 47.717, lon: 1.940, etq: 'b' },
      { nom: 'JARGEAU',               lat: 47.866, lon: 2.123, etq: 'b' },
      { nom: 'PATAY',                 lat: 48.048, lon: 1.695, etq: 'h' },
      { nom: 'CHÂTEAUNEUF-SUR-LOIRE', lat: 47.865, lon: 2.218, etq: 'h' },
      { nom: 'BEAUGENCY',             lat: 47.778, lon: 1.632, etq: 'b' },
      { nom: 'NEUVILLE-AUX-BOIS',     lat: 48.068, lon: 2.053, etq: 'h' },
      { nom: "SAINT-MARTIN-D'ABBAT",  lat: 47.857, lon: 2.268, etq: 'b' },
    ],
    titre: 'ZONE DE LIVRAISON',
    lignes: ["JUSQU'À", '30 KM', "AUTOUR D'ORLÉANS"],
    tampon: 'LIVRAISON 100 % GRATUITE*',
    note: '*Minimum de commande possible selon la distance',
  },
};
