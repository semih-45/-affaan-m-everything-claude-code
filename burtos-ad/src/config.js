/* ============================================================
   BURTOS — CONFIGURATION DE LA PUBLICITÉ
   Tout ce qui est modifiable sans toucher aux animations :
   textes, produits, photos, prix, coordonnées, minutage.
   ============================================================ */
(function (root) {
  const P = 'assets/products/';
  root.BURTOS = {
    fps: 30,
    duration: 40,

    brand: {
      name: 'BURTOS',
      logoText: 'BUR-TOS',            // texte du logo vectoriel
      logoSub: 'LIVRAISON DE NUIT',
      logoImage: '',                  // ex. 'assets/logo.png' (PNG transparent) pour utiliser le logo officiel
      phone: '06 42 55 24 72',
      snapchat: 'BUR-TOS45',
      instagram: '',                  // ex. '@burtos45' — laissé vide tant que non fourni
      hours: 'OUVERT DE 20H À 05H',
      zone: 'ORLÉANS ET ALENTOURS',
    },

    showDisclaimers: true,            // mentions « mise en situation » (scènes 3 et 4)

    /* ---------- SCÈNE 2 : produits (ordre = ordre de défilement) ---------- */
    products: [
      { name: 'POULET MERGUEZ', category: 'TACOS', price: '8€', image: P + 'poulet-merguez.jpg',
        ingredients: ['Poulet curry', 'Merguez', 'Frites', 'Sauce samouraï', 'Sauce fromagère'] },
      { name: 'LE BIG STATES', category: 'BURGER', price: '8€', image: P + 'big-states.jpg',
        ingredients: ['Double steak', 'Cheddar', 'Bacon de bœuf', 'Oignon rings', 'Sauce Big M'] },
      { name: 'VIANDE TENDERS', category: 'TACOS', price: '8€', image: P + 'viande-tenders.jpg',
        ingredients: ['Viande hachée', 'Tenders', 'Frites', 'Sauce biggy', 'Sauce fromagère'] },
      { name: 'LE SPICY', category: 'BURGER', price: '8€', image: P + 'spicy.jpg',
        ingredients: ['Double steak cheddar', 'Bacon de bœuf', 'Jalapeños', 'Sauce biggy'] },
      { name: 'CORDON-BLEU TENDERS', category: 'TACOS', price: '8€', image: P + 'cordon-bleu-tenders.jpg',
        ingredients: ['Cordon-bleu', 'Tenders', 'Frites', 'Sauce biggy', 'Sauce fromagère'] },
      { name: 'VIANDE HACHÉE POULET CURRY', category: 'TACOS', price: '8€', image: P + 'viande-hachee-poulet-curry.jpg',
        ingredients: ['Viande hachée', 'Poulet curry', 'Frites', 'Sauce biggy', 'Sauce fromagère'] },
    ],

    /* ---------- SCÈNE 3 : conversation ---------- */
    chat: [
      { from: 'client', text: 'Bonsoir, j’aimerais commander sur Orléans un tacos et trois burgers.' },
      { from: 'burtos', text: 'Bonsoir ! Avec plaisir 😁 Vous êtes situé où ?' },
      { from: 'client', text: 'Avenue de la République, à Orléans.' },
      { from: 'burtos', text: 'Parfait ! Votre commande arrive dans environ 10 minutes 🔥' },
      { from: 'client', text: 'Top, merci beaucoup !' },
    ],

    /* ---------- SCÈNE 4 : avis (exemples à remplacer par de vrais avis) ---------- */
    reviews: [
      { name: 'LOLA', text: 'Top, hyper bon et bien chaud !' },
      { name: 'KARIM', text: 'Livreur très aimable, rapide et efficace !' },
      { name: 'DÉBORAH', text: 'Merci de sauver nos fins de nuit ❤️' },
    ],

    /* ---------- SCÈNE 5 : carte ---------- */
    zones: [
      { name: 'ORLÉANS', lat: 47.9029, lon: 1.9093, main: true },
      { name: 'SARAN', lat: 47.951, lon: 1.876 },
      { name: 'FLEURY-LES-AUBRAIS', lat: 47.933, lon: 1.918 },
    ],
    /* communes desservies affichées dans le rayon (label: 'bas' = étiquette sous le point) */
    towns: [
      { name: 'ARTENAY', lat: 48.083, lon: 1.878 },
      { name: 'PATAY', lat: 48.048, lon: 1.695 },
      { name: 'NEUVILLE-AUX-BOIS', lat: 48.068, lon: 2.054, label: 'bas' },
      { name: 'CHÂTEAUNEUF', lat: 47.865, lon: 2.218, label: 'bas' },
      { name: 'JARGEAU', lat: 47.866, lon: 2.123 },
      { name: 'LA FERTÉ-SAINT-AUBIN', lat: 47.717, lon: 1.940, label: 'bas' },
      { name: 'BEAUGENCY', lat: 47.778, lon: 1.632, label: 'bas' },
    ],
    radiusKm: 30,
    mapInfo: ['LIVRAISON GRATUITE', '7J/7', 'MINIMUM DE COMMANDE SELON LA DISTANCE'],

    /* ---------- Textes ---------- */
    text: {
      slogan1: 'NE LAISSE PAS TON *VENTRE VIDE* AVANT DE DORMIR !',
      slogan2: 'BURTOS, LA MEILLEURE FAÇON DE *SAVOURER LA NUIT.*',
      menuTitle: 'CHOISIS TON SANDWICH',
      menuEnd: 'TACOS GÉNÉREUX. *BURGERS GOURMANDS.*',
      chatTitle: ['UNE PETITE', 'FAIM ?'],
      chatSub: 'Quelques messages suffisent.',
      chatConfirm: 'COMMANDE CONFIRMÉE',
      chatEta: 'ARRIVÉE ≈ 10 MIN',
      chatDisclaimer: 'Mise en situation illustrative',
      reviewsTitle: 'NOS CLIENTS EN PARLENT *MIEUX QUE NOUS*',
      reviewsDisclaimer: 'Exemples d’avis — mise en situation',
      mapRegion: 'CENTRE-VAL DE LOIRE',
      mapRadius: 'LIVRAISON JUSQU’À 30 KM AUTOUR D’ORLÉANS',
      outroSlogan: 'LA NUIT EST PLUS *GOURMANDE* AVEC BURTOS !',
    },

    /* ---------- Minutage (secondes) — calé sur 120 BPM (1 temps = 0,5 s) ---------- */
    T: { intro: [0, 6], menu: [6, 14], chat: [14, 20.5], reviews: [20.5, 25.5], map: [25.5, 35], outro: [35, 40] },
    cuts: [ { t: 6, type: 'flash' }, { t: 14, type: 'wipe' }, { t: 20.5, type: 'wipe' }, { t: 25.5, type: 'wipe' }, { t: 35, type: 'flash' } ],
    cues: {
      light: 0.5, impact: 2.0, slogan1: 3.0, slogan2: 4.4,
      select: [6.5, 7.5, 8.5, 9.5, 10.5, 11.5], menuEnd: 12.5,
      chat: [14.9, 16.0, 17.0, 18.0, 19.0], confirm: 19.5,
      reviews: [21.0, 22.0, 23.0],
      mapZoom: [25.5, 26.15], points: [26.15, 26.6, 27.2], circle: 28.3, info: [30.0, 30.8, 31.4],
      outroLogo: 35.15, outroLines: [36.0, 36.5], outroSlogan: 37.2, outroContacts: 38.0,
    },
    vo: [ ['vo1', 1.3], ['vo2', 6.4], ['vo3', 14.4], ['vo4', 20.8], ['vo5', 25.7], ['vo6', 35.1] ],
    scenes: [],
  };
  if (typeof module !== 'undefined') module.exports = root.BURTOS;
})(typeof window !== 'undefined' ? window : globalThis);
