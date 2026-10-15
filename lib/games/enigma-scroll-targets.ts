/**
 * Enigma Scroll : mots à deviner, avec leur traduction et leur niveau.
 *
 * Mots courants, sans noms propres ni pluriels, adaptés à un public scolaire.
 * Niveau : 1 = A1 ... 5 = C1. Chaque mot figure aussi dans la liste des
 * propositions acceptées (public/data/enigma-guesses-<longueur>.json).
 * Format compact : [mot, traduction, niveau].
 */

import type { GameLevel } from "./levels";

export type EnigmaTarget = { word: string; french: string; level: GameLevel };
type Entry = readonly [string, string, GameLevel];

const FOUR: readonly Entry[] = [
  // Niveau 1
  ["BOOK", "livre", 1], ["BALL", "ballon", 1], ["CAKE", "gâteau", 1], ["BIRD", "oiseau", 1], ["FISH", "poisson", 1],
  ["FROG", "grenouille", 1], ["BEAR", "ours", 1], ["DUCK", "canard", 1], ["LION", "lion", 1], ["GOAT", "chèvre", 1],
  ["MILK", "lait", 1], ["RICE", "riz", 1], ["MEAT", "viande", 1], ["SOUP", "soupe", 1], ["FOOD", "nourriture", 1],
  ["PEAR", "poire", 1], ["TREE", "arbre", 1], ["LEAF", "feuille", 1], ["RAIN", "pluie", 1], ["SNOW", "neige", 1],
  ["WIND", "vent", 1], ["MOON", "lune", 1], ["STAR", "étoile", 1], ["BLUE", "bleu", 1], ["PINK", "rose", 1],
  ["GREY", "gris", 1], ["HAND", "main", 1], ["FOOT", "pied", 1], ["HEAD", "tête", 1], ["NOSE", "nez", 1],
  ["KNEE", "genou", 1], ["NECK", "cou", 1], ["HAIR", "cheveux", 1], ["FACE", "visage", 1], ["BODY", "corps", 1],
  ["DOOR", "porte", 1], ["ROOM", "pièce", 1], ["DESK", "bureau", 1], ["LAMP", "lampe", 1], ["HOME", "maison", 1],
  ["TOWN", "ville", 1], ["ROAD", "route", 1], ["PARK", "parc", 1], ["SHOP", "magasin", 1], ["BIKE", "vélo", 1],
  ["BOAT", "bateau", 1], ["DOLL", "poupée", 1], ["GAME", "jeu", 1], ["BABY", "bébé", 1], ["GIRL", "fille", 1],
  ["AUNT", "tante", 1], ["SING", "chanter", 1], ["SWIM", "nager", 1], ["JUMP", "sauter", 1], ["PLAY", "jouer", 1],
  ["READ", "lire", 1], ["COOK", "cuisiner", 1], ["WALK", "marcher", 1], ["TALK", "parler", 1], ["LOOK", "regarder", 1],
  ["LIKE", "aimer", 1], ["WANT", "vouloir", 1], ["MAKE", "faire", 1], ["TAKE", "prendre", 1], ["GIVE", "donner", 1],
  ["COME", "venir", 1], ["OPEN", "ouvrir", 1], ["STOP", "arrêter", 1], ["HELP", "aider", 1], ["WORK", "travailler", 1],
  ["WAIT", "attendre", 1], ["COLD", "froid", 1], ["WARM", "chaud", 1], ["TALL", "grand", 1], ["LONG", "long", 1],
  ["FAST", "rapide", 1], ["SLOW", "lent", 1], ["NICE", "sympa", 1], ["GOOD", "bon", 1], ["EASY", "facile", 1],
  ["HARD", "difficile", 1], ["DARK", "sombre", 1], ["LATE", "en retard", 1], ["WEEK", "semaine", 1], ["YEAR", "année", 1],
  ["TIME", "temps", 1], ["HOUR", "heure", 1], ["NAME", "nom", 1], ["WORD", "mot", 1], ["SONG", "chanson", 1],
  ["FILM", "film", 1], ["FARM", "ferme", 1], ["SAND", "sable", 1], ["LAKE", "lac", 1], ["HILL", "colline", 1],
  ["WAVE", "vague", 1], ["SHOE", "chaussure", 1], ["SOCK", "chaussette", 1], ["COAT", "manteau", 1], ["BELT", "ceinture", 1],
  ["CARD", "carte", 1], ["GIFT", "cadeau", 1], ["KITE", "cerf-volant", 1], ["ZERO", "zéro", 1], ["FIVE", "cinq", 1],
  ["FOUR", "quatre", 1], ["NINE", "neuf", 1],
  // Niveau 2
  ["BANK", "banque", 2], ["COIN", "pièce de monnaie", 2], ["FORK", "fourchette", 2], ["DISH", "plat", 2], ["BOWL", "bol", 2],
  ["OVEN", "four", 2], ["SOAP", "savon", 2], ["ROOF", "toit", 2], ["WALL", "mur", 2], ["WOOD", "bois", 2],
  ["IRON", "fer", 2], ["ROCK", "rocher", 2], ["CAVE", "grotte", 2], ["NEST", "nid", 2], ["WING", "aile", 2],
  ["TAIL", "queue", 2], ["WOLF", "loup", 2], ["DEER", "cerf", 2], ["SWAN", "cygne", 2], ["CRAB", "crabe", 2],
  ["BEEF", "bœuf", 2], ["CORN", "maïs", 2], ["SALT", "sel", 2], ["MEAL", "repas", 2], ["DIET", "régime", 2],
  ["BOIL", "bouillir", 2], ["BAKE", "cuire au four", 2], ["MENU", "menu", 2], ["TRIP", "voyage", 2], ["TOUR", "visite", 2],
  ["MAIL", "courrier", 2], ["NEWS", "informations", 2], ["JOKE", "blague", 2], ["IDEA", "idée", 2], ["PLAN", "projet", 2],
  ["RULE", "règle", 2], ["TEST", "contrôle", 2], ["EXAM", "examen", 2], ["MARK", "note", 2], ["TEAM", "équipe", 2],
  ["GOAL", "but", 2], ["RACE", "course", 2], ["LOSE", "perdre", 2], ["CLUB", "club", 2], ["POOL", "piscine", 2],
  ["BOSS", "patron", 2], ["FIRE", "feu", 2], ["PATH", "chemin", 2], ["WILD", "sauvage", 2], ["CALM", "calme", 2],
  ["BUSY", "occupé", 2], ["LAZY", "paresseux", 2], ["RICH", "riche", 2], ["POOR", "pauvre", 2], ["SAFE", "en sécurité", 2],
  ["TRUE", "vrai", 2], ["FREE", "libre", 2], ["FULL", "plein", 2], ["HALF", "moitié", 2], ["LAST", "dernier", 2],
  ["NEXT", "prochain", 2], ["ONCE", "une fois", 2], ["SEND", "envoyer", 2], ["SELL", "vendre", 2], ["MEET", "rencontrer", 2],
  ["MOVE", "bouger", 2], ["PULL", "tirer", 2], ["PUSH", "pousser", 2], ["DROP", "laisser tomber", 2], ["FALL", "tomber", 2],
  ["HOLD", "tenir", 2], ["FILL", "remplir", 2], ["KEEP", "garder", 2], ["LEND", "prêter", 2], ["MISS", "rater", 2],
  ["SAVE", "sauver", 2], ["SHUT", "fermer", 2], ["TURN", "tourner", 2], ["WASH", "laver", 2], ["WISH", "souhaiter", 2],
  ["WEAR", "porter", 2], ["WAKE", "se réveiller", 2], ["CALL", "appeler", 2], ["FEEL", "ressentir", 2], ["FIND", "trouver", 2],
  ["HEAR", "entendre", 2], ["KNOW", "savoir", 2], ["LIVE", "vivre", 2], ["TELL", "dire", 2], ["SHOW", "montrer", 2],
  ["GROW", "grandir", 2], ["HIDE", "cacher", 2], ["KNIT", "tricoter", 2], ["MELT", "fondre", 2], ["POUR", "verser", 2],
  ["TIDY", "ranger", 2], ["CLAP", "applaudir", 2], ["DIVE", "plonger", 2], ["BURN", "brûler", 2], ["BITE", "mordre", 2],
  ["BEND", "plier", 2], ["LEFT", "gauche", 2], ["ROLL", "rouler", 2], ["RING", "bague", 2], ["HOLE", "trou", 2],
  ["GATE", "portail", 2], ["LOCK", "serrure", 2], ["PAGE", "page", 2], ["POEM", "poème", 2], ["POET", "poète", 2],
  ["TENT", "tente", 2], ["SEAT", "siège", 2], ["SIZE", "taille", 2], ["SKIN", "peau", 2], ["SOFT", "doux", 2],
  ["THIN", "mince", 2], ["TINY", "minuscule", 2], ["TOOL", "outil", 2], ["WOOL", "laine", 2], ["ROPE", "corde", 2],
  ["RENT", "loyer", 2], ["CHEF", "chef cuisinier", 2], ["NOTE", "note", 2],
  // Niveau 3
  ["BOLD", "audacieux", 3], ["CLUE", "indice", 3], ["DEBT", "dette", 3], ["DUTY", "devoir", 3], ["EDGE", "bord", 3],
  ["FAIR", "juste", 3], ["FAME", "célébrité", 3], ["FATE", "destin", 3], ["FUEL", "carburant", 3], ["HINT", "indice", 3],
  ["LEAD", "mener", 3], ["LOAN", "prêt", 3], ["MOOD", "humeur", 3], ["PACE", "rythme", 3], ["POLL", "sondage", 3],
  ["RISK", "risque", 3], ["ROLE", "rôle", 3], ["RUDE", "impoli", 3], ["SALE", "vente", 3], ["SEED", "graine", 3],
  ["SOIL", "terre", 3], ["SOUL", "âme", 3], ["STEP", "étape", 3], ["TASK", "tâche", 3], ["TIDE", "marée", 3],
  ["UNIT", "unité", 3], ["VAST", "immense", 3], ["VIEW", "vue", 3], ["VOTE", "vote", 3], ["WAGE", "salaire", 3],
  ["WISE", "sage", 3], ["WORM", "ver", 3], ["YELL", "hurler", 3], ["ZONE", "zone", 3], ["ECHO", "écho", 3],
  ["EXIT", "sortie", 3], ["ITEM", "article", 3], ["LINK", "lien", 3], ["MESS", "désordre", 3], ["PAIR", "paire", 3],
  ["PART", "partie", 3], ["PEAK", "sommet", 3], ["PILE", "tas", 3], ["PLOT", "intrigue", 3], ["PORT", "port", 3],
  ["SIGN", "panneau", 3], ["SLIP", "glisser", 3], ["SOUR", "aigre", 3], ["SWAP", "échanger", 3], ["TEXT", "texte", 3],
  ["TYPE", "type", 3], ["WIRE", "fil", 3], ["CREW", "équipage", 3], ["HEAL", "guérir", 3], ["OBEY", "obéir", 3],
  ["QUIT", "quitter", 3], ["RUIN", "ruiner", 3], ["SINK", "couler", 3], ["SUIT", "costume", 3], ["WARN", "avertir", 3],
  ["COPY", "copier", 3], ["CASH", "espèces", 3], ["FACT", "fait", 3], ["LACK", "manque", 3], ["LAND", "terre", 3],
  ["LAWN", "pelouse", 3], ["MASK", "masque", 3], ["PALM", "paume", 3], ["PEEL", "éplucher", 3], ["PIPE", "tuyau", 3],
  ["POND", "étang", 3], ["PURE", "pur", 3], ["RARE", "rare", 3], ["REAL", "réel", 3], ["RUSH", "se précipiter", 3],
  ["SHIP", "navire", 3], ["SILK", "soie", 3], ["SORT", "trier", 3], ["STEM", "tige", 3], ["TANK", "réservoir", 3],
  ["TRAP", "piège", 3], ["TUBE", "tube", 3], ["TUNE", "mélodie", 3], ["TWIN", "jumeau", 3], ["VERB", "verbe", 3],
  ["VASE", "vase", 3], ["WIPE", "essuyer", 3], ["WAND", "baguette magique", 3],
  // Niveau 4
  ["BLUR", "flou", 4], ["COPE", "faire face", 4], ["DUSK", "crépuscule", 4], ["DAWN", "aube", 4], ["FLAW", "défaut", 4],
  ["HOOK", "crochet", 4], ["MYTH", "mythe", 4], ["PREY", "proie", 4], ["SCAM", "arnaque", 4], ["TAME", "apprivoiser", 4],
  ["VAIN", "vaniteux", 4], ["VEIL", "voile", 4], ["YAWN", "bâiller", 4], ["KEEN", "enthousiaste", 4], ["BRAG", "se vanter", 4],
  ["CHOP", "hacher", 4], ["DEAF", "sourd", 4], ["MILD", "doux", 4], ["GRIN", "large sourire", 4], ["LEAP", "bondir", 4],
  ["MOAN", "râler", 4], ["POSH", "chic", 4], ["SHED", "cabane", 4], ["SLAM", "claquer", 4], ["TOSS", "lancer", 4],
  ["CROP", "récolte", 4], ["GLOW", "lueur", 4], ["HIRE", "embaucher", 4], ["SEEK", "chercher", 4], ["STIR", "remuer", 4],
  ["VARY", "varier", 4], ["AXIS", "axe", 4], ["CLAN", "clan", 4], ["HALT", "halte", 4], ["IDLE", "oisif", 4],
  ["KNOB", "bouton de porte", 4], ["MOCK", "se moquer", 4], ["PAWN", "pion", 4], ["SAGA", "saga", 4], ["TACT", "tact", 4],
  ["TROT", "trotter", 4],
  // Niveau 5
  ["BIAS", "parti pris", 5], ["LURE", "attirer", 5], ["OATH", "serment", 5], ["OMEN", "présage", 5], ["PLEA", "supplication", 5],
  ["RIFT", "fossé", 5], ["SOAR", "s'envoler", 5], ["TOIL", "labeur", 5], ["VOID", "vide", 5], ["WARY", "méfiant", 5],
  ["ZEAL", "zèle", 5], ["FEAT", "exploit", 5], ["GUST", "rafale", 5], ["HAZE", "brume", 5], ["HOAX", "canular", 5],
  ["NUMB", "engourdi", 5], ["REAP", "récolter", 5], ["SMUG", "suffisant", 5], ["SNUG", "douillet", 5], ["SWAY", "se balancer", 5],
  ["DEED", "acte", 5], ["GAZE", "regard", 5], ["JEST", "plaisanterie", 5], ["LAIR", "repaire", 5], ["LUSH", "luxuriant", 5],
  ["NOOK", "recoin", 5], ["OMIT", "omettre", 5], ["PERK", "avantage", 5], ["WHIM", "caprice", 5],
];

const FIVE: readonly Entry[] = [
  // Niveau 1
  ["APPLE", "pomme", 1], ["BREAD", "pain", 1], ["CHAIR", "chaise", 1], ["TABLE", "table", 1], ["HOUSE", "maison", 1],
  ["MOUSE", "souris", 1], ["HORSE", "cheval", 1], ["SHEEP", "mouton", 1], ["TIGER", "tigre", 1], ["ZEBRA", "zèbre", 1],
  ["SNAKE", "serpent", 1], ["WHALE", "baleine", 1], ["SHARK", "requin", 1], ["CAMEL", "chameau", 1], ["PANDA", "panda", 1],
  ["BEACH", "plage", 1], ["RIVER", "rivière", 1], ["CLOUD", "nuage", 1], ["SUNNY", "ensoleillé", 1], ["RAINY", "pluvieux", 1],
  ["WATER", "eau", 1], ["JUICE", "jus", 1], ["PIZZA", "pizza", 1], ["LEMON", "citron", 1], ["MANGO", "mangue", 1],
  ["PEACH", "pêche", 1], ["GRAPE", "raisin", 1], ["SALAD", "salade", 1], ["PASTA", "pâtes", 1], ["LUNCH", "déjeuner", 1],
  ["SUGAR", "sucre", 1], ["HAPPY", "heureux", 1], ["FUNNY", "drôle", 1], ["ANGRY", "en colère", 1], ["TIRED", "fatigué", 1],
  ["SMALL", "petit", 1], ["GREEN", "vert", 1], ["BLACK", "noir", 1], ["WHITE", "blanc", 1], ["BROWN", "marron", 1],
  ["MUSIC", "musique", 1], ["PIANO", "piano", 1], ["PAPER", "papier", 1], ["CLASS", "classe", 1], ["CHILD", "enfant", 1],
  ["UNCLE", "oncle", 1], ["MONEY", "argent", 1], ["PHONE", "téléphone", 1], ["CLOCK", "horloge", 1], ["WATCH", "montre", 1],
  ["HOTEL", "hôtel", 1], ["TRAIN", "train", 1], ["PLANE", "avion", 1], ["TRUCK", "camion", 1], ["SPORT", "sport", 1],
  ["DANCE", "danser", 1], ["SMILE", "sourire", 1], ["SLEEP", "dormir", 1], ["DRINK", "boire", 1], ["WRITE", "écrire", 1],
  ["LEARN", "apprendre", 1], ["SPEAK", "parler", 1], ["CLEAN", "propre", 1], ["DIRTY", "sale", 1], ["EARLY", "tôt", 1],
  ["NIGHT", "nuit", 1], ["MONTH", "mois", 1], ["TODAY", "aujourd'hui", 1], ["DRESS", "robe", 1], ["SHIRT", "chemise", 1],
  ["SKIRT", "jupe", 1], ["SCARF", "écharpe", 1], ["GLOVE", "gant", 1], ["MOUTH", "bouche", 1], ["HEART", "cœur", 1],
  ["THUMB", "pouce", 1], ["BRUSH", "brosse", 1], ["TOWEL", "serviette", 1], ["SPOON", "cuillère", 1], ["KNIFE", "couteau", 1],
  ["PLATE", "assiette", 1], ["GLASS", "verre", 1], ["COUNT", "compter", 1], ["THREE", "trois", 1], ["SEVEN", "sept", 1],
  ["EIGHT", "huit", 1], ["FRUIT", "fruit", 1], ["MOVIE", "film", 1], ["PARTY", "fête", 1], ["STORY", "histoire", 1],
  ["RADIO", "radio", 1], ["ROBOT", "robot", 1], ["VIDEO", "vidéo", 1], ["VISIT", "visiter", 1], ["SORRY", "désolé", 1],
  ["THINK", "penser", 1], ["THING", "chose", 1], ["WORLD", "monde", 1], ["YOUNG", "jeune", 1], ["SHORT", "court", 1],
  ["TOOTH", "dent", 1], ["CANDY", "bonbon", 1], ["AFTER", "après", 1], ["CLOSE", "fermer", 1],
  // Niveau 2
  ["ABOVE", "au-dessus", 2], ["AGAIN", "encore", 2], ["ALONE", "seul", 2], ["BEGIN", "commencer", 2], ["BRAVE", "courageux", 2],
  ["BUILD", "construire", 2], ["CARRY", "porter", 2], ["CATCH", "attraper", 2], ["CHEAP", "bon marché", 2], ["CLIMB", "grimper", 2],
  ["COUCH", "canapé", 2], ["CROWN", "couronne", 2], ["DREAM", "rêve", 2], ["EARTH", "terre", 2], ["EMPTY", "vide", 2],
  ["ENJOY", "apprécier", 2], ["ENTER", "entrer", 2], ["FIELD", "champ", 2], ["FLOOR", "sol", 2], ["FRESH", "frais", 2],
  ["GHOST", "fantôme", 2], ["GIANT", "géant", 2], ["GUEST", "invité", 2], ["GUIDE", "guide", 2], ["HEAVY", "lourd", 2],
  ["HOBBY", "passe-temps", 2], ["HONEY", "miel", 2], ["LAUGH", "rire", 2], ["LIGHT", "lumière", 2], ["LUCKY", "chanceux", 2],
  ["MAGIC", "magie", 2], ["MATCH", "match", 2], ["METAL", "métal", 2], ["NOISY", "bruyant", 2], ["NURSE", "infirmier", 2],
  ["OCEAN", "océan", 2], ["OFTEN", "souvent", 2], ["PAINT", "peindre", 2], ["PLANT", "plante", 2], ["PRICE", "prix", 2],
  ["QUEEN", "reine", 2], ["QUICK", "rapide", 2], ["QUIET", "calme", 2], ["READY", "prêt", 2], ["ROUND", "rond", 2],
  ["SCORE", "score", 2], ["SHAPE", "forme", 2], ["SHARE", "partager", 2], ["SHELF", "étagère", 2], ["SMELL", "sentir", 2],
  ["SOUND", "son", 2], ["SPACE", "espace", 2], ["STORM", "tempête", 2], ["STONE", "pierre", 2], ["STUDY", "étudier", 2],
  ["SWEET", "sucré", 2], ["TASTE", "goût", 2], ["TEACH", "enseigner", 2], ["TOAST", "pain grillé", 2], ["TOUCH", "toucher", 2],
  ["TOWER", "tour", 2], ["VOICE", "voix", 2], ["WORRY", "s'inquiéter", 2], ["BAKER", "boulanger", 2], ["CHALK", "craie", 2],
  ["BENCH", "banc", 2], ["ADULT", "adulte", 2], ["AGREE", "être d'accord", 2], ["ALARM", "alarme", 2], ["BRAIN", "cerveau", 2],
  ["CLEAR", "clair", 2], ["CRAZY", "fou", 2], ["CROSS", "traverser", 2], ["ERROR", "erreur", 2], ["IMAGE", "image", 2],
  ["LEVEL", "niveau", 2], ["PAUSE", "pause", 2], ["RELAX", "se détendre", 2], ["SMART", "intelligent", 2], ["SPEED", "vitesse", 2],
  ["SPEND", "dépenser", 2], ["STILL", "toujours", 2], ["STORE", "magasin", 2], ["TRUTH", "vérité", 2], ["UNTIL", "jusqu'à", 2],
  ["WHEEL", "roue", 2], ["SAUCE", "sauce", 2], ["ONION", "oignon", 2], ["OLIVE", "olive", 2], ["PEARL", "perle", 2],
  ["BERRY", "baie", 2], ["CHESS", "échecs", 2], ["PUPPY", "chiot", 2], ["KOALA", "koala", 2], ["EAGLE", "aigle", 2],
  ["SNAIL", "escargot", 2], ["FAIRY", "fée", 2], ["WITCH", "sorcière", 2], ["CLOWN", "clown", 2],
  // Niveau 3
  ["ADMIT", "admettre", 3], ["ADOPT", "adopter", 3], ["ALLOW", "permettre", 3], ["AMONG", "parmi", 3], ["ANGLE", "angle", 3],
  ["ARGUE", "se disputer", 3], ["AVOID", "éviter", 3], ["AWARD", "prix", 3], ["BLAME", "reprocher", 3], ["BLIND", "aveugle", 3],
  ["BRAND", "marque", 3], ["CAUSE", "cause", 3], ["CHAIN", "chaîne", 3], ["CHARM", "charme", 3], ["CHASE", "poursuivre", 3],
  ["CHEAT", "tricher", 3], ["CHIEF", "chef", 3], ["COAST", "côte", 3], ["CROWD", "foule", 3], ["CYCLE", "cycle", 3],
  ["DAILY", "quotidien", 3], ["DELAY", "retard", 3], ["DOUBT", "doute", 3], ["DOZEN", "douzaine", 3], ["ENEMY", "ennemi", 3],
  ["ENTRY", "entrée", 3], ["EQUAL", "égal", 3], ["EVENT", "événement", 3], ["EXACT", "exact", 3], ["EXTRA", "supplémentaire", 3],
  ["FAULT", "faute", 3], ["FENCE", "clôture", 3], ["FOCUS", "se concentrer", 3], ["FORCE", "force", 3], ["HABIT", "habitude", 3],
  ["IDEAL", "idéal", 3], ["JUDGE", "juge", 3], ["LABEL", "étiquette", 3], ["LIMIT", "limite", 3], ["NOVEL", "roman", 3],
  ["OFFER", "offrir", 3], ["PANIC", "panique", 3], ["PEACE", "paix", 3], ["PILOT", "pilote", 3], ["PRIDE", "fierté", 3],
  ["PROOF", "preuve", 3], ["PROUD", "fier", 3], ["PROVE", "prouver", 3], ["RAISE", "lever", 3], ["RAPID", "rapide", 3],
  ["REACH", "atteindre", 3], ["REACT", "réagir", 3], ["REPLY", "répondre", 3], ["ROUTE", "itinéraire", 3], ["ROYAL", "royal", 3],
  ["SCENE", "scène", 3], ["SENSE", "sens", 3], ["SERVE", "servir", 3], ["SHINE", "briller", 3], ["SKILL", "compétence", 3],
  ["SLICE", "tranche", 3], ["SOLVE", "résoudre", 3], ["SPICY", "épicé", 3], ["STEAL", "voler", 3], ["STRAW", "paille", 3],
  ["STUCK", "coincé", 3], ["STYLE", "style", 3], ["SWING", "balançoire", 3], ["THEME", "thème", 3], ["THIEF", "voleur", 3],
  ["TOPIC", "sujet", 3], ["TOTAL", "total", 3], ["TOUGH", "dur", 3], ["TRADE", "commerce", 3], ["TRICK", "tour", 3],
  ["UPSET", "contrarié", 3], ["USUAL", "habituel", 3], ["VALUE", "valeur", 3], ["WASTE", "gaspiller", 3], ["WEIRD", "bizarre", 3],
  ["YOUTH", "jeunesse", 3], ["CABIN", "cabane", 3], ["THICK", "épais", 3], ["SIGHT", "vue", 3], ["TRUST", "confiance", 3],
  ["ALIVE", "vivant", 3], ["AWAKE", "éveillé", 3], ["SOLID", "solide", 3], ["COMET", "comète", 3], ["FROST", "givre", 3],
  ["GRAIN", "grain", 3], ["LOYAL", "fidèle", 3], ["MERRY", "joyeux", 3], ["PUPIL", "élève", 3], ["RIDER", "cavalier", 3],
  ["SCALE", "échelle", 3], ["STAFF", "personnel", 3], ["SWEAR", "jurer", 3], ["CRISP", "croustillant", 3], ["ESSAY", "rédaction", 3],
  ["OTTER", "loutre", 3],
  // Niveau 4
  ["AWARE", "conscient", 4], ["BLEND", "mélanger", 4], ["BOAST", "se vanter", 4], ["BRIEF", "bref", 4], ["CHAOS", "chaos", 4],
  ["CLAIM", "affirmer", 4], ["CRAFT", "artisanat", 4], ["CURVE", "courbe", 4], ["DRAFT", "brouillon", 4], ["ELDER", "aîné", 4],
  ["FAITH", "foi", 4], ["FRAME", "cadre", 4], ["GREET", "saluer", 4], ["HEDGE", "haie", 4], ["LAYER", "couche", 4],
  ["MAJOR", "majeur", 4], ["MINOR", "mineur", 4], ["PHASE", "phase", 4], ["PITCH", "terrain", 4], ["PLAIN", "simple", 4],
  ["QUOTE", "citation", 4], ["RANGE", "gamme", 4], ["RIVAL", "rival", 4], ["ROUGH", "rugueux", 4], ["SHAME", "honte", 4],
  ["SHARP", "tranchant", 4], ["SPOIL", "gâcher", 4], ["TRACE", "trace", 4], ["TREND", "tendance", 4], ["UNITE", "unir", 4],
  ["URBAN", "urbain", 4], ["VALID", "valable", 4], ["VITAL", "vital", 4], ["GRASP", "saisir", 4], ["IRONY", "ironie", 4],
  ["MERIT", "mérite", 4], ["NAIVE", "naïf", 4], ["REBEL", "rebelle", 4], ["REIGN", "règne", 4], ["SWIFT", "rapide", 4],
  ["VIVID", "vif", 4], ["FEAST", "festin", 4], ["FLOCK", "troupeau", 4], ["SCOUT", "éclaireur", 4], ["SHRUG", "hausser les épaules", 4],
  ["SNEAK", "se faufiler", 4], ["STEEP", "raide", 4], ["TEASE", "taquiner", 4], ["WEARY", "las", 4], ["WIDTH", "largeur", 4],
  ["TRIBE", "tribu", 4],
  // Niveau 5
  ["ALOOF", "distant", 5], ["AMPLE", "ample", 5], ["BLUNT", "brusque", 5], ["BRISK", "vif", 5], ["CRAVE", "avoir très envie de", 5],
  ["DECOY", "leurre", 5], ["EERIE", "inquiétant", 5], ["ENVOY", "envoyé", 5], ["EVOKE", "évoquer", 5], ["EXERT", "exercer", 5],
  ["FEIGN", "feindre", 5], ["FLAIR", "flair", 5], ["GAUGE", "jauge", 5], ["HAVOC", "ravages", 5], ["LEDGE", "rebord", 5],
  ["LOFTY", "élevé", 5], ["PROBE", "sonde", 5], ["QUIRK", "bizarrerie", 5], ["REALM", "royaume", 5], ["SCORN", "mépris", 5],
  ["STERN", "sévère", 5], ["TACIT", "tacite", 5], ["UNDUE", "excessif", 5], ["WIELD", "manier", 5], ["WRATH", "colère", 5],
  ["YEARN", "aspirer", 5], ["DWELL", "habiter", 5], ["ADEPT", "habile", 5], ["BLISS", "bonheur", 5], ["MIRTH", "gaieté", 5],
  ["SPURN", "dédaigner", 5], ["TAUNT", "narguer", 5], ["USURP", "usurper", 5], ["VERGE", "bord", 5], ["YIELD", "céder", 5], ["ELUDE", "éluder", 5],
];

const SIX: readonly Entry[] = [
  // Niveau 1
  ["ANIMAL", "animal", 1], ["BANANA", "banane", 1], ["CARROT", "carotte", 1], ["CHEESE", "fromage", 1], ["CHERRY", "cerise", 1],
  ["COFFEE", "café", 1], ["DINNER", "dîner", 1], ["ORANGE", "orange", 1], ["POTATO", "pomme de terre", 1], ["TOMATO", "tomate", 1],
  ["BUTTER", "beurre", 1], ["COOKIE", "biscuit", 1], ["FAMILY", "famille", 1], ["FATHER", "père", 1], ["MOTHER", "mère", 1],
  ["SISTER", "sœur", 1], ["COUSIN", "cousin", 1], ["FRIEND", "ami", 1], ["PEOPLE", "gens", 1], ["SCHOOL", "école", 1],
  ["PENCIL", "crayon", 1], ["RUBBER", "gomme", 1], ["LESSON", "leçon", 1], ["LETTER", "lettre", 1], ["NUMBER", "nombre", 1],
  ["GARDEN", "jardin", 1], ["WINDOW", "fenêtre", 1], ["CASTLE", "château", 1], ["FOREST", "forêt", 1], ["ISLAND", "île", 1],
  ["JUNGLE", "jungle", 1], ["PLANET", "planète", 1], ["FLOWER", "fleur", 1], ["SPRING", "printemps", 1], ["SUMMER", "été", 1],
  ["AUTUMN", "automne", 1], ["WINTER", "hiver", 1], ["YELLOW", "jaune", 1], ["PURPLE", "violet", 1], ["SILVER", "argent", 1],
  ["RABBIT", "lapin", 1], ["MONKEY", "singe", 1], ["DONKEY", "âne", 1], ["TURTLE", "tortue", 1], ["SPIDER", "araignée", 1],
  ["PARROT", "perroquet", 1], ["DRAGON", "dragon", 1], ["PIRATE", "pirate", 1], ["WIZARD", "sorcier", 1], ["DOCTOR", "médecin", 1],
  ["PLAYER", "joueur", 1], ["SINGER", "chanteur", 1], ["JACKET", "veste", 1], ["BUTTON", "bouton", 1], ["POCKET", "poche", 1],
  ["TICKET", "billet", 1], ["CAMERA", "appareil photo", 1], ["GUITAR", "guitare", 1], ["VIOLIN", "violon", 1], ["TENNIS", "tennis", 1],
  ["HOCKEY", "hockey", 1], ["PICNIC", "pique-nique", 1], ["LISTEN", "écouter", 1], ["PLEASE", "s'il te plaît", 1], ["STREET", "rue", 1],
  ["CINEMA", "cinéma", 1], ["MARKET", "marché", 1], ["PRETTY", "joli", 1], ["LITTLE", "petit", 1], ["TWELVE", "douze", 1],
  ["TWENTY", "vingt", 1], ["THIRTY", "trente", 1], ["MINUTE", "minute", 1], ["MOMENT", "moment", 1], ["FINGER", "doigt", 1],
  ["BOTTLE", "bouteille", 1], ["CARPET", "tapis", 1], ["MIRROR", "miroir", 1], ["PILLOW", "oreiller", 1], ["BASKET", "panier", 1],
  ["PARENT", "parent", 1], ["KITTEN", "chaton", 1],
  // Niveau 2
  ["ACTIVE", "actif", 2], ["ALWAYS", "toujours", 2], ["ANSWER", "réponse", 2], ["AROUND", "autour", 2], ["ARRIVE", "arriver", 2],
  ["ARTIST", "artiste", 2], ["ASLEEP", "endormi", 2], ["AUTHOR", "auteur", 2], ["BAKERY", "boulangerie", 2], ["BEAUTY", "beauté", 2],
  ["BECOME", "devenir", 2], ["BEFORE", "avant", 2], ["BEHIND", "derrière", 2], ["BETTER", "meilleur", 2], ["BORING", "ennuyeux", 2],
  ["BREATH", "souffle", 2], ["BRIGHT", "brillant", 2], ["BROKEN", "cassé", 2], ["CHANCE", "occasion", 2], ["CHANGE", "changer", 2],
  ["CHOOSE", "choisir", 2], ["CIRCLE", "cercle", 2], ["CLEVER", "intelligent", 2], ["CLOUDY", "nuageux", 2], ["COMEDY", "comédie", 2],
  ["CORNER", "coin", 2], ["COUPLE", "couple", 2], ["COURSE", "cours", 2], ["DANGER", "danger", 2], ["DECIDE", "décider", 2],
  ["DESERT", "désert", 2], ["DOUBLE", "double", 2], ["DRIVER", "conducteur", 2], ["EASILY", "facilement", 2], ["ENERGY", "énergie", 2],
  ["ENOUGH", "assez", 2], ["ENGINE", "moteur", 2], ["ESCAPE", "s'échapper", 2], ["EXCUSE", "excuse", 2], ["FAMOUS", "célèbre", 2],
  ["FINISH", "finir", 2], ["FLIGHT", "vol", 2], ["FOLLOW", "suivre", 2], ["FORGET", "oublier", 2], ["FROZEN", "gelé", 2],
  ["FUTURE", "avenir", 2], ["GENTLE", "doux", 2], ["GOLDEN", "doré", 2], ["HEALTH", "santé", 2], ["HEIGHT", "hauteur", 2],
  ["HELMET", "casque", 2], ["HIDDEN", "caché", 2], ["HONEST", "honnête", 2], ["HUNGRY", "affamé", 2], ["INSECT", "insecte", 2],
  ["INSIDE", "dedans", 2], ["INVITE", "inviter", 2], ["LEADER", "chef", 2], ["LOVELY", "charmant", 2], ["MIDDLE", "milieu", 2],
  ["MODERN", "moderne", 2], ["NATURE", "nature", 2], ["NEARBY", "proche", 2], ["NEEDLE", "aiguille", 2], ["NOBODY", "personne", 2],
  ["NORMAL", "normal", 2], ["NOTICE", "remarquer", 2], ["OFFICE", "bureau", 2], ["ONLINE", "en ligne", 2], ["PALACE", "palais", 2],
  ["PEPPER", "poivre", 2], ["PERSON", "personne", 2], ["POLICE", "police", 2], ["POLITE", "poli", 2], ["PREFER", "préférer", 2],
  ["PRINCE", "prince", 2], ["PUZZLE", "casse-tête", 2], ["REASON", "raison", 2], ["RECIPE", "recette", 2], ["REMOVE", "enlever", 2],
  ["REPAIR", "réparer", 2], ["REPEAT", "répéter", 2], ["RESCUE", "sauver", 2], ["RETURN", "revenir", 2], ["REWARD", "récompense", 2],
  ["RIDDLE", "devinette", 2], ["ROCKET", "fusée", 2], ["SAFETY", "sécurité", 2], ["SAILOR", "marin", 2], ["SALMON", "saumon", 2],
  ["SEARCH", "chercher", 2], ["SEASON", "saison", 2], ["SECRET", "secret", 2], ["SHADOW", "ombre", 2], ["SHOWER", "douche", 2],
  ["SILENT", "silencieux", 2], ["SIMPLE", "simple", 2], ["SLOWLY", "lentement", 2], ["SMOOTH", "lisse", 2], ["SQUARE", "carré", 2],
  ["STRONG", "fort", 2], ["SUNSET", "coucher de soleil", 2], ["TALENT", "talent", 2], ["TRAVEL", "voyager", 2], ["UNFAIR", "injuste", 2],
  ["UNIQUE", "unique", 2], ["USEFUL", "utile", 2], ["VALLEY", "vallée", 2], ["WALLET", "portefeuille", 2], ["WEIGHT", "poids", 2],
  ["WOODEN", "en bois", 2], ["WORKER", "travailleur", 2], ["NEPHEW", "neveu", 2], ["FRIDGE", "frigo", 2], ["SCREEN", "écran", 2],
  ["CHOICE", "choix", 2], ["AFRAID", "effrayé", 2], ["CREATE", "créer", 2], ["BUBBLE", "bulle", 2], ["CANDLE", "bougie", 2],
  ["PEANUT", "cacahuète", 2], ["SPONGE", "éponge", 2], ["TUNNEL", "tunnel", 2],
  // Niveau 3
  ["ABROAD", "à l'étranger", 3], ["ABSENT", "absent", 3], ["ACCEPT", "accepter", 3], ["ADVICE", "conseil", 3], ["AMOUNT", "quantité", 3],
  ["ANYWAY", "de toute façon", 3], ["APPEAR", "apparaître", 3], ["ATTACH", "attacher", 3], ["BELIEF", "croyance", 3], ["BELONG", "appartenir", 3],
  ["BORDER", "frontière", 3], ["BOTHER", "déranger", 3], ["BUDGET", "budget", 3], ["CAREER", "carrière", 3], ["CLIENT", "client", 3],
  ["COMMON", "commun", 3], ["DAMAGE", "dégâts", 3], ["DEBATE", "débat", 3], ["DEFEAT", "défaite", 3], ["DEFEND", "défendre", 3],
  ["DEPEND", "dépendre", 3], ["DESIRE", "désir", 3], ["DETAIL", "détail", 3], ["DEVICE", "appareil", 3], ["DIRECT", "direct", 3],
  ["EFFECT", "effet", 3], ["EFFORT", "effort", 3], ["EMPIRE", "empire", 3], ["EXCEPT", "sauf", 3], ["EXPECT", "s'attendre à", 3],
  ["EXPERT", "expert", 3], ["IGNORE", "ignorer", 3], ["IMPACT", "impact", 3], ["INFORM", "informer", 3], ["INVENT", "inventer", 3],
  ["LAWYER", "avocat", 3], ["LEAGUE", "ligue", 3], ["LENGTH", "longueur", 3], ["LIQUID", "liquide", 3], ["MANAGE", "gérer", 3],
  ["MEMBER", "membre", 3], ["METHOD", "méthode", 3], ["MUSCLE", "muscle", 3], ["NARROW", "étroit", 3], ["NATION", "nation", 3],
  ["NEARLY", "presque", 3], ["OBJECT", "objet", 3], ["OPTION", "option", 3], ["ORIGIN", "origine", 3], ["PARADE", "défilé", 3],
  ["PERIOD", "période", 3], ["PHRASE", "expression", 3], ["POWDER", "poudre", 3], ["PUBLIC", "public", 3], ["RARELY", "rarement", 3],
  ["RECENT", "récent", 3], ["RECORD", "enregistrer", 3], ["REDUCE", "réduire", 3], ["REFUSE", "refuser", 3], ["REGION", "région", 3],
  ["REMIND", "rappeler", 3], ["REPORT", "rapport", 3], ["RESULT", "résultat", 3], ["SELECT", "sélectionner", 3], ["SERIES", "série", 3],
  ["SIGNAL", "signal", 3], ["SOCIAL", "social", 3], ["SOURCE", "source", 3], ["STATUE", "statue", 3], ["STRESS", "stress", 3],
  ["STRICT", "strict", 3], ["SYMBOL", "symbole", 3], ["SYSTEM", "système", 3], ["TARGET", "cible", 3], ["THEORY", "théorie", 3],
  ["TISSUE", "mouchoir", 3], ["TONGUE", "langue", 3], ["UPDATE", "mise à jour", 3], ["URGENT", "urgent", 3], ["VISION", "vision", 3],
  ["VOLUME", "volume", 3], ["WARMTH", "chaleur", 3], ["SUDDEN", "soudain", 3], ["SPIRIT", "esprit", 3], ["WONDER", "se demander", 3],
  ["DESIGN", "conception", 3], ["DIVIDE", "diviser", 3], ["FOSSIL", "fossile", 3], ["GALAXY", "galaxie", 3], ["MAGNET", "aimant", 3],
  ["PLENTY", "beaucoup", 3], ["BRANCH", "branche", 3], ["BREEZE", "brise", 3], ["CHORUS", "refrain", 3], ["LOCKER", "casier", 3],
  ["PARCEL", "colis", 3], ["PASTRY", "pâtisserie", 3], ["RIBBON", "ruban", 3], ["SAUCER", "soucoupe", 3], ["SLEEVE", "manche", 3],
  ["STRIPE", "rayure", 3], ["THREAD", "fil", 3],
  // Niveau 4
  ["ACTUAL", "réel", 4], ["AFFORD", "avoir les moyens", 4], ["ATTEND", "assister", 4], ["BEYOND", "au-delà", 4], ["CUSTOM", "coutume", 4],
  ["DECADE", "décennie", 4], ["DEMAND", "exiger", 4], ["EMPLOY", "employer", 4], ["ENABLE", "permettre", 4], ["ENTIRE", "entier", 4],
  ["EXPAND", "étendre", 4], ["EXPORT", "exporter", 4], ["EXTEND", "prolonger", 4], ["FABRIC", "tissu", 4], ["FAIRLY", "assez", 4],
  ["FORMAL", "formel", 4], ["FORMER", "ancien", 4], ["GATHER", "rassembler", 4], ["GLOBAL", "mondial", 4], ["GROWTH", "croissance", 4],
  ["GUILTY", "coupable", 4], ["HARDLY", "à peine", 4], ["IMPORT", "importer", 4], ["INCOME", "revenu", 4], ["INDEED", "en effet", 4],
  ["INVEST", "investir", 4], ["LIKELY", "probable", 4], ["LOCATE", "localiser", 4], ["LUXURY", "luxe", 4], ["MANNER", "manière", 4],
  ["MARGIN", "marge", 4], ["MOTION", "mouvement", 4], ["MUTUAL", "mutuel", 4], ["NATIVE", "natif", 4], ["OBTAIN", "obtenir", 4],
  ["OPPOSE", "s'opposer", 4], ["POLICY", "politique", 4], ["PRAISE", "éloge", 4], ["PROFIT", "profit", 4], ["PROPER", "correct", 4],
  ["RATHER", "plutôt", 4], ["REGRET", "regret", 4], ["REJECT", "rejeter", 4], ["RELIEF", "soulagement", 4], ["REMAIN", "rester", 4],
  ["REMOTE", "éloigné", 4], ["RESIST", "résister", 4], ["RETIRE", "prendre sa retraite", 4], ["REVEAL", "révéler", 4], ["REVIEW", "critique", 4],
  ["SAMPLE", "échantillon", 4], ["SCRIPT", "scénario", 4], ["SECURE", "sûr", 4], ["SETTLE", "s'installer", 4], ["SEVERE", "sévère", 4],
  ["SKETCH", "croquis", 4], ["SPREAD", "répandre", 4], ["STABLE", "stable", 4], ["STATUS", "statut", 4], ["STEADY", "régulier", 4],
  ["STREAM", "ruisseau", 4], ["STRIKE", "grève", 4], ["SUPPLY", "fournir", 4], ["SURVEY", "enquête", 4], ["SWITCH", "interrupteur", 4],
  ["THREAT", "menace", 4], ["UNLESS", "à moins que", 4], ["UNLIKE", "contrairement à", 4], ["VISUAL", "visuel", 4],
  ["WEALTH", "richesse", 4], ["WIDELY", "largement", 4], ["WISDOM", "sagesse", 4], ["WITHIN", "à l'intérieur de", 4], ["EVOLVE", "évoluer", 4],
  ["IMPOSE", "imposer", 4], ["INSIST", "insister", 4], ["INTEND", "avoir l'intention de", 4], ["NOTION", "notion", 4], ["PARODY", "parodie", 4],
  ["RESIGN", "démissionner", 4], ["SUPERB", "superbe", 4], ["VERIFY", "vérifier", 4], ["WANDER", "errer", 4], ["VOYAGE", "traversée", 4],
  // Niveau 5
  ["ABRUPT", "brusque", 5], ["ADHERE", "adhérer", 5], ["ASSERT", "affirmer", 5], ["ASSESS", "évaluer", 5], ["BANISH", "bannir", 5],
  ["CANDID", "franc", 5], ["COERCE", "contraindre", 5], ["CONVEY", "transmettre", 5], ["DEBRIS", "débris", 5], ["DECEIT", "tromperie", 5],
  ["DEPICT", "dépeindre", 5], ["DEPLOY", "déployer", 5], ["DERIVE", "dériver", 5], ["DEVOID", "dépourvu", 5], ["DIVERT", "détourner", 5],
  ["ENDURE", "endurer", 5], ["ENRICH", "enrichir", 5], ["ENTAIL", "entraîner", 5], ["EXCEED", "dépasser", 5],
  ["FATHOM", "comprendre", 5], ["FLAUNT", "exhiber", 5], ["FOSTER", "favoriser", 5], ["FUTILE", "futile", 5], ["HAMPER", "entraver", 5],
  ["HINDER", "gêner", 5], ["HOMAGE", "hommage", 5], ["IMMUNE", "immunisé", 5], ["IMPAIR", "altérer", 5], ["INDUCE", "provoquer", 5],
  ["INFLUX", "afflux", 5], ["INVOKE", "invoquer", 5], ["LAVISH", "somptueux", 5], ["LEGACY", "héritage", 5], ["OBLIGE", "obliger", 5],
  ["PONDER", "réfléchir", 5], ["PURSUE", "poursuivre", 5], ["RECKON", "estimer", 5], ["REMEDY", "remède", 5], ["RENOWN", "renommée", 5],
  ["REPEAL", "abroger", 5], ["RESORT", "recours", 5], ["RETAIN", "conserver", 5], ["SCARCE", "rare", 5], ["SELDOM", "rarement", 5],
  ["SHREWD", "astucieux", 5], ["SOLACE", "réconfort", 5], ["STANCE", "position", 5], ["STIFLE", "étouffer", 5], ["STRAIN", "tension", 5],
  ["SUBMIT", "soumettre", 5], ["SUBTLE", "subtil", 5], ["TACKLE", "s'attaquer à", 5], ["THRIVE", "prospérer", 5], ["THWART", "contrecarrer", 5],
  ["TREATY", "traité", 5], ["UPHOLD", "maintenir", 5], ["VANISH", "disparaître", 5], ["VESSEL", "navire", 5], ["VIRTUE", "vertu", 5],
  ["WORTHY", "digne", 5], ["MOTIVE", "mobile", 5],
];

function build(entries: readonly Entry[]): EnigmaTarget[] {
  return entries.map(([word, french, level]) => ({ word, french, level }));
}

export const ENIGMA_TARGETS: Record<4 | 5 | 6, EnigmaTarget[]> = {
  4: build(FOUR),
  5: build(FIVE),
  6: build(SIX),
};

/** Taille minimale du réservoir de mots d'une partie. */
const MIN_POOL = 40;

/**
 * Mots cibles d'une partie : niveau du joueur et niveau inférieur, complétés
 * par les niveaux plus faciles s'il y en a trop peu (mots longs de niveau 5).
 */
export function enigmaTargetsForLevel(length: 4 | 5 | 6, level: GameLevel): EnigmaTarget[] {
  const all = ENIGMA_TARGETS[length];
  let lowest = Math.max(1, level - 1);
  let pool = all.filter((target) => target.level <= level && target.level >= lowest);
  while (pool.length < MIN_POOL && lowest > 1) {
    lowest -= 1;
    pool = all.filter((target) => target.level <= level && target.level >= lowest);
  }
  return pool.length > 0 ? pool : all;
}

/** Traduction d'un mot cible, toutes longueurs confondues. */
export function getEnigmaTranslation(word: string): string | null {
  const normalized = word.trim().toUpperCase();
  const length = normalized.length;
  if (length !== 4 && length !== 5 && length !== 6) return null;
  return ENIGMA_TARGETS[length].find((target) => target.word === normalized)?.french ?? null;
}
