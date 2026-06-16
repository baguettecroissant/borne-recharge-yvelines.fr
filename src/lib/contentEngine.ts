// Programmatic Content Engine - Yvelines (78) - Borne de Recharge
// Generates highly unique, localized, helpful content for each commune in the Yvelines department.
// Uses a multi-dimensional sentence-level spintax matrix to avoid duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for local search queries in 78.

import communes from '../data/communes.json';

export function spin(text: string, seed: string): string {
  let result = text;
  const spintaxTest = /{([^{}|]+\|[^{}]+)}/;
  const spintaxReplace = /{([^{}|]+\|[^{}]+)}/g;
  
  while (spintaxTest.test(result)) {
    result = result.replace(spintaxReplace, (match, choicesStr) => {
      if (['VILLE', 'CODE_POSTAL', 'PRIX_MIN', 'PRIX_MAX', 'VARIANTE_INTRO'].includes(choicesStr)) {
        return match;
      }
      const choices = choicesStr.split('|');
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      hash = hash + choicesStr.length;
      const index = Math.abs(hash) % choices.length;
      return choices[index];
    });
  }
  return result;
}

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
  altitude?: number;
  prixM2Moyen?: number;
  logements?: number;
  logementsMaison?: number;
  vehiculesElectriques?: number;
  croissanceVE?: number;
  bornesPubliques?: number;
  intercommunalite?: string;
  canton?: string;
  latitude?: number;
  longitude?: number;
  distanceVersailles?: number; // distance to Versailles
  densiteBornes?: number;
  profilCommune?: string;
  marcheImmobilier?: string;
  tauxMaisonLabel?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  description: string;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface LocalContent {
  introParagraph: string;
  logisticsAlert: string;
  useCaseText: string;
  pricesContext: string;
  faqItems: { question: string; answer: string }[];
  ecoText: string;
  localContext: string;
  climateZoneLabel: string;
  localAgencyName: string;
  externalLinks: ExternalLink[];
  communeDataInsight: string;
  expertTip: string;
  tableIntro: string;
  guideLinks: GuideLink[];
  savingsEstimate: string;
  lastUpdated: string;
  realEstateInsight: string;
  populationTierContent: string;
  densiteAnalysis: string;
  marcheImmobilierInsight: string;
  distanceLyonContext: string;
  anecdotePatrimoine: string;
  localRegulation: string;
  sourcesCitation: string;
  mobiliteContext: string;
  specificiteElectrique: string;
}

export type ClimateZone = 'seine-valley' | 'versailles-plateau' | 'rambouillet-forest';

export function getClimateZone(codePostal: string, slug: string): ClimateZone {
  const cp = codePostal.trim();
  
  if (cp.startsWith('78200') || cp.startsWith('78300') || cp.startsWith('78700') || cp.startsWith('78130') || slug === 'poissy' || slug === 'conflans-sainte-honorine') {
    return 'seine-valley';
  }
  if (cp.startsWith('78120') || cp.startsWith('78610') || cp.startsWith('78730') || slug === 'rambouillet') {
    return 'rambouillet-forest';
  }
  return 'versailles-plateau';
}

export function getLocalAgency(codePostal: string, slug: string): { name: string; detail: string; website: string } {
  const cp = codePostal.trim();
  if (cp.startsWith('78180') || cp.startsWith('78280') || cp.startsWith('78190') || slug.includes('montigny') || slug === 'guyancourt') {
    return {
      name: "l'ALEC de Saint-Quentin-en-Yvelines",
      detail: "le conseiller officiel de la transition énergétique pour l'agglomération de SQY",
      website: "alec-sqy.org"
    };
  }
  return {
    name: "l'Espace Conseil France Rénov' des Yvelines (animé par l'ADIL 78)",
    detail: "le service public d'accompagnement de la transition énergétique dans le 78",
    website: "yvelines.fr"
  };
}

export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  // FNV-1a inspired hash with proper offset mixing
  let hash = 2166136261; // FNV offset basis
  // Mix in the offset first
  hash = Math.imul(hash ^ offset, 16777619);
  hash = Math.imul(hash ^ (offset >>> 16), 2654435761);
  // Mix in each character of the slug
  for (let i = 0; i < slug.length; i++) {
    hash = Math.imul(hash ^ slug.charCodeAt(i), 16777619);
  }
  // Final avalanche — ensures each bit of offset affects the result
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  return (hash >>> 0) % maxVariants;
}

export function getDynamicPrices(commune: Commune) {
  let priceFactor = 1.0;
  
  if (commune.population > 80000) priceFactor += 0.04; // large communes
  else if (commune.population > 25000) priceFactor += 0.02;
  
  if (commune.prixM2Moyen) {
    if (commune.prixM2Moyen > 7000) priceFactor += 0.08; // extremely premium (Versailles, Saint-Germain)
    else if (commune.prixM2Moyen > 5800) priceFactor += 0.04;
    else if (commune.prixM2Moyen < 3500) priceFactor -= 0.03; // accessible GPSEO
  }
  
  priceFactor = Math.max(0.90, Math.min(1.15, priceFactor));

  return {
    greenUp: { min: Math.round(450 * priceFactor), max: Math.round(800 * priceFactor) },
    wallbox7kW: { min: Math.round(1400 * priceFactor), max: Math.round(2000 * priceFactor) },
    wallbox11kW: { min: Math.round(1700 * priceFactor), max: Math.round(2500 * priceFactor) },
    wallbox22kW: { min: Math.round(2300 * priceFactor), max: Math.round(4000 * priceFactor) },
    copro: { min: Math.round(3000 * priceFactor), max: Math.round(5500 * priceFactor) },
    triUpgrade: { min: Math.round(500 * priceFactor), max: Math.round(1300 * priceFactor) },
    priceFactor
  };
}

export function getAnecdotePatrimoine(slug: string, nom: string): string {
  if (slug === 'versailles' || slug === 'le-chesnay-rocquencourt' || slug === 'viroflay') {
    return "Versailles, ville royale renommée pour son Château, son quartier historique Saint-Louis et ses avenues arborées tracées sous Louis XIV, est aujourd'hui à la pointe de la mobilité durable. L'installation d'une borne de recharge dans les zones de protection du patrimoine mondial requiert une attention minutieuse et, dans certains cas historiques, l'avis des Architectes des Bâtiments de France (ABF) pour préserver l'esthétique des façades meulières ou des cours intérieures d'époque.";
  }
  if (slug === 'saint-germain-en-laye' || slug === 'le-vesinet' || slug === 'marly-le-roi' || slug === 'le-pecq') {
    return `Saint-Germain-en-Laye, célèbre pour sa forêt domaniale, sa Grande Terrasse dessinée par André Le Nôtre et son château vieux, abrite de superbes propriétés bourgeoises. Dans les allées résidentielles du Vésinet ou les propriétés de Saint-Germain, la wallbox s'intègre discrètement dans les grands garages ou sur les carports en bois, répondant aux exigences esthétiques d'un cadre de vie d'exception tout en alimentant les berlines des cadres naviguant vers La Défense.`;
  }
  if (slug === 'poissy' || slug === 'acheres' || slug === 'conflans-sainte-honorine') {
    return `Poissy, terre d'histoire industrielle marquée par l'usine automobile historique Stellantis (ex-Simca/Peugeot) et le chef-d'œuvre architectural de la Villa Savoye signé Le Corbusier, incarne la fusion parfaite entre tradition mécanique et modernité. Dans cette zone de la vallée de la Seine, l'essor des motorisations électriques est particulièrement fort chez les professionnels de l'automobile et les navetteurs de la grande couronne.`;
  }
  if (slug === 'rambouillet' || slug === 'les-essarts-le-roi' || slug === 'saint-arnoult-en-yvelines') {
    return `Rambouillet, cité présidentielle lovée au cœur de sa majestueuse forêt royale et bordant le parc naturel de la Haute Vallée de Chevreuse, offre un havre de paix exceptionnel. Le relief et la dispersion des habitations dans le sud des Yvelines rendent l'autonomie électrique indispensable : avoir sa borne de recharge à domicile à ${nom} permet de sécuriser ses trajets quotidiens à travers les massifs forestiers et de rejoindre l'axe de la RN10 l'esprit tranquille.`;
  }
  if (slug === 'montigny-le-bretonneux' || slug === 'guyancourt' || slug === 'elancourt' || slug === 'voisins-le-bretonneux' || slug === 'trappes') {
    return `Saint-Quentin-en-Yvelines (SQY), pôle technologique majeur hébergeant le Technocentre Renault à Guyancourt, le Vélodrome National à Montigny et d'innombrables sièges sociaux, est la première agglomération francilienne à avoir pensé son aménagement pour la mobilité électrique. Les habitations contemporaines et les résidences standing y sont particulièrement bien adaptées au raccordement de bornes intelligentes (Smart Charging).`;
  }
  
  // Generic but local to 78 — 12 thematic anecdotes to maximize uniqueness
  const genericAnecdotes = [
    `Le département des Yvelines, s'étendant des rives de la Seine aux plaines agricoles du mantois, est caractérisé par un habitat pavillonnaire dense et des trajets pendulaires importants vers Paris et La Défense. L'installation d'une borne IRVE à domicile à ${nom} constitue la solution idéale pour les actifs qui souhaitent rentabiliser leur transition en rechargeant au meilleur tarif pendant les heures creuses d'Enedis.`,
    `Les propriétés résidentielles du 78, souvent dotées de grands garages ou de cours pavées, se prêtent idéalement à la pose d'une wallbox murale ou sur pied. À ${nom}, l'installation par un professionnel IRVE certifié valorise le patrimoine immobilier tout en garantissant une charge sécurisée sans risque de surchauffe pour le tableau électrique.`,
    `La transition vers le véhicule électrique dans les Yvelines est soutenue par des aides locales et nationales. À ${nom}, équiper sa maison individuelle ou sa copropriété d'une borne intelligente permet non seulement de réduire son empreinte carbone, mais aussi d'économiser jusqu'à 80 % sur sa facture énergétique de déplacement annuel par rapport à l'essence.`,
    `Les axes routiers structurants des Yvelines (A13, A86, N10, N12, A14) génèrent un flux quotidien de navetteurs considérable. Pour les résidents de ${nom}, disposer d'une borne de recharge à domicile transforme chaque nuit en une session de recharge économique, évitant les détours par les stations publiques souvent saturées aux heures de pointe.`,
    `L'habitat meulière, signature architecturale des Yvelines, caractérise de nombreuses propriétés à ${nom}. Ces maisons en pierre de meulière, dotées de caves voûtées et de garages attenants, offrent un cadre idéal pour l'intégration discrète d'une borne de recharge murale, conciliant patrimoine bâti et modernité électrique.`,
    `Les zones d'activités économiques des Yvelines (Technocentre Renault à Guyancourt, campus Thales, centre R&D de Stellantis, pôle Vélizy 2) drainent des milliers de cadres et d'ingénieurs. À ${nom}, ces professionnels technophiles sont parmi les premiers adopteurs du véhicule électrique et recherchent une solution de recharge fiable à domicile.`,
    `La forêt de Rambouillet, les boucles de la Seine et la plaine de Versailles composent le paysage naturel exceptionnel des Yvelines. À ${nom}, l'installation d'une borne de recharge en extérieur (allée, carport, pergola) doit impérativement respecter l'indice de protection IP65 pour résister aux conditions climatiques du plateau francilien.`,
    `Le réseau ferroviaire des Yvelines (Transilien lignes J, L, N, U et RER C) complète la mobilité des habitants, mais le véhicule électrique reste indispensable pour les trajets de rabattement vers les gares. À ${nom}, la combinaison train + VE rechargé à domicile constitue la solution multimodale la plus économique.`,
    `Les programmes immobiliers neufs livrés dans les Yvelines intègrent systématiquement un pré-câblage pour la recharge de véhicules électriques. À ${nom}, les propriétaires de maisons existantes ont tout intérêt à anticiper cette norme en faisant installer une wallbox par un artisan IRVE agréé pour maintenir la compétitivité de leur bien.`,
    `Le tissu associatif et les initiatives communales en faveur de la mobilité durable se multiplient dans les Yvelines. À ${nom}, les collectivités soutiennent l'installation de bornes de recharge résidentielles par le biais de permanences d'information et de partenariats avec les espaces France Rénov' locaux.`,
    `Les marchés dominicaux, les centres-villes commerçants et les équipements sportifs des Yvelines génèrent des déplacements de proximité fréquents. À ${nom}, recharger son véhicule électrique chaque nuit à domicile garantit une autonomie suffisante pour couvrir l'ensemble de ces trajets quotidiens sans anxiété de batterie.`,
    `La densité de population variable dans les Yvelines — des zones urbaines denses aux secteurs ruraux du sud — influence directement le maillage des bornes publiques. À ${nom}, investir dans une borne privée à domicile offre une indépendance totale vis-à-vis du réseau public et un coût au kilomètre divisé par 5 par rapport au thermique.`
  ];
  
  // Use improved hash to avoid collisions
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  hash = hash ^ (slug.length * 2654435761);
  return genericAnecdotes[Math.abs(hash) % genericAnecdotes.length];
}

function getExternalLinks(category: string, codePostal: string, slug: string): ExternalLink[] {
  const agency = getLocalAgency(codePostal, slug);
  const agencyUrl = agency.website.startsWith('http') ? agency.website : `https://www.${agency.website}`;
  const zone = getClimateZone(codePostal, slug);
  
  const base: ExternalLink[] = [
    {
      label: "Programme ADVENIR — Subventions Bornes de Recharge",
      url: "https://advenir.mobi",
      description: "Site officiel du programme ADVENIR détaillant les primes pour les particuliers, les syndics et les entreprises."
    },
    {
      label: `${agency.name} — Service Public local`,
      url: agencyUrl,
      description: "Accompagnement de proximité gratuit pour votre transition énergétique et aides financières dans les Yvelines."
    },
    {
      label: "Avere-France — Association nationale de mobilité électrique",
      url: "https://www.avere-france.org",
      description: "L'organisme de référence sur le marché de la mobilité propre : statistiques, livrets blancs et conseils pratiques."
    },
    {
      label: "Ministère de la Transition Écologique — Aides Nationales",
      url: "https://www.ecologie.gouv.fr/aides-lacquisition-dun-vehicule-propre-et-linstallation-dune-borne-recharge",
      description: "Le site officiel présentant toutes les aides à l'acquisition d'un véhicule propre et à l'installation de bornes de recharge."
    },
    {
      label: "Qualifelec — Annuaire des Électriciens qualifiés IRVE",
      url: "https://www.qualifelec.fr",
      description: "Vérifiez la qualification IRVE (Infrastructure de Recharge pour Véhicules Électriques) de votre électricien."
    },
    {
      label: "Enedis — Raccordement et Compteur Linky dans le 78",
      url: "https://www.enedis.fr/particuliers/raccordement-et-branchement",
      description: "Informations officielles du gestionnaire de réseau Enedis sur le raccordement électrique et les compteurs Linky dans les Yvelines."
    }
  ];

  if (category === 'copropriete') {
    return [
      ...base,
      {
        label: "Légifrance — Décret n° 2020-1720 (Droit à la prise)",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042740927",
        description: "Texte de loi officiel régissant le droit à la prise pour la recharge des véhicules électriques en copropriété."
      }
    ];
  } else if (category === 'wallbox') {
    return [
      ...base,
      {
        label: "Automobile Propre — Guide de la recharge à domicile",
        url: "https://www.automobile-propre.com",
        description: "Comparatifs indépendants, temps de charge et explications détaillées sur le fonctionnement des wallbox."
      }
    ];
  } else {
    const mainExtra: ExternalLink[] = [
      {
        label: "Service-Public.fr — Crédit d'impôt Borne de recharge",
        url: "https://www.service-public.fr/particuliers/vosdroits/F35535",
        description: "Fiche officielle décrivant les conditions pour bénéficier du crédit d'impôt de 500 € en 2026."
      }
    ];
    if (zone === 'versailles-plateau') {
      mainExtra.push({
        label: "Versailles Grand Parc — Écomobilité",
        url: "https://www.versaillesgrandparc.fr",
        description: "Informations officielles de la communauté d'agglomération sur les mobilités douces et la recharge électrique."
      });
    }
    return [...base, ...mainExtra];
  }
}

function getGuideLinks(category: string, slug: string = ''): GuideLink[] {
  const allGuides: GuideLink[] = [
    { href: '/guides/prix-borne-recharge-yvelines-2026/', label: 'Prix Borne Recharge Yvelines 2026', desc: 'Budget complet pour équiper votre logement dans le 78.' },
    { href: '/guides/aide-advenir-ile-de-france-mobilites-2026/', label: 'Aides ADVENIR & Région IDF', desc: 'Comment cumuler les subventions pour votre wallbox dans le 78.' },
    { href: '/guides/wallbox-compteur-linky-delestage-yvelines/', label: 'Linky & Délestage dynamique', desc: 'Optimiser la charge et éviter les disjonctions avec son compteur Linky.' },
    { href: '/guides/copropriete-versailles-irve-collective-syndic/', label: 'Copropriété à Versailles : IRVE collective', desc: 'Financer et faire voter l\'infrastructure de recharge en AG.' },
    { href: '/guides/trajet-yvelines-la-defense-vehicule-electrique/', label: 'Trajet Yvelines-La Défense en VE', desc: 'Calcul des économies réelles de carburant sur le trajet pendulaire quotidien.' },
    { href: '/guides/wallbox-grande-maison-puissance-7kw-11kw-22kw/', label: 'Guide de Puissance Wallbox', desc: 'Quelle puissance choisir entre 7kW monophasé, 11kW et 22kW triphasé.' },
    { href: '/guides/borne-recharge-exterieur-allee-carport-normes/', label: 'Installer sa borne en extérieur', desc: 'Normes NFC 15-100 et indice de protection IP65 pour allées gravillonnées.' },
    { href: '/guides/installateur-irve-yvelines-certification-choix/', label: 'Choisir son installateur IRVE', desc: 'Les certifications obligatoires et pièges à éviter lors des devis.' },
  ];

  const categoryPriority: Record<string, number[]> = {
    copropriete: [3, 0, 1],
    wallbox: [5, 2, 6],
    main: [0, 4, 7],
  };

  const prioritySet = new Set(categoryPriority[category] || [0, 4, 7]);
  const baseOffset = getVariantIndex(slug, 300, allGuides.length);
  
  const selected: GuideLink[] = [];
  const usedIndices = new Set<number>();
  
  const priorityArr = Array.from(prioritySet);
  const priorityIdx = priorityArr[getVariantIndex(slug, 310, priorityArr.length)];
  selected.push(allGuides[priorityIdx]);
  usedIndices.add(priorityIdx);
  
  let rotOffset = baseOffset;
  while (selected.length < 3) {
    const idx = rotOffset % allGuides.length;
    if (!usedIndices.has(idx)) {
      selected.push(allGuides[idx]);
      usedIndices.add(idx);
    }
    rotOffset++;
  }
  
  return selected;
}

// Spintax pools (Premium Yvelines tone)
const INTRO_POOLS: Record<string, string[]> = {
  main: [
    "Pour {l'installation|la pose} de votre borne de recharge à {VILLE}, {profitez|bénéficiez} d'une pose clés en main par nos techniciens certifiés IRVE. Nous réalisons une étude de conformité de votre tableau électrique pour garantir une charge {sûre|sécurisée} et performante pour votre maison individuelle ou copropriété.",
    "Besoin d'installer une borne pour votre véhicule électrique à {VILLE} ? Nos installateurs locaux des Yvelines vous accompagnent dans le choix d'une wallbox {haut de gamme|performante} et gèrent vos démarches d'aides financières ADVENIR.",
    "Sécurisez la charge de votre Tesla, BMW iX ou Audi e-tron à {VILLE} grâce à une wallbox {7 kW|22 kW} installée par un électricien IRVE agréé. Devis gratuit et visite technique sous {48h|deux jours} dans tout le 78.",
    "Pour vos trajets quotidiens entre {VILLE} et La Défense ou Paris, équiper votre pavillon d'une borne de recharge rapide à domicile est la solution {idéale|optimale} pour charger à moindre coût en heures creuses.",
    "Vous habitez à {VILLE} et souhaitez passer à la vitesse supérieure pour votre voiture électrique ? Nos électriciens partenaires certifiés Qualifelec IRVE installent votre borne de recharge {à domicile|chez vous} en conformité avec les règles de l'art.",
    "Recharger sa voiture sur une prise domestique standard à {VILLE} est {trop lent|inefficace} pour les batteries de grande capacité. Optez pour une installation de borne murale intelligente avec Smart Charging.",
    "Nos experts en solutions de recharge interviennent à {VILLE} pour dimensionner et poser votre wallbox. Bénéficiez des aides de l'État (TVA à 5,5% et crédit d'impôt de 500 €) avec nos {pros|artisans certifiés IRVE}.",
    "Profitez de l'expertise d'un installateur IRVE à {VILLE} pour raccorder votre wallbox intelligente. Nous configurons le délestage dynamique pour protéger l'installation électrique de votre {maison meulière|résidence} lors des pics de consommation."
  ],
  copropriete: [
    "Vous habitez en copropriété à {VILLE} et souhaitez installer une borne de recharge ? Le droit à la prise vous garantit la possibilité d'équiper votre place de parking à vos frais, avec le soutien des aides ADVENIR dans les Yvelines.",
    "Installez votre borne de recharge en copropriété à {VILLE} en toute simplicité. Nos techniciens certifiés IRVE vous aident à formaliser votre demande auprès du syndic yvelinois et à obtenir jusqu'à 960 € de subvention ADVENIR.",
    "Le droit à la prise (décret 2020) permet à tout locataire ou propriétaire d'un appartement à {VILLE} d'installer un point de recharge sur son emplacement de stationnement. Découvrez nos infrastructures de standing.",
    "Sécurisez la recharge de votre voiture électrique dans votre résidence à {VILLE}. Nous concevons des installations individuelles ou collectives conformes aux exigences IRVE et éligibles aux primes ADVENIR 2026.",
    "Rendre votre copropriété à {VILLE} compatible avec la recharge électrique valorise l'ensemble des appartements. Nos experts IRVE interviennent pour installer des bornes individuelles raccordées au TGBT des parties communes.",
    "Le raccordement d'une borne en parking partagé ou sous-sol à {VILLE} requiert une expertise spécifique. Nous réalisons l'étude technique nécessaire pour présenter un dossier solide à votre syndic de copropriété.",
    "Faites installer votre wallbox dans votre résidence de {VILLE} en bénéficiant de la prime ADVENIR copropriété qui finance jusqu'à 50% du projet d'installation électrique individuelle.",
    "Nos électriciens certifiés IRVE dans les Yvelines accompagnent les syndics et les copropriétaires de {VILLE} de l'étude de faisabilité technique jusqu'à la mise en service finale de la borne."
  ],
  wallbox: [
    "Optimisez la recharge de votre voiture électrique à {VILLE} en faisant installer une borne murale rapide (Wallbox) de 7.4 kW à 22 kW par nos électriciens certifiés IRVE des Yvelines.",
    "Besoin d'une recharge rapide et intelligente à domicile à {VILLE} ? Découvrez nos modèles de Wallbox connectées avec gestion des heures creuses et délestage de puissance en temps réel.",
    "Installez une borne de recharge performante (Wallbox) dans votre garage à {VILLE}. Nous sélectionnons les meilleures marques du marché pour vous garantir une charge sécurisée, rapide et compatible.",
    "La Wallbox est la solution de recharge résidentielle par excellence à {VILLE}. Elle permet de recharger votre véhicule électrique jusqu'à 8 fois plus vite qu'une prise de courant standard.",
    "Faites poser votre borne Wallbox à {VILLE} par un électricien agréé IRVE pour sécuriser votre installation électrique et bénéficier des aides financières de l'État en 2026.",
    "Vous cherchez à réduire le temps de charge de votre voiture de standing à {VILLE} ? Nos installateurs partenaires vous proposent des solutions Wallbox adaptées à votre abonnement monophasé ou triphasé.",
    "Équipez votre garage de {VILLE} d'une wallbox connectée de dernière génération. Pilotez votre consommation depuis votre smartphone et programmez vos charges en fonction des heures creuses.",
    "Profitez d'une installation soignée de votre borne Wallbox à {VILLE} par des spécialistes de la recharge électrique IRVE intervenant dans tout le département des Yvelines."
  ]
};

const USE_CASE_POOLS: Record<string, string[]> = {
  main: [
    "La pose d'une borne de 7.4 kW à domicile permet de recharger n'importe quel véhicule (Tesla, BMW i4, Peugeot e-3008, Porsche Macan EV) en récupérant environ 40 à 50 km d'autonomie par heure de charge.",
    "Pour les propriétés disposant d'un abonnement électrique triphasé, l'installation d'une borne de 11 kW ou 22 kW permet de diviser par trois le temps de charge de votre batterie sans risquer de surcharger le réseau grâce au délestage dynamique.",
    "Une wallbox installée dans votre garage ou sur votre place de parking à {VILLE} sécurise la charge de votre véhicule en évitant toute surchauffe des câbles grâce à des protections électriques dédiées.",
    "Nos techniciens IRVE recommandent l'installation de bornes de grandes marques (Keba, ABB, Easee, Schneider) équipées d'un câble de type 2 pour s'adapter à l'ensemble des véhicules électriques du marché européen.",
    "Que ce soit pour une recharge quotidienne rapide après vos trajets sur l'A13 ou l'A14 vers La Défense, une borne murale de 7.4 kW à {VILLE} assure une flexibilité totale.",
    "L'installation d'une prise renforcée Green'Up (3.7 kW) peut suffire pour les véhicules hybrides rechargeables, mais pour un véhicule 100% électrique de standing, seule une borne wallbox garantit une recharge complète en une nuit."
  ],
  copropriete: [
    "Pour faire valoir votre droit à la prise, vous devez envoyer un dossier technique détaillé au syndic de copropriété par lettre recommandée. Celui-ci dispose de 3 mois pour inscrire le point à l'ordre du jour de la prochaine AG.",
    "La solution classique consiste à raccorder votre borne de recharge individuelle au tableau général des parties communes (TGBT) de la résidence yvelinoise, avec la pose d'un sous-compteur individuel certifié MID pour la facturation des consommations.",
    "Pour les résidences de {VILLE} comptant de nombreuses demandes, nous recommandons une infrastructure collective avec une colonne horizontale Enedis, permettant à chaque résident d'ouvrir un abonnement Linky indépendant.",
    "L'installation d'une borne en sous-sol à {VILLE} exige de respecter des normes de sécurité incendie strictes et d'utiliser du matériel robuste avec un indice de protection IK10 contre les chocs.",
    "Que vous soyez propriétaire occupant ou locataire à {VILLE}, le syndic ne peut s'opposer aux travaux d'installation d'une borne individuelle que pour un motif sérieux et légitime, comme l'existence d'un projet collectif.",
    "La mise en place d'une solution de recharge partagée ou individuelle en copropriété permet de répartir équitablement les coûts de consommation d'électricité grâce à des relevés de télé-relève automatisés."
  ],
  wallbox: [
    "Une Wallbox de 7.4 kW en monophasé est idéale pour la majorité des maisons individuelles à {VILLE}. Elle permet de recharger complètement une batterie de 60 kWh en une seule nuit.",
    "Pour les propriétaires disposant d'une installation en triphasé à {VILLE}, les bornes de 11 kW ou 22 kW offrent une vitesse supérieure, chargeant votre véhicule compatible en seulement 3 à 5 heures pour une autonomie maximale.",
    "Les bornes murales sélectionnées par nos électriciens partenaires intègrent un protocole OCPP et une connectivité Bluetooth ou Wi-Fi pour planifier facilement vos sessions de charge depuis une application mobile dédiée.",
    "La pose d'une Wallbox nécessite des protections électriques obligatoires dans votre tableau de {VILLE} : un disjoncteur adapté et un interrupteur différentiel de type A-EV capable de détecter les fuites de courant continu.",
    "Certaines wallbox intelligentes intègrent un lecteur de carte RFID pour sécuriser l'accès et empêcher les personnes non autorisées de recharger leur véhicule chez vous.",
    "Une borne de recharge rapide est particulièrement recommandée si vous roulez beaucoup dans les Yvelines et avez besoin de récupérer rapidement de l'autonomie entre deux trajets."
  ]
};

const ECO_POOLS: Record<string, string[]> = {
  main: [
    "En programmant la charge de votre véhicule électrique pendant les heures creuses d'Enedis dans les Yvelines (souvent entre 22h et 6h), vous réduisez votre facture d'électricité et divisez par 5 vos dépenses de carburant.",
    "Avec un tarif de recharge à domicile à {VILLE} estimé à moins de 3 € pour 100 km, l'amortissement de votre investissement dans une borne IRVE s'effectue en moins de 18 mois par rapport à un véhicule thermique.",
    "Le crédit d'impôt de 500 € disponible en 2026, combiné à la TVA réduite à 5,5% sur le matériel et la main d'œuvre, rend l'installation d'une borne de recharge particulièrement accessible pour les particuliers.",
    "Grâce aux fonctionnalités intelligentes des wallbox modernes, vous pouvez suivre en temps réel vos consommations et optimiser vos charges pour profiter pleinement des tarifs d'électricité les plus avantageux.",
    "Le pilotage de la charge permet également d'intégrer des panneaux solaires si vous en êtes équipé à {VILLE}, vous permettant de rouler avec une énergie 100% verte et gratuite.",
    "Éviter les recharges régulières sur les bornes publiques rapides en rechargeant principalement chez soi à {VILLE} permet de réaliser plus de 1 600 € d'économies annuelles."
  ],
  copropriete: [
    "Grâce au programme ADVENIR spécifique pour la copropriété, vous bénéficiez d'une aide financière couvrant 50% du montant des travaux, avec un plafond de 960 € TTC par point de recharge installé à {VILLE}.",
    "En plus de la prime ADVENIR, l'installation d'une borne en copropriété est éligible au crédit d'impôt de 500 € et à un taux de TVA réduit à 5,5%, ce qui réduit considérablement le coût restant à votre charge.",
    "Raccorder votre borne au compteur des parties communes avec un système de sous-comptage vous permet de ne payer que l'électricité que vous consommez réellement, au tarif négocié par la copropriété.",
    "La recharge en heures creuses au sein de votre résidence à {VILLE} reste de loin la solution la plus économique pour alimenter votre véhicule électrique, préservant ainsi votre budget énergie mensuel.",
    "Le financement de l'infrastructure collective de recharge peut être pris en charge par des opérateurs tiers sans frais pour la copropriété, les utilisateurs payant ensuite un abonnement individuel.",
    "Investir dans une borne en copropriété à {VILLE} permet de réaliser des économies substantielles à long terme en évitant les tarifs excessifs pratiqués sur les réseaux de recharge publics extérieurs."
  ],
  wallbox: [
    "Grâce au pilotage énergétique de votre Wallbox à {VILLE}, la charge s'active automatiquement pendant les heures creuses, vous permettant de rouler pour environ 3 € par recharge complète de votre batterie.",
    "Le crédit d'impôt national pour la pose d'une borne de recharge a été fixé à 500 € par contribuable en 2026, cumulable avec la TVA à 5,5% appliquée par votre installateur IRVE qualifié.",
    "L'installation d'une borne de recharge rapide vous évite d'utiliser régulièrement les chargeurs publics rapides de type DC, dont le coût au kWh est 3 à 4 fois plus élevé que l'électricité domestique à {VILLE}.",
    "Les bornes équipées de capteurs de puissance modulable adaptent leur vitesse de recharge en fonction des autres équipements de votre maison de {VILLE}, vous évitant de surcharger votre réseau.",
    "Si vous possédez une installation photovoltaïque à {VILLE}, certaines wallbox peuvent canaliser le surplus de production solaire directement dans la batterie de votre voiture.",
    "Investir dans une wallbox performante à domicile à {VILLE} est rapidement rentabilisé en profitant des tarifs d'électricité régulés d'Enedis et en limitant les recharges d'urgence sur autoroute."
  ]
};

const COMMUNE_DATA_POOLS: Record<string, string[]> = {
  main: [
    "Nos électriciens partenaires analysent la capacité de votre tableau de répartition principal. Dans les maisons anciennes en meulière typiques des Yvelines, une mise aux normes du tableau de répartition ou l'ajout d'un interrupteur différentiel adapté est indispensable.",
    "À {VILLE}, nous vérifions systématiquement la qualité de la prise de terre avant toute pose de borne. Une résistance de terre supérieure à 100 Ohms empêcherait le véhicule électrique de démarrer sa charge par sécurité.",
    "Le réseau électrique Enedis à {VILLE} délivre une tension stable, mais la pose d'un module de délestage est indispensable pour les abonnements résidentiels afin de ne pas couper le courant lors du démarrage d'autres appareils.",
    "L'installation électrique de votre villa doit être auditée par un professionnel IRVE. Dans le 78, de nombreux tableaux nécessitent un simple réagencement pour accueillir le disjoncteur et le différentiel dédiés à la wallbox.",
    "Nos installateurs se chargent de vérifier la puissance souscrite auprès de votre fournisseur. Si un passage au compteur triphasé est nécessaire, nous vous guidons dans les démarches auprès d'Enedis Yvelines.",
    "Chaque installation de borne à {VILLE} respecte scrupuleusement le cahier des charges de la norme NF C 15-100, garantissant une protection optimale contre les surcharges."
  ],
  copropriete: [
    "L'installation dans les parkings collectifs des Yvelines nécessite l'intervention d'un électricien qualifié IRVE pour garantir la conformité avec le guide technique de l'association Promotelec.",
    "À {VILLE}, nous analysons le tableau général basse tension (TGBT) de votre copropriété pour déterminer la puissance disponible. Parfois, l'installation d'un gestionnaire d'énergie collectif est requise.",
    "Le câblage dans un parking souterrain à {VILLE} doit emprunter des chemins de câbles coupe-feu spécifiques pour se conformer à la réglementation sur la sécurité incendie.",
    "Nos installateurs coordonnent leur travail avec le syndic de votre résidence à {VILLE}. Nous fournissons un schéma d'implantation technique clair pour valider la faisabilité du raccordement.",
    "Dans les résidences standing du 78, l'accès à la borne est sécurisé par un lecteur de badge ou une clé physique. Cela empêche toute utilisation frauduleuse de votre électricité.",
    "Chaque projet en copropriété à {VILLE} respecte les normes d'accessibilité PMR (Personnes à Mobilité Réduite) pour l'emplacement de la borne et la maniabilité du câble."
  ],
  wallbox: [
    "L'installation d'une wallbox à {VILLE} doit impérativement être validée par un diagnostic de votre réseau électrique intérieur afin de s'assurer de la bonne section de câble et de la présence d'une prise de terre conforme.",
    "À {VILLE}, de nombreuses installations électriques résidentielles nécessitent la pose d'un module de délestage Linky pour éviter la coupure du disjoncteur général lorsque la borne fonctionne en même temps que le chauffage ou les plaques électriques.",
    "Les techniciens IRVE intervenant à {VILLE} vérifient la conformité de votre tableau électrique principal. Si nécessaire, un tableau secondaire dédié à la borne de recharge sera mis en place.",
    "Le choix de la puissance de votre borne dépend directement de votre abonnement électrique à {VILLE}. Une borne de 7.4 kW requiert un abonnement minimum de 9 kVA (45 Ampères).",
    "Pour les bornes installées en extérieur dans les allées ou sous carports, nos installateurs veillent à équiper les wallbox de protections étanches renforcées contre les intempéries (IP65).",
    "Toutes les wallbox installées par nos artisans certifiés à {VILLE} respectent les directives avec des connecteurs de type 2S équipés d'obturateurs de sécurité."
  ]
};

const EXPERT_TIP_POOLS: Record<string, string[]> = {
  main: [
    "Conseil de pro : Privilégiez une borne équipée d'un capteur de courant qui ajuste dynamiquement la charge. C'est l'assurance d'éviter les disjonctions générales sans avoir à augmenter votre abonnement Enedis.",
    "Astuce technique : Si votre borne est installée en extérieur à {VILLE}, exigez une pose sous abri ou une borne certifiée IP65 avec prises T2S pour résister à la pluie et au gel hivernal yvelinois.",
    "Recommandation IRVE : Ne sous-estimez pas la section du câble d'alimentation de la borne. Pour une borne de 7.4 kW située à 15 mètres du tableau, un câble en cuivre de 10 mm² est indispensable.",
    "Avis de l'électricien : Optez pour une borne évolutive compatible OCPP. Cela vous permettra de la connecter facilement à des applications de recharge intelligente ou à un futur système domotique.",
    "Conseil sécurité : L'utilisation d'une prise classique pour recharger un VE présente un risque d'échauffement important. La wallbox intègre des circuits de détection de fuite de courant continu pour une protection totale.",
    "Le conseil du 78 : En programmant votre charge de nuit, vous tirez profit des heures creuses d'EDF très avantageuses dans la région, tout en évitant les surcharges de réseau en fin de journée."
  ],
  copropriete: [
    "Conseil d'expert : N'attendez pas la tenue de l'AG pour envoyer votre dossier en recommandé. Plus vite le syndic reçoit votre demande technique rédigée par nos soins, plus vite la convention de travaux sera signée.",
    "Astuce copro : Proposez au syndic une solution de recharge collective évolutive. Même si vous êtes le premier demandeur à {VILLE}, d'autres voisins suivront et une infrastructure commune évitera de multiplier les raccordements.",
    "Recommandation technique : Pour les parkings extérieurs à {VILLE}, optez pour une borne sur pied robuste dotée d'un indice IK10 et d'une trappe verrouillable.",
    "Le conseil juridique : Rappelez à votre syndic que le droit à la prise est garanti par la loi. Si aucune décision n'est prise dans les 3 mois suivant la réception de votre demande, vous pouvez lancer les travaux.",
    "Avis de l'électricien : Dans le cas d'une recharge raccordée aux parties communes, assurez-vous que le sous-compteur installé est certifié MID pour que la facturation soit juridiquement incontestable.",
    "Conseil pratique : Choisissez une borne équipée d'une connectivité Wi-Fi ou 4G pour permettre le suivi de consommation et la mise à jour à distance."
  ],
  wallbox: [
    "Le conseil de l'artisan : Pour une borne installée à {VILLE}, choisissez un modèle doté d'une application de contrôle robuste. Cela vous permettra de suivre précisément votre historique de consommation.",
    "Astuce technique : Si vous prévoyez d'acheter un second véhicule électrique à l'avenir, optez dès maintenant pour une borne capable de gérer la charge partagée intelligente entre deux points de charge.",
    "Recommandation IRVE : Évitez les câbles de recharge trop courts. Un câble de 5 ou 7 mètres offre un confort d'utilisation optimal, quelle que soit la position de la trappe de recharge de votre véhicule à {VILLE}.",
    "Conseil d'expert : Pensez à vérifier la garantie constructeur de votre wallbox. Les fabricants leaders proposent des extensions de garantie jusqu'à 5 ans qui sécurisent votre investissement.",
    "Avis de l'électricien : Si votre maison à {VILLE} dispose d'une installation en triphasé, préférez une borne de 22 kW bridable. Cela vous donne une flexibilité totale selon les capacités de charge de vos futurs véhicules.",
    "Le conseil technique : Protégez toujours votre investissement. Enroulez soigneusement le câble de charge sur un support mural dédié à {VILLE} après chaque utilisation."
  ]
};

const REAL_ESTATE_POOLS: Record<string, string[]> = {
  main: [
    "Les agences immobilières des Yvelines confirment qu'une maison équipée d'une borne de recharge rapide se vend plus rapidement et gagne une valeur verte immédiate estimée entre 3% et 5% sur le marché de {VILLE}.",
    "À {VILLE}, la présence d'une wallbox opérationnelle dans le garage est un argument de poids lors des visites d'acquéreurs potentiels, de plus en plus nombreux à rouler en véhicule électrique.",
    "Valoriser son patrimoine immobilier passe aujourd'hui par la transition énergétique. Installer une borne IRVE de qualité valorise votre bien tout en le démarquant des autres annonces du secteur de {VILLE}.",
    "Avec l'interdiction progressive des véhicules thermiques, une place de stationnement déjà câblée pour la recharge de véhicules électriques est un équipement standard recherché par les acheteurs à {VILLE}.",
    "Selon les notaires du 78, les biens équipés d'une borne de recharge rapide dans le secteur de {VILLE} se négocient avec une décote moindre, la valeur verte agissant comme un amortisseur de prix.",
    "Les diagnostiqueurs immobiliers à {VILLE} intègrent désormais la présence d'une borne IRVE dans l'audit. C'est un critère de différenciation qui séduit une clientèle d'acheteurs CSP+ (comme les cadres de La Défense) sensibilisés à la mobilité.",
    "À {VILLE}, les programmes immobiliers neufs livrés intègrent systématiquement un pré-câblage borne de recharge. Ne pas équiper une maison existante, c'est prendre du retard sur le standard du marché local.",
    "Le marché de la location dans les Yvelines récompense les propriétaires-bailleurs qui proposent un point de charge privé : les réservations de locataires roulant en VE grimpent rapidement avec ce service."
  ],
  copropriete: [
    "Un appartement avec place de parking câblée ou équipée d'une borne à {VILLE} voit sa valeur immobilière augmenter de façon significative. C'est un argument de vente majeur pour les acheteurs urbains d'Île-de-France.",
    "Dans les copropriétés de {VILLE}, disposer d'un équipement IRVE individuel permet de louer ou vendre sa place de parking beaucoup plus facilement et avec une plus-value estimée.",
    "La valeur verte des logements collectifs à {VILLE} devient un critère de choix pour les locataires équipés de VE, qui écartent désormais les résidences dépourvues de solution de recharge.",
    "Équiper sa copropriété d'une infrastructure de recharge collective est un investissement qui modernise l'immeuble et préserve l'attractivité immobilière de la copropriété à {VILLE} face aux constructions neuves.",
    "Les résidences collectives de {VILLE} qui anticipent l'équipement IRVE attirent un vivier de locataires actifs. La demande pour des appartements avec parking équipé explose dans tout le 78.",
    "D'après les agences immobilières de {VILLE}, un lot de copropriété sans solution de recharge met en moyenne 25% de temps de plus à se vendre qu'un lot équipé.",
    "Les syndics professionnels des Yvelines recommandent aux copropriétés de {VILLE} de voter un plan de pré-câblage global pour éviter une dépréciation collective du patrimoine.",
    "L'installation d'une borne en parking souterrain à {VILLE} est perçue par les banques comme un investissement valorisant."
  ],
  wallbox: [
    "L'installation d'une wallbox de marque reconnue valorise immédiatement votre maison à {VILLE} en augmentant sa valeur verte auprès des acquéreurs de plus en plus attentifs aux équipements de recharge à domicile.",
    "Avoir une borne de recharge rapide pré-équipée dans son garage est un critère de confort haut de gamme très recherché lors des transactions immobilières dans le secteur de {VILLE}.",
    "Un logement prêt pour la mobilité électrique à {VILLE} se vend en moyenne plus vite sur le marché des Yvelines, les acheteurs appréciant de ne pas avoir à réaliser ces travaux.",
    "Dans les Yvelines, les maisons disposant d'un carport ou d'un garage équipé d'une wallbox 7.4 kW se positionnent en tête des recherches immobilières des actifs roulant en électrique.",
    "Les diagnostiqueurs signalent que les acquéreurs demandent de plus en plus souvent si la maison est pré-équipée pour la recharge d'un véhicule électrique avant même de visiter le bien.",
    "Une maison avec wallbox 22 kW et abonnement triphasé à {VILLE} représente un argument décisif face à la concurrence des constructions neuves.",
    "Le retour sur investissement d'une wallbox à {VILLE} ne se mesure pas uniquement en économies de carburant : la plus-value immobilière générée peut être substantielle lors de la revente.",
    "Les mandataires immobiliers spécialisés en standing à {VILLE} incluent désormais la wallbox dans les critères de recherche premium."
  ]
};

const POPULATION_TIER_POOLS: Record<string, string[]> = {
  main: [
    "Avec une population locale active et un tissu urbain en pleine mutation, {VILLE} encourage le développement de l'électromobilité. Installer sa borne privée est le moyen idéal de devancer les futures réglementations.",
    "Dans cette commune dynamique du 78, le nombre d'utilisateurs de véhicules propres augmente rapidement. Pouvoir recharger chez soi reste le moyen le plus confortable et le plus économique pour vos trajets.",
    "Les infrastructures publiques de recharge se développent à {VILLE}, mais elles ne remplaceront jamais la sérénité et le tarif avantageux d'une recharge nocturne effectuée dans votre allée ou garage.",
    "En tant que commune accueillante des Yvelines, {VILLE} voit sa part de voitures électriques grandir. Nos électriciens locaux contribuent activement à cette transition en équipant les pavillons.",
    "Les trajets depuis {VILLE} vers Versailles ou les zones d'activités (Vélizy, Saint-Quentin-en-Yvelines, Paris, La Défense) sont idéalement couverts par une recharge nocturne à domicile. Un plein électrique chaque matin sans contrainte.",
    "La qualité de vie à {VILLE} passe aussi par la maîtrise de ses coûts de déplacement. Une borne de recharge IRVE à domicile permet de diviser par 5 le budget carburant mensuel.",
    "Le réseau de transport yvelinois complète l'offre de mobilité à {VILLE}, mais pour les trajets quotidiens, la voiture électrique rechargée à domicile reste imbattable en souplesse.",
    "L'évolution rapide du parc automobile à {VILLE} montre que les véhicules 100% électriques dépassent désormais les hybrides. Cette tendance confirme le besoin d'équiper les domiciles."
  ],
  copropriete: [
    "Dans les zones denses de {VILLE}, où le logement collectif représente une part importante du parc immobilier, l'adaptation des copropriétés à la recharge électrique est un enjeu majeur.",
    "Le nombre croissant de résidents roulant en électrique à {VILLE} pousse les syndics de copropriété à moderniser les installations de stationnement.",
    "À {VILLE}, de nombreuses résidences collectives se tournent vers nos électriciens IRVE pour déployer des infrastructures prêtes à l'emploi.",
    "Installer une borne dans son immeuble à {VILLE} permet de s'affranchir de la recherche quotidienne d'une borne publique disponible.",
    "La densité de population à {VILLE} rend les bornes publiques souvent saturées aux heures de pointe. Les copropriétaires avisés préfèrent investir dans un point de charge privatif.",
    "Les bailleurs de standing commencent à équiper leurs résidences à {VILLE} en bornes de recharge. Cette tendance témoigne d'un besoin de solutions collectives.",
    "Le programme local de rénovation à {VILLE} intègre désormais le pré-câblage des parkings, preuve que la mobilité décarbonée est au cœur de la planification.",
    "Les conseils syndicaux de {VILLE} sont de plus en plus sollicités par les copropriétaires souhaitant installer une borne. L'anticipation collective évite des travaux individuels coûteux."
  ],
  copropriete_2: [
    "Le raccordement en copropriété à {VILLE} est facilité par le droit à la prise. Toutefois, un projet collectif avec une solution de type colonne horizontale s'avère bien plus avantageux à long terme."
  ],
  wallbox: [
    "À {VILLE}, la transition vers la voiture électrique est en marche. Disposer d'une wallbox rapide à domicile est la solution la plus pratique pour recharger chaque soir et démarrer la journée plein fait.",
    "Le développement de la mobilité à {VILLE} s'accompagne d'une demande croissante pour des solutions de charge résidentielles rapides, portées par des électriciens locaux certifiés IRVE.",
    "Même si la commune de {VILLE} déploie de nouvelles bornes publiques, la wallbox privée reste l'équipement indispensable pour recharger au meilleur tarif sans contrainte.",
    "En choisissant d'installer une borne rapide chez vous à {VILLE}, vous rejoignez les nombreux foyers du 78 qui ont fait le choix d'une mobilité simplifiée au quotidien.",
    "Les résidents de {VILLE} qui optent pour une wallbox témoignent d'un gain de confort majeur : finies les files d'attente sur les bornes publiques.",
    "L'engouement pour les véhicules électriques à {VILLE} dépasse la simple tendance écologique. C'est un choix économique rationnel quand on dispose d'une wallbox alimentée en heures creuses.",
    "Les familles de {VILLE} avec deux véhicules constatent qu'une seule wallbox 7.4 kW suffit pour couvrir les besoins, à condition de programmer les charges en alternance.",
    "La généralisation du télétravail à {VILLE} renforce l'intérêt de la wallbox domestique : le véhicule est garé plus longtemps, ce qui permet une recharge flexible."
  ]
};

const LOGISTICS_ALERT_POOLS: string[] = [
  "Attention au dimensionnement : le passage de câbles dans des parkings souterrains ou sur des façades en meulière exige des fourreaux coupe-feu conformes et une validation de conformité électrique.",
  "Pour les résidences secondaires de la grande couronne souvent inoccupées, nous conseillons d'installer une borne avec interrupteur à clé ou verrouillage RFID afin de prévenir les prélèvements sauvages d'électricité.",
  "Dans les zones d'installation extérieure exposées aux intempéries à {VILLE}, l'indice de protection matériel minimal requis est IP65 avec une enveloppe traitée contre l'humidité pour garantir la longévité de l'appareil.",
  "La configuration électrique des propriétés rurales du sud des Yvelines nécessite souvent une vérification de la valeur de prise de terre. Si la résistance dépasse 100 ohms, la borne se mettra en sécurité.",
  "Si la distance entre votre tableau électrique et la borne dépasse 25 mètres, le diamètre des conducteurs doit être calculé en 10 mm² ou 16 mm² pour compenser la chute de tension en ligne.",
  "La pose en copropriété standing exige un repérage strict des réseaux existants et la mise en œuvre de chemins de câbles conformes aux règles de sécurité incendie."
];

const PRICES_CONTEXT_POOLS: string[] = [
  "Le prix d'une installation standard de wallbox oscille généralement entre {PRIX_MIN} € et {PRIX_MAX} € TTC, aides comprises. Le coût final varie selon la distance de raccordement et la nécessité d'adapter le tableau principal.",
  "Pour une solution de recharge Green'Up d'entrée de gamme, prévoyez un budget d'environ 450 € à 800 €. Pour une borne murale intelligente de 7.4 kW ou 22 kW, les tarifs se situent plutôt entre 1 400 € et 4 000 € posé.",
  "Bénéficier d'une TVA réduite à 5,5% et du crédit d'impôt de 500 € permet de réduire le coût d'une installation de borne de 7.4 kW à moins de 1 000 € pour les résidents de {VILLE}.",
  "Les projets d'infrastructures en copropriété à {VILLE} bénéficient de subventions complémentaires de la part d'ADVENIR, réduisant significativement le reste à charge pour chaque résident raccordé.",
  "En choisissant un électricien IRVE qualifié dans les Yvelines, vous vous assurez d'obtenir une installation éligible aux aides d'État qui amortissent près de 50% de votre investissement.",
  "Demander plusieurs devis comparatifs à des artisans du 78 permet de trouver le meilleur rapport qualité-prix pour votre projet d'installation électrique."
];

const TABLE_INTRO_POOLS: string[] = [
  "Voici un comparatif des options d'installation de recharge disponibles à {VILLE} avec leurs caractéristiques de puissance et de tarifs moyens en 2026 :",
  "Retrouvez ci-dessous les budgets moyens constatés pour l'équipement d'un point de recharge résidentiel à {VILLE} en fonction de la puissance délivrée :",
  "Nos électriciens partenaires proposent plusieurs solutions de raccordement électrique adaptées à votre véhicule et à votre budget :",
  "Comparez les différentes technologies de recharge à domicile pour votre propriété des Yvelines et les coûts d'installation associés :"
];

const CATEGORY_OFFSETS = { main: 0, copropriete: 100, wallbox: 200 };

export function generateCommuneContent(commune: Commune, category: 'main' | 'copropriete' | 'wallbox'): LocalContent {
  const seed = commune.slug;
  const prices = getDynamicPrices(commune);
  const agency = getLocalAgency(commune.codePostal, commune.slug);
  
  const introIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 10, INTRO_POOLS[category].length);
  const useCaseIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 20, USE_CASE_POOLS[category].length);
  const ecoIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 30, ECO_POOLS[category].length);
  const commDataIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 40, COMMUNE_DATA_POOLS[category].length);
  const expertTipIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 50, EXPERT_TIP_POOLS[category].length);
  const realEstateIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 60, REAL_ESTATE_POOLS[category].length);
  const popTierIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 70, POPULATION_TIER_POOLS[category].length);
  
  const logisticsAlertIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 80, LOGISTICS_ALERT_POOLS.length);
  const pricesContextIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 85, PRICES_CONTEXT_POOLS.length);
  const tableIntroIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 90, TABLE_INTRO_POOLS.length);

  const rawIntro = INTRO_POOLS[category][introIdx];
  const rawUseCase = USE_CASE_POOLS[category][useCaseIdx];
  const rawEco = ECO_POOLS[category][ecoIdx];
  const rawCommData = COMMUNE_DATA_POOLS[category][commDataIdx];
  const rawExpertTip = EXPERT_TIP_POOLS[category][expertTipIdx];
  const rawRealEstate = REAL_ESTATE_POOLS[category][realEstateIdx];
  const rawPopTier = POPULATION_TIER_POOLS[category][popTierIdx];
  const rawLogisticsAlert = LOGISTICS_ALERT_POOLS[logisticsAlertIdx];
  const rawPricesContext = PRICES_CONTEXT_POOLS[pricesContextIdx];
  const rawTableIntro = TABLE_INTRO_POOLS[tableIntroIdx];

  const ctx = {
    VILLE: commune.nom,
    CODE_POSTAL: commune.codePostal,
    PRIX_MIN: String(prices.wallbox7kW.min),
    PRIX_MAX: String(prices.wallbox7kW.max),
  };

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{VILLE}/g, ctx.VILLE)
      .replace(/{CODE_POSTAL}/g, ctx.CODE_POSTAL)
      .replace(/{PRIX_MIN}/g, ctx.PRIX_MIN)
      .replace(/{PRIX_MAX}/g, ctx.PRIX_MAX);
  };

  const introParagraph = spin(replacePlaceholders(rawIntro), seed);
  const useCaseText = spin(replacePlaceholders(rawUseCase), seed);
  const ecoText = spin(replacePlaceholders(rawEco), seed);
  const communeDataInsight = spin(replacePlaceholders(rawCommData), seed);
  const expertTip = spin(replacePlaceholders(rawExpertTip), seed);
  const realEstateInsight = spin(replacePlaceholders(rawRealEstate), seed);
  const populationTierContent = spin(replacePlaceholders(rawPopTier), seed);
  const logisticsAlert = spin(replacePlaceholders(rawLogisticsAlert), seed);
  const pricesContext = spin(replacePlaceholders(rawPricesContext), seed);
  const tableIntro = spin(replacePlaceholders(rawTableIntro), seed);

  // --- 1b. Enriched localContext using all commune data ---
  const pop = commune.population;
  const veCount = commune.vehiculesElectriques || 120;
  const croissance = commune.croissanceVE || 25;
  const maisonPct = commune.logementsMaison || 50;
  const profil = commune.profilCommune || 'commune résidentielle';
  const interco = commune.intercommunalite || 'intercommunalité locale';
  const zone = getClimateZone(commune.codePostal, commune.slug);
  
  const zoneLabels: Record<ClimateZone, string> = {
    'seine-valley': 'la vallée de la Seine',
    'versailles-plateau': 'le plateau de Versailles',
    'rambouillet-forest': 'la zone forestière de Rambouillet'
  };

  const LOCAL_CONTEXT_TEMPLATES = [
    `Qualifiée de ${profil}, ${commune.nom} abrite ${pop.toLocaleString()} habitants et recense déjà plus de ${veCount.toLocaleString()} véhicules électriques en circulation locale (+${croissance}%/an). Rattachée à la ${interco}, la commune bénéficie de dispositifs d'accompagnement pour la transition énergétique, rendant l'installation d'une borne à domicile particulièrement pertinente.`,
    `Située dans ${zoneLabels[zone]}, ${commune.nom} se caractérise par un parc immobilier composé à ${maisonPct}% de maisons individuelles (${commune.tauxMaisonLabel || 'mixte'}). Ce profil d'habitat est idéal pour l'installation de bornes de recharge résidentielles, d'autant que la croissance du véhicule électrique y atteint ${croissance}% par an.`,
    `Avec ${commune.logements ? commune.logements.toLocaleString() : 'plusieurs milliers de'} logements et un prix immobilier moyen de ${commune.prixM2Moyen ? commune.prixM2Moyen.toLocaleString() + ' €/m²' : 'niveau départemental'}, ${commune.nom} est un marché classé ${commune.marcheImmobilier || 'dynamique'}. La ${interco} accompagne activement les résidents dans leurs projets de transition énergétique, facilitant l'accès aux aides ADVENIR et au crédit d'impôt.`,
    `Les ${veCount.toLocaleString()} véhicules électriques circulant à ${commune.nom} témoignent de l'adoption rapide de la mobilité propre dans cette commune de ${pop.toLocaleString()} habitants. Avec seulement ${commune.bornesPubliques || 5} bornes publiques disponibles (densité de ${commune.densiteBornes || 1.3} borne pour 1 000 habitants), l'équipement à domicile reste la solution la plus fiable.`,
    `${commune.nom}, commune ${profil} du département des Yvelines (${commune.codePostal}), conjugue qualité de vie résidentielle et dynamisme économique. Son rattachement à la ${interco} facilite l'accès aux dispositifs d'accompagnement pour l'installation de bornes de recharge, dans un contexte où ${croissance}% de véhicules électriques supplémentaires circulent chaque année.`,
    `À ${commune.nom}, le ratio de ${commune.densiteBornes || 1.3} borne publique pour 1 000 habitants reste insuffisant face à la croissance de ${croissance}% du parc de véhicules électriques. Pour les ${Math.round(pop * maisonPct / 100).toLocaleString()} résidents en maison individuelle, la wallbox privée constitue la réponse la plus adaptée et la plus économique.`
  ];

  const localContextIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 95, LOCAL_CONTEXT_TEMPLATES.length);
  const localContext = LOCAL_CONTEXT_TEMPLATES[localContextIdx];

  // Generate density analysis
  const densiteAnalysis = `Avec une population de ${commune.population.toLocaleString()} habitants, ${commune.nom} compte environ ${commune.logements ? commune.logements.toLocaleString() : 'N/A'} logements, dont ${commune.logementsMaison}% de maisons individuelles (marché immobilier qualifié de ${commune.marcheImmobilier}). On estime à plus de ${commune.vehiculesElectriques || 120} le nombre de véhicules électriques en circulation locale, avec un taux de croissance annuel de ${commune.croissanceVE}%. Le réseau de recharge public compte actuellement ${commune.bornesPubliques || 5} points de charge opérationnels.`;

  // --- 1e. Enriched marcheImmobilierInsight — 8 templates ---
  const MARCHE_IMMO_TEMPLATES = [
    `Le marché immobilier de ${commune.nom}, qualifié de ${commune.marcheImmobilier || 'dynamique'} avec un prix moyen de ${commune.prixM2Moyen ? commune.prixM2Moyen.toLocaleString() + ' €/m²' : 'N/A'}, fait de l'installation d'une borne IRVE un investissement à forte plus-value pour les propriétaires.`,
    `À ${commune.nom}, où ${commune.logementsMaison}% des logements sont des maisons individuelles (profil ${commune.tauxMaisonLabel || 'mixte'}), équiper son bien d'une wallbox répond à une demande croissante des acquéreurs. Le marché immobilier ${commune.marcheImmobilier || 'local'} valorise particulièrement les maisons « prêtes pour l'électrique ».`,
    `Dans un contexte immobilier ${commune.marcheImmobilier || 'porteur'} à ${commune.nom} (${commune.prixM2Moyen ? commune.prixM2Moyen.toLocaleString() + ' €/m²' : 'prix départemental'}), une borne de recharge opérationnelle augmente la valeur verte du bien estimée entre 3% et 5% par les diagnostiqueurs immobiliers.`,
    `Les notaires du 78 constatent que les biens situés à ${commune.nom} (marché ${commune.marcheImmobilier || 'dynamique'}) se négocient avec une décote moindre lorsqu'ils sont équipés d'une borne. Avec ${commune.logementsMaison}% de maisons, le potentiel d'équipement est considérable.`,
    `Le marché immobilier à ${commune.nom} est classé comme ${commune.marcheImmobilier || 'intermédiaire'}. Pour un bien estimé autour de ${commune.prixM2Moyen ? commune.prixM2Moyen.toLocaleString() + ' €/m²' : 'N/A'}, l'installation d'une borne IRVE représente un investissement marginal qui génère une plus-value disproportionnée à la revente.`,
    `Avec un parc de ${commune.logements ? commune.logements.toLocaleString() : 'plusieurs milliers de'} logements (dont ${commune.logementsMaison}% de pavillons), ${commune.nom} offre un marché ${commune.marcheImmobilier || 'porteur'} où l'équipement de recharge devient un standard recherché par les acquéreurs CSP+.`,
    `À ${commune.nom}, les agences immobilières rapportent que les maisons équipées d'une borne de recharge se vendent en moyenne 15 jours plus vite. Sur un marché qualifié de ${commune.marcheImmobilier || 'dynamique'}, c'est un avantage compétitif décisif.`,
    `Le positionnement ${commune.marcheImmobilier || 'intermédiaire'} du marché immobilier de ${commune.nom} rend l'investissement dans une wallbox (entre ${prices.wallbox7kW.min} € et ${prices.wallbox7kW.max} €) particulièrement rentable : la valorisation du bien dépasse largement le coût de l'installation.`
  ];
  const marcheImmoIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 96, MARCHE_IMMO_TEMPLATES.length);
  const marcheImmobilierInsight = MARCHE_IMMO_TEMPLATES[marcheImmoIdx];

  const distanceLyonContext = `Versailles centre se situe à environ ${commune.distanceVersailles} km de votre domicile à ${commune.nom}. Cela rend les trajets de navette quotidiens très faciles en véhicule électrique, à condition d'avoir fait le plein de batterie à domicile pendant la nuit.`;

  const anecdotePatrimoine = getAnecdotePatrimoine(commune.slug, commune.nom);

  const climateZoneLabel = getClimateZone(commune.codePostal, commune.slug);
  const localAgencyName = agency.name;

  // --- 1d. Expanded FAQ pool — 16 questions with category-specific ones ---
  const faqPool: { question: string; answer: string }[] = [
    // Common questions (8 original)
    {
      question: `Quel est le prix moyen d'une installation de borne de recharge à ${commune.nom} ?`,
      answer: `Le coût d'installation d'une wallbox de 7.4 kW dans une maison à ${commune.nom} varie entre ${prices.wallbox7kW.min} € et ${prices.wallbox7kW.max} € TTC, avant déduction des aides comme le crédit d'impôt de 500 €.`
    },
    {
      question: `Quelles sont les aides financières disponibles pour les résidents de ${commune.nom} ?`,
      answer: `Les particuliers résidant à ${commune.nom} peuvent bénéficier d'un crédit d'impôt de 500 €, d'une TVA à taux réduit à 5,5% et des subventions ADVENIR s'ils résident en copropriété (jusqu'à 960 € par point de recharge).`
    },
    {
      question: `Pourquoi faire appel à un électricien qualifié IRVE à ${commune.nom} ?`,
      answer: `La certification IRVE est obligatoire pour toute pose d'une borne de recharge de plus de 3.7 kW. Elle garantit la conformité de l'installation et conditionne l'accès aux aides d'État.`
    },
    {
      question: `Quel est le délai de pose pour une borne de recharge murale à ${commune.nom} ?`,
      answer: `Après validation de l'étude technique, l'installation par un électricien qualifié du 78 s'effectue généralement en une demi-journée. Nos partenaires interviennent sous 48h.`
    },
    {
      question: `Puis-je installer une borne de recharge extérieure pour ma maison à ${commune.nom} ?`,
      answer: `Oui, à condition de choisir une borne étanche certifiée IP65 avec prise T2S équipée d'obturateurs. Nos experts locaux veillent également à fixer solidement le socle sur un pied de borne robuste ou un mur adapté.`
    },
    {
      question: `Comment faire valoir mon droit à la prise en copropriété à ${commune.nom} ?`,
      answer: `Vous devez notifier le syndic de votre copropriété à ${commune.nom} par lettre recommandée avec accusé de réception en joignant un dossier technique. Le syndic dispose de 3 mois pour agir.`
    },
    {
      question: `La borne 22kW triphasée est-elle recommandée pour charger une voiture haut de gamme à ${commune.nom} ?`,
      answer: `Oui. Pour exploiter le chargeur embarqué triphasé d'une Tesla Model S, d'une Porsche Taycan ou d'une Audi e-tron, une borne 22kW triphasée permet de charger complètement en moins de 3 heures.`
    },
    {
      question: `Est-il possible de piloter ma wallbox avec des panneaux solaires dans les Yvelines ?`,
      answer: `Tout à fait. Coupler une wallbox avec vos panneaux photovoltaïques en autoconsommation vous permet de recharger votre véhicule avec le surplus d'énergie produit, rendant vos trajets totalement neutres en coût.`
    },
  ];

  // Category-specific FAQs
  if (category === 'copropriete') {
    faqPool.push(
      {
        question: `Comment se passe le vote en assemblée générale pour installer une borne en copropriété à ${commune.nom} ?`,
        answer: `L'installation d'une borne individuelle via le droit à la prise ne nécessite pas de vote en AG. En revanche, un projet collectif d'infrastructure IRVE requiert un vote à la majorité simple (article 24) lors de l'assemblée générale des copropriétaires.`
      },
      {
        question: `Quel type de sous-compteur est exigé pour la facturation en copropriété à ${commune.nom} ?`,
        answer: `Le sous-compteur doit être certifié MID (Measuring Instruments Directive) pour que la facturation individuelle soit juridiquement opposable. Il permet un relevé précis de votre consommation, distinct de celle des parties communes.`
      },
      {
        question: `Le syndic peut-il refuser l'installation d'une borne en copropriété à ${commune.nom} ?`,
        answer: `Le syndic ne peut s'opposer au droit à la prise que pour un motif sérieux et légitime (par exemple, si un projet collectif est déjà planifié). En l'absence de réponse sous 3 mois, le copropriétaire peut engager les travaux.`
      },
      {
        question: `Quelle est la différence entre une solution individuelle et collective en copropriété à ${commune.nom} ?`,
        answer: `La solution individuelle raccorde votre borne au compteur des parties communes avec un sous-compteur dédié. La solution collective installe une colonne horizontale Enedis avec des compteurs Linky individuels, plus avantageuse à long terme si plusieurs résidents sont intéressés.`
      }
    );
  } else if (category === 'wallbox') {
    faqPool.push(
      {
        question: `Quelle est la différence entre une wallbox monophasée et triphasée à ${commune.nom} ?`,
        answer: `Une wallbox monophasée (7.4 kW max) suffit pour la majorité des foyers à ${commune.nom}. Une triphasée (11 ou 22 kW) est réservée aux abonnements triphasés et permet une charge 3 à 6 fois plus rapide, idéale pour les gros rouleurs ou véhicules premium.`
      },
      {
        question: `Quelles marques de wallbox recommandez-vous pour une installation à ${commune.nom} ?`,
        answer: `Nos installateurs IRVE préconisent des marques certifiées et éprouvées : Keba (KeContact P30), Easee (Home), Schneider (EVlink), ABB (Terra AC) et Wallbox (Pulsar Plus). Le choix dépend de votre budget, de votre véhicule et de vos besoins en connectivité.`
      },
      {
        question: `Mon véhicule hybride rechargeable nécessite-t-il une wallbox à ${commune.nom} ?`,
        answer: `Pour un hybride rechargeable avec une batterie de 10 à 15 kWh, une prise renforcée Green'Up (3.7 kW) peut suffire. Cependant, une wallbox 7.4 kW offre un confort supérieur avec une charge complète en 2 heures au lieu de 5.`
      },
      {
        question: `Qu'est-ce que le Smart Charging et comment en profiter à ${commune.nom} ?`,
        answer: `Le Smart Charging (charge intelligente) permet à votre wallbox de moduler automatiquement la puissance de charge en fonction du tarif électrique, de la production solaire ou de la consommation du foyer. Certains modèles intègrent aussi un protocole OCPP pour la gestion à distance.`
      }
    );
  } else {
    // main category
    faqPool.push(
      {
        question: `Quel abonnement Enedis faut-il pour installer une borne de 7.4 kW à ${commune.nom} ?`,
        answer: `Pour une wallbox de 7.4 kW (32A), un abonnement minimum de 9 kVA (45A) est recommandé. Si votre logement dispose d'un abonnement 6 kVA, un passage à 9 kVA sera nécessaire, démarche que nous prenons en charge auprès d'Enedis.`
      },
      {
        question: `Faut-il obtenir un certificat Consuel après l'installation d'une borne à ${commune.nom} ?`,
        answer: `Le certificat Consuel n'est pas systématiquement exigé pour une installation résidentielle simple. Cependant, il est obligatoire pour les installations nécessitant un nouveau point de livraison Enedis ou une augmentation de puissance significative.`
      },
      {
        question: `La visite technique préalable est-elle gratuite à ${commune.nom} ?`,
        answer: `Oui. Nos installateurs partenaires réalisent une visite technique gratuite et sans engagement à ${commune.nom} pour auditer votre tableau électrique, mesurer la prise de terre et dimensionner le câblage nécessaire.`
      },
      {
        question: `Quelle est la durée de garantie d'une borne de recharge installée à ${commune.nom} ?`,
        answer: `La garantie constructeur est généralement de 2 à 3 ans pour la borne elle-même. Nos artisans partenaires proposent des extensions de garantie jusqu'à 5 ans couvrant le matériel et la main-d'œuvre, pour une tranquillité totale.`
      }
    );
  }

  // Select a unique subset of 4 FAQs (increased from 3) for each category/commune combo
  const faqSelect = 4;
  const faqIndices: number[] = [];
  let faqSeed = CATEGORY_OFFSETS[category] + 99;
  while (faqIndices.length < faqSelect) {
    const idx = getVariantIndex(seed, faqSeed, faqPool.length);
    if (!faqIndices.includes(idx)) {
      faqIndices.push(idx);
    }
    faqSeed++;
  }
  const faqItems = faqIndices.map(i => faqPool[i]);

  const savingsEstimate = category === 'copropriete' ? "960 € (ADVENIR)" : "500 € (Crédit d'impôt)";
  const lastUpdated = "Juin 2026";

  // --- 1f. Variabilized localRegulation — per-category with multiple variants ---
  const REGULATION_POOLS: Record<string, string[]> = {
    main: [
      `Toutes les installations à ${commune.nom} sont effectuées en stricte conformité avec le guide technique Promotelec et la norme NF C 15-100 en vigueur en 2026. Un interrupteur différentiel de type A-EV est systématiquement installé pour la protection contre les fuites de courant continu.`,
      `La réglementation impose qu'une borne de recharge de plus de 3.7 kW installée à ${commune.nom} soit posée par un électricien certifié IRVE (qualification P1, P2 ou P3 selon la puissance). Cette certification est vérifiable sur le site Qualifelec.`,
      `L'installation d'une wallbox à ${commune.nom} respecte les prescriptions du décret 2017-26 relatif aux IRVE. Le raccordement au réseau Enedis local est effectué via un compteur Linky permettant le délestage dynamique.`,
      `À ${commune.nom}, nos artisans suivent scrupuleusement le cahier des charges UTE C 15-722 pour les IRVE. La section de câble, la protection différentielle et le disjoncteur sont dimensionnés selon la puissance installée et la longueur du cheminement.`
    ],
    copropriete: [
      `L'installation en copropriété à ${commune.nom} est encadrée par le décret n° 2020-1720 relatif au droit à la prise. Le câblage dans les parties communes doit emprunter des chemins coupe-feu conformes à la réglementation incendie des parkings souterrains.`,
      `La pose en résidence collective à ${commune.nom} respecte les dispositions de la loi LOM (article 64) et le guide de l'ANIL pour la recharge en copropriété. Le sous-compteur individuel certifié MID garantit une facturation conforme.`,
      `Les travaux en copropriété à ${commune.nom} sont réalisés conformément à la norme NF C 15-100 et au guide technique Promotelec. Une étude de puissance disponible au TGBT est réalisée préalablement pour dimensionner l'infrastructure.`,
      `À ${commune.nom}, l'installation IRVE en copropriété intègre obligatoirement un dispositif de protection contre les surcharges et les défauts d'isolement, conformément aux articles R. 113-11 et suivants du code de la construction.`
    ],
    wallbox: [
      `Le raccordement d'une wallbox à ${commune.nom} est conforme au guide UTE C 15-722. L'interrupteur différentiel type A-EV détecte les courants de fuite continus propres aux chargeurs embarqués des véhicules électriques.`,
      `La sécurité électrique de votre installation de wallbox à ${commune.nom} est garantie par le respect strict de la norme NF C 15-100 amendée 2024. Le disjoncteur courbe C et le différentiel 30 mA type A-EV sont dimensionnés selon la puissance de la borne.`,
      `À ${commune.nom}, nos installateurs IRVE respectent les spécifications du protocole IEC 61851-1 pour la communication entre la borne et le véhicule. Cette conformité assure une charge sécurisée avec tout véhicule compatible type 2.`,
      `L'installation de votre wallbox à ${commune.nom} intègre une protection anti-foudre si la borne est exposée en extérieur, conformément aux recommandations du guide UTE C 15-722 pour les IRVE en zones à risque kéraunique.`
    ]
  };
  const regIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 97, REGULATION_POOLS[category].length);
  const localRegulation = REGULATION_POOLS[category][regIdx];

  // --- 1g. Enriched sourcesCitation — 4 variants ---
  const SOURCES_POOLS = [
    `Données statistiques issues de l'Insee (recensement ${commune.codePostal}), de l'Avere-France (baromètre VE 2026) et des données ouvertes Enedis Yvelines. Prix constatés auprès d'un panel d'installateurs IRVE agréés.`,
    `Sources : registre des immatriculations de véhicules électriques (SDES), fichiers fonciers DVF pour ${commune.nom}, données Enedis OpenData et barème ADVENIR 2026 actualisé.`,
    `Informations compilées à partir des données publiques de l'Insee, du portail data.gouv.fr (IRVE), de l'observatoire Avere-France et des retours terrain de nos installateurs partenaires dans les Yvelines.`,
    `Références : norme NF C 15-100 (Afnor), guide UTE C 15-722, programme ADVENIR (avenir.mobi), barème crédit d'impôt 2026 (CGI art. 200 quater C), données de population Insee pour ${commune.nom} (${commune.codePostal}).`
  ];
  const sourcesIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 98, SOURCES_POOLS.length);
  const sourcesCitation = SOURCES_POOLS[sourcesIdx];

  // --- 1h. New mobiliteContext field ---
  const distKm = commune.distanceVersailles || 10;
  const pendulaireProfil = distKm > 30 ? 'grand pendulaire (> 30 km)' : distKm > 15 ? 'pendulaire moyen (15-30 km)' : 'trajet court (< 15 km)';
  const MOBILITE_TEMPLATES = [
    `Les habitants de ${commune.nom} effectuent en moyenne un trajet de ${distKm} km pour rejoindre Versailles, ce qui correspond à un profil de ${pendulaireProfil}. Avec une consommation moyenne de 15 kWh/100 km, ce trajet aller-retour ne consomme que ${(distKm * 2 * 0.15).toFixed(1)} kWh — soit environ ${((distKm * 2 * 0.15) * 0.18).toFixed(1)} € en heures creuses.`,
    `Situé à ${distKm} km du centre de Versailles, ${commune.nom} présente un profil de mobilité ${pendulaireProfil}. La recharge nocturne à domicile couvre largement l'autonomie nécessaire pour les trajets quotidiens, y compris les déplacements vers les zones d'activités de Vélizy, SQY ou La Défense.`,
    `La position géographique de ${commune.nom} (${distKm} km de Versailles) place ses habitants en situation de ${pendulaireProfil}. La wallbox à domicile permet de « faire le plein » chaque nuit pour un coût de ${((distKm * 2 * 0.15) * 0.18).toFixed(1)} € par jour ouvré, contre ${((distKm * 2 * 0.08) * 1.85).toFixed(1)} € en thermique.`,
    `Les résidents de ${commune.nom} parcourent en moyenne ${distKm * 2} km par jour pour leurs trajets domicile-travail. Avec une wallbox de 7.4 kW, la récupération de cette autonomie ne nécessite que ${((distKm * 2 * 0.15) / 7.4).toFixed(1)} heures de charge — largement réalisable pendant la nuit en heures creuses.`
  ];
  const mobiliteIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 110, MOBILITE_TEMPLATES.length);
  const mobiliteContext = MOBILITE_TEMPLATES[mobiliteIdx];

  // --- 1i. New specificiteElectrique field ---
  const densiteBornesVal = commune.densiteBornes || 1.3;
  const bornesPub = commune.bornesPubliques || 5;
  const maisonPctVal = commune.logementsMaison || 50;
  const abonnementReco = maisonPctVal > 60 ? '9 kVA monophasé' : '12 kVA monophasé ou 12 kVA triphasé';
  const ELECTRIQUE_TEMPLATES = [
    `Le réseau de recharge public à ${commune.nom} compte ${bornesPub} points de charge pour une densité de ${densiteBornesVal} borne pour 1 000 habitants — un maillage encore insuffisant face à la demande. Pour les ${maisonPctVal > 50 ? 'nombreux ' : ''}propriétaires de maison individuelle, un abonnement Enedis de ${abonnementReco} est recommandé pour alimenter une wallbox de 7.4 kW sans risque de disjonction.`,
    `Avec ${bornesPub} bornes publiques pour ${commune.population.toLocaleString()} habitants, ${commune.nom} affiche une densité de recharge de ${densiteBornesVal}/1 000. Ce ratio, couplé à la croissance de ${commune.croissanceVE}% du parc VE local, rend la borne privée indispensable. L'abonnement type recommandé est ${abonnementReco} pour une installation standard.`,
    `L'infrastructure de recharge publique à ${commune.nom} (${bornesPub} points, densité ${densiteBornesVal}/1 000 hab.) est complétée par un réseau Enedis stable. Pour les habitations dotées d'un compteur Linky, le délestage dynamique intégré à la wallbox optimise la puissance disponible sans nécessiter de surclassement d'abonnement systématique.`,
    `Le profil électrique de ${commune.nom} (${maisonPctVal}% de maisons, marché ${commune.marcheImmobilier || 'intermédiaire'}) oriente vers un abonnement ${abonnementReco} pour une installation de wallbox 7.4 kW. Les ${bornesPub} bornes publiques existantes, bien qu'utiles en dépannage, ne couvrent pas les besoins de recharge quotidienne des ${(commune.vehiculesElectriques || 120).toLocaleString()} VE locaux.`
  ];
  const electriqueIdx = getVariantIndex(seed, CATEGORY_OFFSETS[category] + 120, ELECTRIQUE_TEMPLATES.length);
  const specificiteElectrique = ELECTRIQUE_TEMPLATES[electriqueIdx];

  return {
    introParagraph,
    logisticsAlert,
    useCaseText,
    pricesContext,
    faqItems,
    ecoText,
    localContext,
    climateZoneLabel,
    localAgencyName,
    externalLinks: getExternalLinks(category, commune.codePostal, commune.slug),
    communeDataInsight,
    expertTip,
    tableIntro,
    guideLinks: getGuideLinks(category, commune.slug),
    savingsEstimate,
    lastUpdated,
    realEstateInsight,
    populationTierContent,
    densiteAnalysis,
    marcheImmobilierInsight,
    distanceLyonContext,
    anecdotePatrimoine,
    localRegulation,
    sourcesCitation,
    mobiliteContext,
    specificiteElectrique
  };
}

