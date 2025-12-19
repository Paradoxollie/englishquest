/**
 * Space Lex Shooter - Core Game Logic
 * 
 * A vertical space shooter where players shoot word enemies based on lexical missions.
 * Pure, deterministic game logic.
 */

export type MissionType = "WORD_FAMILY" | "CONNECTORS" | "SYNONYMS" | "BOSS";

export interface Mission {
  id: string;
  type: MissionType;
  label: string; // e.g. "Shoot words related to TRAVEL"
  theme?: string;
  connectorCategory?: string;
  synonymKey?: string;
  targetCount: number; // Number of words to shoot to finish wave
}

export type WaveStatus = "intro" | "playing" | "cleared" | "failed" | "boss_intro";

export interface Boss {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  phase: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  avatar?: string;
}

export interface Dialogue {
  id: string;
  lines: DialogueLine[];
  onComplete?: string; // Action after dialogue
}

export type MovementType = "sine" | "zigzag" | "spiral" | "straight" | "wave";

export interface EnemyWord {
  id: string;
  text: string;
  isTarget: boolean; // true = correct for the current mission
  x: number; // horizontal position (0-1, normalized)
  y: number; // vertical position (0-1, normalized)
  baseX: number; // base horizontal position for movement
  speed: number; // vertical speed (units per second)
  movementType: MovementType; // type of movement pattern
  horizontalSpeed: number; // horizontal oscillation speed
  amplitude: number; // horizontal oscillation amplitude
  phase: number; // phase offset for movement
  zigzagDirection: number; // direction for zigzag movement (-1 or 1)
  zigzagChangeY: number; // y position where zigzag changes direction
  spiralRadius: number; // current radius for spiral movement
  spiralAngle: number; // current angle for spiral movement
}

export interface Bullet {
  id: string;
  x: number; // horizontal position (0-1, normalized)
  y: number; // vertical position (0-1, normalized)
  speed: number; // vertical speed (units per second)
}

export type PowerUpType = "shield" | "slowmo" | "double_xp" | "extra_life";

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  speed: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number; // timestamp when effect ends
}

export interface GameState {
  mission: Mission | null;
  enemies: EnemyWord[];
  bullets: Bullet[];
  powerups: PowerUp[]; // collectible power-ups on screen
  activePowerUps: ActivePowerUp[]; // currently active power-up effects
  hasShield: boolean; // shield protects from one mistake
  shipX: number; // horizontal position (0-1, normalized)
  shipVelocity: number; // velocity for smooth movement (-1 to 1)
  isRunning: boolean;
  lives: number;
  score: number; // local only
  level: number;

  // Wave System
  waveNumber: number;
  waveTarget: number;
  waveProgress: number;
  waveStatus: WaveStatus;
  waveTransitionTime: number; // timestamp for transitions

  gameOver: boolean;
  lastBulletTime: number; // timestamp of last bullet fired
  lastEnemySpawnTime: number; // timestamp of last enemy spawn
  lastPowerUpSpawnTime: number; // timestamp of last power-up spawn
  lastMissionChangeTime: number; // timestamp of last mission change
  missionDuration: number; // how long current mission has been active (ms)
  explosions: Explosion[]; // visual explosions
  feedbackMessages: FeedbackMessage[]; // educational feedback after hits
  upcomingEnemy: EnemyWord | null; // next enemy that will spawn
  upcomingEnemySpawnTime: number; // when the upcoming enemy will spawn

  // Combo System
  comboCount: number;
  maxCombo: number;

  // Learning tracking
  learnedWords: string[];
  missedWords: string[];

  // Special Ability
  superBar: number; // 0-100
  superActive: boolean;
  superStartTime: number;

  // Boss System
  boss: Boss | null;

  // Narrative System
  currentDialogue: Dialogue | null;
  dialogueIndex: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  type: "hit" | "miss";
  life: number;
  maxLife: number;
}

export interface FeedbackMessage {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

// Word banks for missions
export const WORD_FAMILIES: Record<string, string[]> = {
  // Thèmes classiques utiles pour les rédactions
  TRAVEL: [
    "airplane", "airport", "station", "platform", "hotel",
    "hostel", "passport", "visa", "luggage", "suitcase",
    "backpack", "journey", "trip", "travel", "destination",
    "tourism", "tourist", "reservation", "booking", "departure",
    "arrival", "delay", "cancellation", "ticket", "boarding"
  ],
  FOOD: [
    "restaurant", "cafe", "canteen", "menu", "recipe",
    "kitchen", "ingredient", "flavour", "spice", "sweet",
    "salty", "bitter", "sour", "healthy", "unhealthy",
    "balanced", "snack", "dessert", "meal", "breakfast",
    "lunch", "dinner", "diet", "allergy", "portion"
  ],
  SPORTS: [
    "stadium", "arena", "pitch", "field", "court",
    "athlete", "player", "opponent", "team", "coach",
    "referee", "supporter", "training", "practice", "competition",
    "tournament", "championship", "league", "victory", "defeat",
    "draw", "score", "fitness", "exercise", "performance"
  ],
  NATURE: [
    "forest", "jungle", "mountain", "valley", "river",
    "lake", "ocean", "sea", "desert", "island",
    "beach", "cliff", "wildlife", "species", "habitat",
    "sunrise", "sunset", "landscape", "environment", "ecosystem",
    "storm", "rain", "wind", "snow", "season"
  ],
  TECHNOLOGY: [
    "computer", "laptop", "tablet", "smartphone", "screen",
    "keyboard", "mouse", "software", "program", "application",
    "app", "internet", "website", "platform", "network",
    "wifi", "data", "file", "robot", "algorithm",
    "digital", "device", "update", "password", "security"
  ],
  EDUCATION: [
    "school", "college", "university", "classroom", "lesson",
    "course", "teacher", "student", "pupil", "homework",
    "grade", "mark", "result", "subject", "timetable",
    "library", "knowledge", "learning", "revision", "deadline",
    "book", "pen", "pencil", "paper", "notebook"
  ],

  // Thèmes vraiment utiles pour les essais / argumentations
  ENVIRONMENT_ISSUES: [
    "nature", "climate", "weather", "global warming", "climate change",
    "recycling", "waste", "rubbish", "litter", "plastic",
    "pollution", "smog", "carbon", "carbon footprint", "renewable",
    "solar", "wind", "sustainable", "biodiversity", "deforestation",
    "endangered", "conservation", "greenhouse", "emissions", "protect"
  ],
  SOCIAL_MEDIA: [
    "account", "profile", "post", "comment", "like",
    "share", "follower", "influencer", "trend", "hashtag",
    "content", "video", "story", "stream", "message",
    "chat", "notification", "privacy", "filter", "community",
    "fake news", "bullying", "troll", "addiction", "algorithm"
  ],
  FEELINGS: [
    "happy", "sad", "angry", "afraid", "anxious",
    "worried", "relieved", "disappointed", "confident", "proud",
    "ashamed", "embarrassed", "frustrated", "jealous", "curious",
    "bored", "lonely", "hopeful", "shocked", "surprised",
    "excited", "tired", "stressed", "relaxed", "motivated"
  ],
  CITY_LIFE: [
    "street", "avenue", "square", "neighbourhood", "district",
    "traffic", "rush hour", "crowd", "noise", "pollution",
    "building", "skyscraper", "block", "shop", "mall",
    "market", "bus", "tram", "subway", "station",
    "pedestrian", "crossing", "park", "bench", "streetlight"
  ],
  FUTURE_JOBS: [
    "job", "career", "workplace", "office", "factory",
    "salary", "income", "wage", "internship", "training",
    "qualification", "skills", "experience", "interview", "promotion",
    "colleague", "manager", "boss", "company", "remote work",
    "resignation", "unemployment", "contract", "fulltime", "parttime"
  ],

  // Spécial pour ton jeu de vaisseau
  SPACE_MISSION: [
    "space", "spaceship", "station", "rocket", "launch",
    "mission", "crew", "astronaut", "cosmonaut", "galaxy",
    "planet", "moon", "asteroid", "comet", "orbit",
    "gravity", "black hole", "solar system", "signal", "scanner",
    "radar", "shield", "engine", "fuel", "base"
  ],
  DIPLOMACY: [
    "agreement", "negotiation", "compromise", "alliance", "partnership",
    "cooperation", "trust", "respect", "peace", "truce",
    "treaty", "conflict", "tension", "sanction", "embassy",
    "protocol", "misunderstanding", "concession", "proposal", "resolution"
  ],
  "HEALTH & MEDICINE": [
    "hospital", "medicine", "symptom", "treatment", "disease",
    "illness", "patient", "doctor", "nurse", "surgery",
    "operation", "recovery", "immune", "virus", "bacteria",
    "vaccine", "pharmacy", "prescription", "therapy", "clinic"
  ],
  "ART & CULTURE": [
    "masterpiece", "exhibition", "gallery", "museum", "performance",
    "literature", "novel", "poetry", "sculpture", "painting",
    "theatre", "cinema", "festival", "heritage", "tradition",
    "culture", "creative", "artistic", "abstract", "classic"
  ],
  "BUSINESS & ECONOMY": [
    "profit", "investment", "market", "economy", "entrepreneur",
    "startup", "company", "budget", "finance", "revenue",
    "inflation", "recession", "consumer", "producer", "trade",
    "industry", "product", "service", "strategy", "growth"
  ],
  "CRIME & JUSTICE": [
    "evidence", "witness", "verdict", "investigation", "sentence",
    "crime", "criminal", "police", "lawyer", "judge",
    "court", "trial", "guilty", "innocent", "prison",
    "suspect", "theft", "victim", "justice", "illegal"
  ],
  "COOKING": [
    "boil", "fry", "roast", "bake", "grill",
    "steam", "chop", "slice", "mix", "stir",
    "whisk", "pour", "ingredient", "seasoning", "flavour",
    "tasty", "delicious", "savory", "utensil", "pan"
  ],
  CLOTHES: [
    "shirt", "tshirt", "jeans", "trousers", "shorts",
    "skirt", "dress", "coat", "jacket", "sweater",
    "jumper", "hoodie", "shoes", "boots", "trainers",
    "sneakers", "socks", "hat", "cap", "scarf",
    "gloves", "tie", "belt", "pyjamas", "uniform"
  ],
  "HOUSE & HOME": [
    "house", "home", "flat", "apartment", "garden",
    "kitchen", "bathroom", "bedroom", "living room", "garage",
    "furniture", "sofa", "chair", "table", "bed",
    "window", "door", "roof", "wall", "floor",
    "ceiling", "cupboard", "shelf", "lamp", "mirror"
  ],
  FAMILY: [
    "mother", "father", "mum", "dad", "parents",
    "brother", "sister", "grandmother", "grandfather", "grandparents",
    "uncle", "aunt", "cousin", "son", "daughter",
    "nephew", "niece", "husband", "wife", "child"
  ],
  "BODY PARTS": [
    "head", "face", "eye", "nose", "mouth",
    "ear", "hair", "neck", "shoulder", "arm",
    "hand", "finger", "leg", "knee", "foot",
    "stomach", "back", "skin", "heart", "brain"
  ],
  ANIMALS: [
    "cat", "dog", "bird", "fish", "rabbit",
    "hamster", "mouse", "horse", "cow", "pig",
    "sheep", "chicken", "duck", "lion", "tiger",
    "elephant", "monkey", "bear", "snake", "spider"
  ],
  WEATHER: [
    "sun", "rain", "cloud", "wind", "snow",
    "storm", "fog", "mist", "thunder", "lightning",
    "hot", "cold", "warm", "cool", "dry",
    "wet", "sunny", "rainy", "cloudy", "windy"
  ],
  COLORS: [
    "red", "blue", "green", "yellow", "black",
    "white", "grey", "orange", "purple", "pink",
    "brown", "gold", "silver", "violet", "indigo",
    "colorful", "bright", "dark", "pale", "light"
  ]
};

export const CONNECTORS: Record<string, string[]> = {
  CONTRAST: [
    "however", "nevertheless", "nonetheless", "still", "yet",
    "even so", "on the other hand", "on the contrary", "instead", "in contrast",
    "by contrast", "in comparison", "although", "though", "even though",
    "whereas", "while", "despite", "in spite of", "regardless of",
    "even if", "all the same", "at the same time", "anyway", "in any case"
  ],
  ADDITION: [
    "and", "also", "too", "as well", "in addition",
    "additionally", "furthermore", "moreover", "besides", "what is more",
    "on top of that", "not only that", "plus", "similarly", "likewise",
    "equally", "in the same way", "another point is", "a further point is", "above all",
    "indeed", "more than that", "apart from that", "as a matter of fact", "in fact"
  ],
  CAUSE: [
    "because", "since", "as", "given that", "considering that",
    "seeing that", "for", "because of", "due to", "owing to",
    "thanks to", "as a result of", "on account of", "out of", "in view of",
    "in response to", "in reaction to", "in light of", "based on", "resulting from"
  ],
  RESULT: [
    "so", "therefore", "thus", "hence", "consequently",
    "accordingly", "as a result", "as a consequence", "for this reason", "for that reason",
    "that is why", "in that case", "in consequence", "the result is that", "the consequence is that",
    "as a result of this", "because of this", "from then on", "thereby", "overall"
  ],
  TIME: [
    "before", "after", "later", "earlier", "meanwhile",
    "in the meantime", "at the same time", "suddenly", "immediately", "instantly",
    "eventually", "finally", "in the end", "from then on", "afterwards",
    "subsequently", "previously", "once", "as soon as", "until",
    "while", "when", "nowadays", "these days", "at first"
  ],
  EXAMPLE: [
    "for example", "for instance", "such as", "like", "including",
    "in particular", "especially", "particularly", "namely", "to illustrate",
    "as an illustration", "as shown by", "as in", "as seen in", "one example is",
    "a good example is", "for one thing", "to give an example", "for instance, when", "for example, when"
  ],
  PURPOSE: [
    "so that", "in order to", "so as to", "with the aim of", "with the purpose of",
    "with the intention of", "in order not to", "so as not to", "so that we can", "so that they can",
    "so that it can", "to", "to make sure that", "so that no one", "in order for us to"
  ],
  CONCLUSION: [
    "to sum up", "in conclusion", "overall", "all in all", "in short",
    "to conclude", "in summary", "in brief", "on the whole", "ultimately",
    "at the end of the day", "to put it simply", "to put it differently", "in other words", "finally",
    "in the end", "as a conclusion", "to finish", "last but not least", "all things considered"
  ],
  CONDITION: [
    "if", "unless", "as long as", "so long as", "provided that",
    "providing that", "even if", "in case", "in the event that", "on condition that",
    "whether or not", "assuming that", "supposing that", "only if", "except if"
  ],
  COMPARISON: [
    "similarly", "likewise", "in the same way", "just like", "as if",
    "as though", "compared to", "in comparison with", "by contrast", "on the contrary",
    "rather than", "instead of", "as…as", "more than", "less than"
  ]
};

export const SYNONYMS: Record<string, string[]> = {
  IMPORTANT: [
    "important", "significant", "crucial", "essential", "vital",
    "key", "major", "critical", "fundamental", "indispensable",
    "notable", "influential", "decisive", "meaningful", "central",
    "core", "principal", "primary", "relevant", "necessary"
  ],
  BEAUTIFUL: [
    "beautiful", "gorgeous", "stunning", "attractive", "lovely",
    "elegant", "charming", "exquisite", "magnificent", "splendid",
    "graceful", "radiant", "appealing", "pretty", "picturesque",
    "dazzling", "striking", "impressive", "glamorous", "breathtaking"
  ],
  BIG: [
    "big", "large", "huge", "enormous", "massive",
    "gigantic", "immense", "vast", "tremendous", "considerable",
    "substantial", "powerful", "mighty", "colossal", "sizeable",
    "extensive", "widespread", "expanded", "heavy", "major"
  ],
  SMALL: [
    "small", "tiny", "little", "miniature", "petite",
    "compact", "minuscule", "slight", "modest", "limited",
    "narrow", "minimal", "reduced", "restricted", "minor",
    "delicate", "fine", "subtle", "light", "short"
  ],
  HAPPY: [
    "happy", "joyful", "cheerful", "delighted", "pleased",
    "content", "overjoyed", "thrilled", "satisfied", "enthusiastic",
    "optimistic", "glad", "radiant", "lively", "hopeful",
    "excited", "grateful", "relieved", "positive", "lighthearted"
  ],
  SAD: [
    "sad", "unhappy", "depressed", "melancholy", "gloomy",
    "sorrowful", "downcast", "miserable", "heartbroken", "upset",
    "discouraged", "disheartened", "hopeless", "tragic", "regretful",
    "tearful", "blue", "lonely", "bitter", "devastated"
  ],
  FAST: [
    "fast", "quick", "rapid", "swift", "speedy",
    "brisk", "accelerated", "immediate", "instant", "energetic",
    "lively", "dynamic", "rushed", "urgent", "express",
    "efficient", "prompt", "nimble", "agile", "active"
  ],
  SMART: [
    "smart", "intelligent", "clever", "brilliant", "wise",
    "bright", "sharp", "astute", "genius", "rational",
    "logical", "insightful", "knowledgeable", "thoughtful", "quickwitted",
    "perceptive", "aware", "sensible", "shrewd", "inventive"
  ],
  GOOD: [
    "good", "positive", "beneficial", "helpful", "valuable",
    "advantageous", "constructive", "effective", "efficient", "reliable",
    "favorable", "decent", "honest", "kind", "supportive",
    "satisfying", "pleasant", "excellent", "great", "admirable"
  ],
  BAD: [
    "bad", "negative", "harmful", "damaging", "dangerous",
    "risky", "unfair", "unacceptable", "problematic", "poor",
    "weak", "faulty", "useless", "disappointing", "unpleasant",
    "severe", "serious", "inappropriate", "regrettable", "tragic"
  ],
  INTERESTING: [
    "interesting", "fascinating", "captivating", "engaging", "appealing",
    "intriguing", "stimulating", "exciting", "original", "unusual",
    "remarkable", "striking", "impressive", "entertaining", "absorbing",
    "compelling", "curious", "noteworthy", "surprising", "inspiring"
  ],
  DIFFICULT: [
    "difficult", "hard", "challenging", "demanding", "tough",
    "complex", "complicated", "tricky", "exhausting", "tiring",
    "confusing", "intense", "severe", "painful", "frustrating",
    "overwhelming", "strenuous", "arduous", "strict", "heavy"
  ],
  EASY: [
    "easy", "simple", "straightforward", "effortless", "comfortable",
    "manageable", "convenient", "accessible", "clear", "obvious",
    "smooth", "natural", "relaxed", "undemanding", "painless",
    "quick", "basic", "intuitive", "plain", "uncomplicated"
  ],
  DANGEROUS: [
    "dangerous", "risky", "hazardous", "unsafe", "threatening",
    "harmful", "deadly", "perilous", "toxic", "violent",
    "unstable", "critical", "explosive", "severe", "alarming",
    "fragile", "vulnerable", "fatal", "destructive", "unsafe"
  ],
  USEFUL: [
    "useful", "helpful", "practical", "convenient", "beneficial",
    "effective", "valuable", "relevant", "efficient", "productive",
    "profitable", "functional", "supportive", "informative", "constructive",
    "insightful", "meaningful", "applicable", "versatile", "powerful"
  ],
  BORING: [
    "boring", "dull", "uninteresting", "repetitive", "monotonous",
    "tiresome", "predictable", "lifeless", "uninspiring", "flat",
    "slow", "tedious", "ordinary", "unexciting", "colorless",
    "dragging", "pointless", "endless", "stale", "weak"
  ],
  BRAVE: [
    "brave", "courageous", "fearless", "bold", "daring",
    "valiant", "heroic", "adventurous", "gallant", "intrepid"
  ],
  STRANGE: [
    "strange", "odd", "peculiar", "weird", "unusual",
    "curious", "bizarre", "extraordinary", "mysterious", "abnormal"
  ],
  FAMOUS: [
    "famous", "renowned", "well-known", "celebrated", "notable",
    "distinguished", "eminent", "legendary", "prominent", "popular"
  ],
  POWERFUL: [
    "powerful", "strong", "influential", "dominant", "potent",
    "mighty", "vigorous", "authoritative", "commanding", "supreme"
  ],
  CHEAP: [
    "cheap", "affordable", "inexpensive", "low-cost", "budget",
    "economical", "reasonable", "bargain", "discounted", "modest"
  ],
  EXPENSIVE: [
    "expensive", "costly", "pricey", "premium", "extravagant",
    "valuable", "luxurious", "exclusive", "high-end", "pricey"
  ]
};


// Words that are NOT targets (distractors)
// -> très simples, concrets, pour ne pas parasiter l’apprentissage
export const DISTRACTOR_WORDS: string[] = [
  // Salutations & petits mots
  "hello", "hi", "hey", "goodbye", "bye",
  "please", "thanks", "thank you", "sorry", "ok",
  "yes", "no", "maybe", "really", "wow",

  // Objets neutres (bureautique, divers)
  "bag", "box", "key", "card", "map",
  "photo", "camera", "phone", "watch", "clock",
  "ring", "gift", "toy", "ball", "game",

  // Verbes d'action basiques (neutres)
  "do", "make", "go", "come", "take",
  "put", "get", "have", "be", "say",
  "speak", "talk", "see", "look", "watch",
  "listen", "eat", "drink", "sleep", "play",
  "walk", "run", "sit", "stand", "wait",
  "start", "stop", "finish", "try", "use",

  // Adverbes & prépositions communs
  "now", "then", "here", "there", "always",
  "never", "often", "sometimes", "usually", "again",
  "very", "too", "quite", "enough", "just",
  "only", "also", "even", "still", "already",

  // Mots abstraits simples
  "thing", "idea", "way", "part", "side",
  "place", "time", "day", "week", "year",
  "name", "number", "group", "problem", "fact"
];


let nextId = 0;
function generateId(): string {
  return `id_${Date.now()}_${nextId++}`;
}

/**
 * Create initial game state
 */
export function createGameState(): GameState {
  const now = Date.now();
  return {
    mission: null,
    enemies: [],
    bullets: [],
    powerups: [],
    activePowerUps: [],
    hasShield: false,
    shipX: 0.5, // start in center
    shipVelocity: 0, // no initial velocity
    isRunning: false,
    lives: 3,
    score: 0,
    level: 1,

    // Wave System initial state
    waveNumber: 1,
    waveTarget: 10, // Default for wave 1
    waveProgress: 0,
    waveStatus: "intro",
    waveTransitionTime: now,

    gameOver: false,
    lastBulletTime: 0,
    lastEnemySpawnTime: 0,
    lastPowerUpSpawnTime: 0,
    lastMissionChangeTime: now,
    missionDuration: 0,
    explosions: [],
    feedbackMessages: [],
    upcomingEnemy: null,
    upcomingEnemySpawnTime: 0,
    comboCount: 0,
    maxCombo: 0,
    learnedWords: [],
    missedWords: [],
    superBar: 0,
    superActive: false,
    superStartTime: 0,
    boss: null,
    currentDialogue: null,
    dialogueIndex: 0,
  };
}

/**
 * Generate a random mission
 */
export function generateMission(waveNumber: number = 1): Mission {
  // BOSS Wave every 5 waves
  if (waveNumber % 5 === 0) {
    return {
      id: generateId(),
      type: "BOSS",
      label: `DEFEAT SECTOR BOSS`,
      targetCount: 15, // Shots needed on boss
    };
  }

  const missionTypes: MissionType[] = ["WORD_FAMILY", "CONNECTORS", "SYNONYMS"];
  const type = missionTypes[Math.floor(Math.random() * missionTypes.length)];

  let mission: Mission | null = null;
  // Waves get slightly longer as we progress
  const targetCount = 10 + (waveNumber - 1) * 5;

  switch (type) {
    case "WORD_FAMILY": {
      const themes = Object.keys(WORD_FAMILIES);
      const theme = themes[Math.floor(Math.random() * themes.length)];
      mission = {
        id: generateId(),
        type: "WORD_FAMILY",
        label: `Shoot words related to: ${theme}`,
        theme,
        targetCount,
      };
      break;
    }
    case "CONNECTORS": {
      const categories = Object.keys(CONNECTORS);
      const category = categories[Math.floor(Math.random() * categories.length)];
      mission = {
        id: generateId(),
        type: "CONNECTORS",
        label: `Shoot ${category} connectors`,
        connectorCategory: category,
        targetCount,
      };
      break;
    }
    case "SYNONYMS": {
      const keys = Object.keys(SYNONYMS);
      const key = keys[Math.floor(Math.random() * keys.length)];
      mission = {
        id: generateId(),
        type: "SYNONYMS",
        label: `Shoot synonyms of: ${key}`,
        synonymKey: key,
        targetCount,
      };
      break;
    }
  }

  // Fallback if mission is somehow not assigned
  if (!mission) {
    mission = {
      id: generateId(),
      type: "WORD_FAMILY",
      label: "Shoot words",
      targetCount: 10
    };
  }

  return mission;
}

/**
 * Get target words for a mission
 */
function getTargetWords(mission: Mission): string[] {
  switch (mission.type) {
    case "WORD_FAMILY":
      return mission.theme ? WORD_FAMILIES[mission.theme] || [] : [];
    case "CONNECTORS":
      return mission.connectorCategory ? CONNECTORS[mission.connectorCategory] || [] : [];
    case "SYNONYMS":
      return mission.synonymKey ? SYNONYMS[mission.synonymKey] || [] : [];
    default:
      return [];
  }
}

/**
 * Check if a word is a target for the current mission
 */
export function isTargetWord(word: string, mission: Mission | null): boolean {
  if (!mission) return false;
  const targetWords = getTargetWords(mission);
  return targetWords.includes(word.toLowerCase());
}

/**
 * Get words from other categories as distractors (excluding current mission targets)
 */
function getOtherCategoryWords(mission: Mission | null): string[] {
  const otherWords: string[] = [];
  const targetWords = mission ? getTargetWords(mission) : [];
  const targetWordsSet = new Set(targetWords.map(w => w.toLowerCase()));

  // Collect words from WORD_FAMILIES (excluding current mission theme)
  if (!mission || mission.type !== "WORD_FAMILY") {
    Object.values(WORD_FAMILIES).forEach(words => {
      words.forEach(word => {
        if (!targetWordsSet.has(word.toLowerCase())) {
          otherWords.push(word);
        }
      });
    });
  }

  // Collect words from CONNECTORS (excluding current mission category)
  if (!mission || mission.type !== "CONNECTORS") {
    Object.values(CONNECTORS).forEach(words => {
      words.forEach(word => {
        if (!targetWordsSet.has(word.toLowerCase())) {
          otherWords.push(word);
        }
      });
    });
  }

  // Collect words from SYNONYMS (excluding current mission key)
  if (!mission || mission.type !== "SYNONYMS") {
    Object.values(SYNONYMS).forEach(words => {
      words.forEach(word => {
        if (!targetWordsSet.has(word.toLowerCase())) {
          otherWords.push(word);
        }
      });
    });
  }

  return otherWords;
}

/**
 * Spawn a new enemy word with varied movement patterns
 */
export function spawnEnemy(state: GameState, mission: Mission | null): EnemyWord {
  const targetWords = mission ? getTargetWords(mission) : [];
  const otherCategoryWords = getOtherCategoryWords(mission);

  // NOUVEAU RATIO 2.0: 60% mots cibles, 40% distracteurs
  // Suite au feedback utilisateur: "pas assez de bons mots proposés"
  const TARGET_PROBABILITY = 0.60;

  let randomWord: string = "EMPTY";
  let isTarget: boolean = false;

  // 60% de chance d'avoir un mot cible (si disponible)
  if (targetWords.length > 0 && Math.random() < TARGET_PROBABILITY) {
    // 60% de chance : choisir un mot cible
    randomWord = targetWords[Math.floor(Math.random() * targetWords.length)];
    isTarget = true;
  } else {
    // 40% de chance : distracteur
    const allDistractors = [...DISTRACTOR_WORDS, ...otherCategoryWords];
    const rand = Math.random();

    // Mélange varié de distracteurs
    if (rand < 0.40 && DISTRACTOR_WORDS.length > 0) {
      randomWord = DISTRACTOR_WORDS[Math.floor(Math.random() * DISTRACTOR_WORDS.length)];
    } else if (rand < 0.80 && otherCategoryWords.length > 0) {
      randomWord = otherCategoryWords[Math.floor(Math.random() * otherCategoryWords.length)];
    } else if (allDistractors.length > 0) {
      randomWord = allDistractors[Math.floor(Math.random() * allDistractors.length)];
    } else {
      // Fallback ultime : si pas de distracteurs, on prend un mot cible quand même
      if (targetWords.length > 0) {
        randomWord = targetWords[Math.floor(Math.random() * targetWords.length)];
        isTarget = true;
      } else {
        randomWord = "EMPTY"; // Should technically never happen heavily populated lists
        isTarget = false;
      }
    }

    // Si on a pas déjà défini isTarget (cas normal du distracteur)
    if (randomWord !== "EMPTY" && isTarget === undefined) { // Check if isTarget was not set in the fallback
      isTarget = false;
    }
  }

  const baseX = Math.random() * 0.8 + 0.1; // random base x position (10% to 90% of screen)

  // Randomly choose movement type
  const movementTypes: MovementType[] = ["sine", "zigzag", "spiral", "straight", "wave"];
  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];

  // Base parameters
  const horizontalSpeed = 0.3 + Math.random() * 0.7; // oscillation speed (0.3 to 1.0)
  const amplitude = 0.02 + Math.random() * 0.05; // oscillation amplitude (2% to 7% of screen)
  const phase = Math.random() * Math.PI * 2; // random phase offset

  return {
    id: generateId(),
    text: randomWord.toUpperCase(),
    isTarget,
    baseX, // base position for movement
    x: baseX, // current x position
    y: -0.1, // start above screen
    // Accélération progressive très lente (comme Tetris)
    // Niveau 1: 0.004, niveau 10: 0.006, niveau 20: 0.008, niveau 30: 0.010
    speed: 0.004 + (state.level - 1) * 0.0002, // +0.0002 par niveau (très progressif)
    movementType,
    horizontalSpeed,
    amplitude,
    phase,
    zigzagDirection: Math.random() > 0.5 ? 1 : -1, // random initial zigzag direction
    zigzagChangeY: -0.1 + (0.05 + Math.random() * 0.1), // y position where zigzag changes (every 5-15% of screen)
    spiralRadius: 0.01 + Math.random() * 0.02, // initial spiral radius
    spiralAngle: Math.random() * Math.PI * 2, // initial spiral angle
  };
}

/**
 * Update enemy positions with varied movement patterns
 * Ensures smooth, continuous movement that never teleports or goes out of bounds
 */
export function updateEnemies(state: GameState, deltaTime: number): GameState {
  if (state.waveStatus !== "playing") return state; // Only move if playing

  // Normalize deltaTime to 60fps (16.67ms per frame)
  let normalizedDelta = deltaTime / 16.67;

  // Apply slow-mo effect if active
  const isSlowMo = hasActivePowerUp(state, "slowmo");
  if (isSlowMo) {
    normalizedDelta *= 0.5; // 50% speed when slow-mo is active
  }

  const time = Date.now() / 1000; // current time in seconds

  // Safe bounds: keep enemies well within screen (accounting for enemy width)
  const MIN_X = 0.08; // 8% from left (enough for half enemy width)
  const MAX_X = 0.92; // 92% from left (enough for half enemy width)

  // Maximum change per frame to prevent teleportation (very conservative)
  const MAX_X_CHANGE_PER_FRAME = 0.003; // 0.3% of screen width per frame max

  let newState = { ...state };

  // BOSS movement if active
  if (newState.boss) {
    const bossSpeed = 0.002 * normalizedDelta;
    newState.boss.x = 0.5 + Math.sin(time * 0.8) * 0.3; // Oscillate 0.2 to 0.8
  }

  let enemies = newState.enemies.map((enemy) => {
    // Vertical movement (always smooth)
    const newY = enemy.y + enemy.speed * normalizedDelta;
    let newX = enemy.x; // Start from current position for smooth transition
    let updatedEnemy = { ...enemy };

    // Different movement patterns - all ensure smooth, continuous movement
    switch (enemy.movementType) {
      case "sine": {
        // Classic sine wave - smooth and continuous
        const horizontalOffset = Math.sin(time * enemy.horizontalSpeed + enemy.phase) * enemy.amplitude;
        const targetX = enemy.baseX + horizontalOffset;
        // Very smooth interpolation to target position (prevents teleportation)
        const lerpFactor = Math.min(1, normalizedDelta * 0.05); // Slower interpolation
        newX = enemy.x + (targetX - enemy.x) * lerpFactor;
        break;
      }
      case "zigzag": {
        // Zigzag pattern - smooth direction changes
        let currentZigzagChangeY = enemy.zigzagChangeY;
        let currentZigzagDirection = enemy.zigzagDirection;

        if (newY >= currentZigzagChangeY) {
          // Smoothly transition direction instead of instant flip
          currentZigzagDirection *= -1;
          currentZigzagChangeY = newY + (0.05 + Math.random() * 0.1);
          updatedEnemy.zigzagDirection = currentZigzagDirection;
          updatedEnemy.zigzagChangeY = currentZigzagChangeY;
        }

        // Calculate target position based on current Y with smooth transition
        const yProgress = Math.max(0, Math.min(1, (newY - (currentZigzagChangeY - 0.1)) / 0.1));
        const targetOffset = currentZigzagDirection * enemy.amplitude * (yProgress * 2 - 1); // -1 to 1
        const targetX = enemy.baseX + targetOffset;

        // Very smooth interpolation
        const lerpFactor = Math.min(1, normalizedDelta * 0.08);
        newX = enemy.x + (targetX - enemy.x) * lerpFactor;
        break;
      }
      case "spiral": {
        // Spiral movement - smooth angle and radius changes
        updatedEnemy.spiralAngle += enemy.horizontalSpeed * normalizedDelta * 0.5;
        updatedEnemy.spiralRadius = Math.min(0.15, updatedEnemy.spiralRadius + enemy.speed * normalizedDelta * 0.1);
        const horizontalOffset = Math.cos(updatedEnemy.spiralAngle) * updatedEnemy.spiralRadius;
        const targetX = enemy.baseX + horizontalOffset;

        // Very smooth interpolation
        const lerpFactor = Math.min(1, normalizedDelta * 0.05);
        newX = enemy.x + (targetX - enemy.x) * lerpFactor;
        break;
      }
      case "straight": {
        // Straight down - no horizontal movement, stay at baseX
        const targetX = enemy.baseX;
        // Very smooth interpolation (in case baseX changed or collision moved it)
        const lerpFactor = Math.min(1, normalizedDelta * 0.05);
        newX = enemy.x + (targetX - enemy.x) * lerpFactor;
        break;
      }
      case "wave": {
        // Double frequency wave - smooth complex movement
        const horizontalOffset = Math.sin(time * enemy.horizontalSpeed * 2 + enemy.phase) * enemy.amplitude * 0.5 +
          Math.sin(time * enemy.horizontalSpeed * 0.5 + enemy.phase * 2) * enemy.amplitude * 0.5;
        const targetX = enemy.baseX + horizontalOffset;

        // Very smooth interpolation
        const lerpFactor = Math.min(1, normalizedDelta * 0.05);
        newX = enemy.x + (targetX - enemy.x) * lerpFactor;
        break;
      }
    }

    // Limit maximum change per frame to prevent any teleportation
    const xChange = newX - enemy.x;
    if (Math.abs(xChange) > MAX_X_CHANGE_PER_FRAME) {
      newX = enemy.x + Math.sign(xChange) * MAX_X_CHANGE_PER_FRAME;
    }

    // Smooth clamp to safe bounds (gradual push back if out of bounds)
    if (newX < MIN_X) {
      newX = enemy.x + (MIN_X - enemy.x) * 0.1; // Gradually push back
      newX = Math.max(MIN_X, newX); // Final clamp
    } else if (newX > MAX_X) {
      newX = enemy.x + (MAX_X - enemy.x) * 0.1; // Gradually push back
      newX = Math.min(MAX_X, newX); // Final clamp
    }

    const finalX = newX;
    const finalY = newY; // Y can go below 0 (off-screen top) but we filter later

    return {
      ...updatedEnemy,
      x: finalX,
      y: finalY,
    };
  }).filter((enemy) => enemy.y < 1.2); // remove enemies that are off-screen

  // Check and resolve collisions between enemies (with smooth resolution)
  enemies = resolveEnemyCollisions(enemies, MIN_X, MAX_X);

  return { ...newState, enemies };
}

/**
 * Check and resolve collisions between enemies to prevent overlap
 * Uses smooth, gradual separation to avoid teleportation
 */
function resolveEnemyCollisions(enemies: EnemyWord[], minX: number, maxX: number): EnemyWord[] {
  const resolvedEnemies: EnemyWord[] = [];
  const COLLISION_BUFFER = 0.015; // 1.5% buffer between enemies
  const MAX_SEPARATION_PER_FRAME = 0.002; // Maximum separation per frame (very small to prevent teleportation)

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    let adjustedX = enemy.x; // Start from current position
    let adjustedY = enemy.y;

    // Check collision with all other enemies
    for (let j = 0; j < resolvedEnemies.length; j++) {
      const otherEnemy = resolvedEnemies[j];

      // Get dimensions for both enemies
      const enemyDims = getEnemyDimensions(enemy.text);
      const otherDims = getEnemyDimensions(otherEnemy.text);

      // Calculate bounding boxes
      const enemyLeft = enemy.x - enemyDims.width / 2;
      const enemyRight = enemy.x + enemyDims.width / 2;
      const enemyTop = enemy.y - enemyDims.height / 2;
      const enemyBottom = enemy.y + enemyDims.height / 2;

      const otherLeft = otherEnemy.x - otherDims.width / 2;
      const otherRight = otherEnemy.x + otherDims.width / 2;
      const otherTop = otherEnemy.y - otherDims.height / 2;
      const otherBottom = otherEnemy.y + otherDims.height / 2;

      // Check if they overlap
      const overlapX = enemyLeft < otherRight && enemyRight > otherLeft;
      const overlapY = enemyTop < otherBottom && enemyBottom > otherTop;

      if (overlapX && overlapY) {
        // Collision detected - apply very smooth separation force
        const dx = enemy.x - otherEnemy.x;
        const dy = enemy.y - otherEnemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.001) { // Avoid division by zero
          // Normalize direction
          const dirX = dx / distance;
          const dirY = dy / distance;

          // Calculate minimum separation distance
          const minDistanceX = (enemyDims.width + otherDims.width) / 2 + COLLISION_BUFFER;
          const minDistanceY = (enemyDims.height + otherDims.height) / 2 + COLLISION_BUFFER;

          // Calculate how much we need to separate
          const currentDistanceX = Math.abs(dx);
          const currentDistanceY = Math.abs(dy);

          // Apply separation per frame (prevents teleportation)
          if (currentDistanceX < minDistanceX) {
            const neededSeparation = minDistanceX - currentDistanceX;
            const pushAmount = Math.min(neededSeparation * 0.2, MAX_SEPARATION_PER_FRAME);
            adjustedX += dirX * pushAmount;
          }

          if (currentDistanceY < minDistanceY) {
            const neededSeparation = minDistanceY - currentDistanceY;
            const pushAmount = Math.min(neededSeparation * 0.2, MAX_SEPARATION_PER_FRAME);
            adjustedY += dirY * pushAmount;
          }
        } else {
          // Same position - push very slightly in random direction
          adjustedX += (Math.random() - 0.5) * MAX_SEPARATION_PER_FRAME * 0.5;
          adjustedY += (Math.random() - 0.5) * MAX_SEPARATION_PER_FRAME * 0.5;
        }

        // Smooth clamp to safe bounds (gradual push back if out of bounds)
        if (adjustedX < minX) {
          adjustedX = enemy.x + (minX - enemy.x) * 0.1;
          adjustedX = Math.max(minX, adjustedX);
        } else if (adjustedX > maxX) {
          adjustedX = enemy.x + (maxX - enemy.x) * 0.1;
          adjustedX = Math.min(maxX, adjustedX);
        }

        // Y can go slightly negative (off-screen top) but we filter later
        adjustedY = Math.max(-0.2, Math.min(1.2, adjustedY));
      }
    }

    // Limit maximum change from original position to prevent teleportation
    const xChange = adjustedX - enemy.x;
    if (Math.abs(xChange) > MAX_SEPARATION_PER_FRAME * 2) {
      adjustedX = enemy.x + Math.sign(xChange) * MAX_SEPARATION_PER_FRAME * 2;
    }

    const yChange = adjustedY - enemy.y;
    if (Math.abs(yChange) > MAX_SEPARATION_PER_FRAME * 2) {
      adjustedY = enemy.y + Math.sign(yChange) * MAX_SEPARATION_PER_FRAME * 2;
    }

    // Final safety clamp
    const finalX = Math.max(minX, Math.min(maxX, adjustedX));
    const finalY = adjustedY;

    resolvedEnemies.push({
      ...enemy,
      x: finalX,
      y: finalY,
    });
  }

  return resolvedEnemies;
}

/**
 * Calculate enemy box dimensions based on word length
 * Exported for use in UI to match hitbox
 * Dimensions are calculated to match the actual rendered size
 */
export function getEnemyDimensions(text: string): { width: number; height: number } {
  // Base dimensions (normalized 0-1)
  // These must match the actual rendered size including padding and border
  // Actual rendering:
  // - Base padding: 8px left + 8px right = 16px total
  // - Border: 3px left + 3px right = 6px total
  // - Character padding: 1.5px per character beyond 4 chars
  // - Text width varies by character count
  // - Base padding: 8px top + 8px bottom = 16px total
  // - Border: 3px top + 3px bottom = 6px total
  // Assuming average screen width of 400px and height of 600px for normalization:
  // Base width: ~(16 + 6 + text_width) / 400 = ~0.055 + text_width/400
  // Base height: ~(16 + 6 + text_height) / 600 = ~0.037 + text_height/600
  // We'll use larger values to ensure the hitbox covers the entire bubble
  const BASE_WIDTH = 0.10; // Increased to ensure full coverage
  const BASE_HEIGHT = 0.08; // Increased to ensure full coverage
  const CHAR_WIDTH = 0.018; // Increased per character width to match actual padding

  // Calculate width based on text length
  const textLength = text.length;
  // For short words (1-4 chars), use base width
  // For longer words, add width per character
  const width = BASE_WIDTH + Math.max(0, (textLength - 4) * CHAR_WIDTH);
  const height = BASE_HEIGHT;

  return { width, height };
}
/**
 * Generate explanation for why a word is correct or incorrect
 */
function generateFeedbackExplanation(word: string, isTarget: boolean, mission: Mission | null): string {
  if (!mission) return "";

  const wordLower = word.toLowerCase();

  if (isTarget) {
    // Correct hit - explain why
    switch (mission.type) {
      case "WORD_FAMILY":
        return `✓ "${wordLower}" is related to ${mission.theme}`;
      case "CONNECTORS":
        return `✓ "${wordLower}" expresses ${mission.connectorCategory?.toLowerCase()}`;
      case "SYNONYMS":
        return `✓ "${wordLower}" = synonym of ${mission.synonymKey?.toLowerCase()}`;
      default:
        return `✓ Correct!`;
    }
  } else {
    // Wrong hit - explain why it's wrong
    switch (mission.type) {
      case "WORD_FAMILY":
        return `✗ "${wordLower}" is NOT related to ${mission.theme}`;
      case "CONNECTORS":
        return `✗ "${wordLower}" is NOT a ${mission.connectorCategory?.toLowerCase()} connector`;
      case "SYNONYMS":
        return `✗ "${wordLower}" ≠ synonym of ${mission.synonymKey?.toLowerCase()}`;
      default:
        return `✗ Wrong word!`;
    }
  }
}

/**
 * Check collisions between bullets and enemies
 * Uses rectangular hitbox that adapts to word length
 */
export function checkCollisions(state: GameState, mission: Mission | null): GameState {
  const BULLET_WIDTH = 0.01; // Width of bullet (1% of screen width)
  const BULLET_HEIGHT = 0.03; // Height of bullet (3% of screen height)

  let newState = { ...state };
  const bulletsToRemove = new Set<string>();
  const enemiesToRemove = new Set<string>();

  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      // Get dynamic dimensions based on word length
      const enemyDims = getEnemyDimensions(enemy.text);

      // Calculate bounding boxes
      const enemyLeft = enemy.x - enemyDims.width / 2;
      const enemyRight = enemy.x + enemyDims.width / 2;
      const enemyTop = enemy.y - enemyDims.height / 2;
      const enemyBottom = enemy.y + enemyDims.height / 2;

      const bulletLeft = bullet.x - BULLET_WIDTH / 2;
      const bulletRight = bullet.x + BULLET_WIDTH / 2;
      const bulletTop = bullet.y - BULLET_HEIGHT / 2;
      const bulletBottom = bullet.y + BULLET_HEIGHT / 2;

      // Check rectangular collision (AABB - Axis Aligned Bounding Box)
      const collision = (
        bulletLeft < enemyRight &&
        bulletRight > enemyLeft &&
        bulletTop < enemyBottom &&
        bulletBottom > enemyTop
      );

      if (collision) {
        bulletsToRemove.add(bullet.id);
        enemiesToRemove.add(enemy.id);

        // Create explosion effect
        const explosion: Explosion = {
          id: generateId(),
          x: enemy.x,
          y: enemy.y,
          type: enemy.isTarget ? "hit" : "miss",
          life: 0,
          maxLife: 20, // 20 frames at 60fps = ~333ms
        };
        newState.explosions = [...newState.explosions, explosion];

        // Create educational feedback message
        const feedbackMessage: FeedbackMessage = {
          id: generateId(),
          text: enemy.text,
          isCorrect: enemy.isTarget,
          explanation: generateFeedbackExplanation(enemy.text, enemy.isTarget, mission),
          x: enemy.x,
          y: enemy.y,
          life: 0,
          maxLife: 90, // 90 frames at 60fps = ~1.5 seconds
        };

        // LIMIT FEEDBACK MESSAGES: only keep the last 2 to avoid clutter
        // Also add a slight offset if multiple messages spawn
        const existingMessages = newState.feedbackMessages.map(m => ({
          ...m,
          y: m.y - 0.05 // Push existing messages up to make room
        }));

        newState.feedbackMessages = [...existingMessages.slice(-1), feedbackMessage];

        if (enemy.isTarget) {
          // Correct hit - increase score
          const baseScore = 10 * newState.level;
          const isDoubleXP = hasActivePowerUp(newState, "double_xp");
          newState.score += isDoubleXP ? baseScore * 2 : baseScore;

          // Increment wave progress
          newState.waveProgress += 1;

          // INCREASE SUPER BAR
          newState.superBar = Math.min(100, newState.superBar + 2);

          // BOSS DAMAGE if in boss wave
          if (newState.mission?.type === "BOSS" && newState.boss) {
            newState.boss.hp -= 1;
            if (newState.boss.hp <= 0) {
              newState.waveStatus = "cleared";
              newState.waveTransitionTime = Date.now();
              newState.score += 1000; // Big bonus
            }
          }

          if (newState.waveProgress >= newState.waveTarget) {
            newState.waveStatus = "cleared";
            newState.waveTransitionTime = Date.now();
            // Score bonus for finishing wave based on wave number
            newState.score += newState.waveNumber * 100;

            // BONUS SUPER BAR on wave clear
            newState.superBar = Math.min(100, newState.superBar + 20);
          }

          // COMBO System
          newState.comboCount += 1;
          if (newState.comboCount > newState.maxCombo) {
            newState.maxCombo = newState.comboCount;
          }
          // Extra points for combo
          if (newState.comboCount >= 5) {
            newState.score += Math.floor(newState.comboCount / 5) * 5;
          }

          // Track learned word
          if (!newState.learnedWords.includes(enemy.text)) {
            newState.learnedWords = [...newState.learnedWords, enemy.text];
          }
        } else {
          // Track missed word (wrong hit)
          if (!newState.missedWords.includes(enemy.text)) {
            newState.missedWords = [...newState.missedWords, enemy.text];
          }

          // Wrong hit - reset combo
          newState.comboCount = 0;

          // DECREASE SUPER BAR on mistake
          newState.superBar = Math.max(0, newState.superBar - 10);

          // Wrong hit - check for shield first
          if (newState.hasShield) {
            // Shield absorbs the damage
            newState.hasShield = false;
          } else {
            // No shield - lose a life
            newState.lives = Math.max(0, newState.lives - 1);
            if (newState.lives === 0) {
              newState.gameOver = true;
              newState.isRunning = false;
            }
          }
        }
        break; // bullet can only hit one enemy
      }
    }
  }

  newState.bullets = newState.bullets.filter((b) => !bulletsToRemove.has(b.id));
  newState.enemies = newState.enemies.filter((e) => !enemiesToRemove.has(e.id));

  return newState;
}

/**
 * Check if enemies reached the bottom
 */
export function checkEnemiesReachedBottom(state: GameState, mission: Mission | null): GameState {
  let newState = { ...state };

  for (const enemy of state.enemies) {
    if (enemy.y >= 1.0) {
      // Enemy reached bottom
      if (enemy.isTarget) {
        // Target reached bottom - reset combo
        newState.comboCount = 0;

        // Track missed word (target reached bottom)
        if (!newState.missedWords.includes(enemy.text)) {
          newState.missedWords = [...newState.missedWords, enemy.text];
        }

        // Correct word reached bottom - check for shield
        if (newState.hasShield) {
          // Shield absorbs the damage
          newState.hasShield = false;
        } else {
          // No shield - lose a life
          newState.lives = Math.max(0, newState.lives - 1);
          if (newState.lives === 0) {
            newState.gameOver = true;
            newState.isRunning = false;
          }
        }
      }
      // Remove enemy (whether target or not)
      newState.enemies = newState.enemies.filter((e) => e.id !== enemy.id);
    }
  }

  return newState;
}

/**
 * Fire a bullet
 */
export function fireBullet(state: GameState): GameState {
  if (state.waveStatus !== "playing") return state; // Only fire if playing

  const now = Date.now();
  const bulletInterval = 450; // fire every 450ms (slower, more controlled)

  if (now - state.lastBulletTime < bulletInterval) {
    return state; // too soon to fire
  }

  // Ship is 80px wide, centered with translateX(-50%)
  // Bullets should fire from the exact center position (shipX)
  // The ship visual offset is handled in the SpaceShip component
  const bulletX = state.shipX;

  const newBullet: Bullet = {
    id: generateId(),
    x: bulletX,
    y: 0.92, // start near bottom (ship position)
    speed: 0.12, // slightly slower bullet speed for better visibility
  };

  return {
    ...state,
    bullets: [...state.bullets, newBullet],
    lastBulletTime: now,
  };
}

/**
 * Update bullet positions
 */
export function updateBullets(state: GameState, deltaTime: number): GameState {
  if (state.waveStatus !== "playing") return state; // Only move if playing

  // Normalize deltaTime to 60fps (16.67ms per frame)
  const normalizedDelta = deltaTime / 16.67;

  const bullets = state.bullets.map((bullet) => ({
    ...bullet,
    y: bullet.y - bullet.speed * normalizedDelta,
  })).filter((bullet) => bullet.y > -0.1); // remove bullets that are off-screen

  return { ...state, bullets };
}

/**
 * Spawn enemies periodically with preview system
 * Progressive difficulty like Tetris: more enemies and faster spawn rate
 */
export function spawnEnemiesIfNeeded(state: GameState, mission: Mission | null): GameState {
  if (state.waveStatus !== "playing") return state; // Only spawn if playing

  const now = Date.now();

  // Accélération progressive (comme Tetris) - encore plus rapide
  // Niveau 1: 4000ms, niveau 10: 2500ms, niveau 20: 1500ms, niveau 30: 1000ms
  // Formule: base - (level * réduction progressive)
  const baseSpawnInterval = 4000;
  const minSpawnInterval = 900; // Minimum atteint vers le niveau 35
  const spawnInterval = Math.max(
    minSpawnInterval,
    baseSpawnInterval - (state.level - 1) * 90 // Réduction de 90ms par niveau (encore plus rapide)
  );

  const PREVIEW_DURATION = 2000; // Show upcoming enemy 2 seconds before it spawns

  // Nombre d'ennemis maximum augmente progressivement (comme Tetris)
  // Niveau 1: 3, niveau 5: 5, niveau 10: 7, niveau 15: 9, niveau 20: 12
  const baseMaxEnemies = 3;
  const maxEnemiesOnScreen = Math.min(
    15, // Maximum absolu
    baseMaxEnemies + Math.floor((state.level - 1) / 3) // +1 ennemi tous les 3 niveaux
  );

  let newState = { ...state };

  // Handle spawning the upcoming enemy
  if (newState.upcomingEnemy && now >= newState.upcomingEnemySpawnTime) {
    const newEnemy: EnemyWord = {
      id: generateId(),
      text: newState.upcomingEnemy.text,
      isTarget: newState.upcomingEnemy.isTarget,
      x: newState.upcomingEnemy.x,
      y: -0.1, // Start above screen
      // Accélération progressive très lente (comme Tetris)
      // Niveau 1: 0.004, niveau 10: 0.006, niveau 20: 0.008, niveau 30: 0.010
      speed: 0.004 + (newState.level - 1) * 0.0002, // +0.0002 par niveau (très progressif)
      baseX: newState.upcomingEnemy.x, // Use preview X as baseX for sinusoidal movement
      movementType: newState.upcomingEnemy.movementType,
      horizontalSpeed: newState.upcomingEnemy.horizontalSpeed,
      amplitude: newState.upcomingEnemy.amplitude,
      phase: newState.upcomingEnemy.phase,
      zigzagDirection: newState.upcomingEnemy.zigzagDirection,
      zigzagChangeY: newState.upcomingEnemy.zigzagChangeY,
      spiralRadius: newState.upcomingEnemy.spiralRadius,
      spiralAngle: newState.upcomingEnemy.spiralAngle,
    };
    newState.enemies = [...newState.enemies, newEnemy];
    newState.upcomingEnemy = null; // Clear upcoming enemy
    newState.lastEnemySpawnTime = now;
  }

  // Generate a new upcoming enemy if none exists and it's time
  if (!newState.upcomingEnemy && newState.enemies.length < maxEnemiesOnScreen && now - newState.lastEnemySpawnTime >= spawnInterval - PREVIEW_DURATION) {
    // For BOSS mission, we need to pick a Temporary Mission type to know what words to spawn
    let bossSubMission: Mission | null = mission;
    if (mission?.type === "BOSS") {
      // Pick a random mission type for the words falling during boss fight
      bossSubMission = generateMission(state.waveNumber + 1); // Use next wave logic for variety
      if (bossSubMission.type === "BOSS") bossSubMission = generateMission(1); // Avoid recursion
    }

    const newEnemyData = spawnEnemy(newState, bossSubMission); // Use spawnEnemy to get word and target status
    newState.upcomingEnemy = {
      ...newEnemyData,
    };
    newState.upcomingEnemySpawnTime = newState.lastEnemySpawnTime + spawnInterval;
  }

  return newState;
}

/**
 * Update mission if needed (change every 30 seconds)
 */
export function updateMissionIfNeeded(state: GameState): GameState {
  const now = Date.now();
  const MISSION_DURATION = 30000; // 30 seconds

  if (now - state.lastMissionChangeTime >= MISSION_DURATION) {
    return {
      ...state,
      mission: generateMission(),
      lastMissionChangeTime: now,
      missionDuration: 0,
    };
  }

  return {
    ...state,
    missionDuration: now - state.lastMissionChangeTime,
  };
}

/**
 * Update level based on score
 */
export function updateLevel(state: GameState): GameState {
  const newLevel = Math.floor(state.score / 100) + 1;
  if (newLevel > state.level) {
    return { ...state, level: newLevel };
  }
  return state;
}



/**
 * Update explosion animations
 */
export function updateExplosions(state: GameState, deltaTime: number): GameState {
  const explosions = state.explosions
    .map((explosion) => ({
      ...explosion,
      life: explosion.life + 1,
    }))
    .filter((explosion) => explosion.life < explosion.maxLife);

  return { ...state, explosions };
}

/**
 * Update feedback message animations
 */
export function updateFeedbackMessages(state: GameState, deltaTime: number): GameState {
  const feedbackMessages = state.feedbackMessages
    .map((msg) => ({
      ...msg,
      life: msg.life + 1,
      y: msg.y - 0.002, // Float upward slowly
    }))
    .filter((msg) => msg.life < msg.maxLife);

  return { ...state, feedbackMessages };
}

/**
 * Spawn power-up occasionally
 */
export function spawnPowerUpIfNeeded(state: GameState): GameState {
  if (state.waveStatus !== "playing") return state; // Only spawn if playing

  const now = Date.now();
  const POWERUP_SPAWN_INTERVAL = 15000; // Every 15 seconds on average
  const POWERUP_CHANCE = 0.3; // 30% chance when interval is met

  if (now - state.lastPowerUpSpawnTime < POWERUP_SPAWN_INTERVAL) {
    return state;
  }

  if (Math.random() > POWERUP_CHANCE) {
    return { ...state, lastPowerUpSpawnTime: now };
  }

  // Spawn a random power-up
  const powerUpTypes: PowerUpType[] = ["shield", "slowmo", "double_xp", "extra_life"];
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

  const powerup: PowerUp = {
    id: generateId(),
    type,
    x: Math.random() * 0.8 + 0.1, // 10% to 90% of screen
    y: -0.05, // Start above screen
    speed: 0.003, // Slower than enemies
  };

  return {
    ...state,
    powerups: [...state.powerups, powerup],
    lastPowerUpSpawnTime: now,
  };
}

/**
 * Update power-up positions
 */
export function updatePowerUps(state: GameState, deltaTime: number): GameState {
  const normalizedDelta = deltaTime / 16.67;

  const powerups = state.powerups
    .map((p) => ({
      ...p,
      y: p.y + p.speed * normalizedDelta,
    }))
    .filter((p) => p.y < 1.1); // Remove if off-screen

  return { ...state, powerups };
}

/**
 * Check if ship collects power-up
 */
export function collectPowerUp(state: GameState): GameState {
  const SHIP_WIDTH = 0.08; // 8% of screen width
  const SHIP_Y = 0.92; // Ship position
  const POWERUP_SIZE = 0.04; // 4% of screen

  let newState = { ...state };
  const collectedIds = new Set<string>();

  for (const powerup of state.powerups) {
    // Check collision with ship
    const shipLeft = state.shipX - SHIP_WIDTH / 2;
    const shipRight = state.shipX + SHIP_WIDTH / 2;
    const powerupLeft = powerup.x - POWERUP_SIZE / 2;
    const powerupRight = powerup.x + POWERUP_SIZE / 2;

    const horizontalOverlap = powerupLeft < shipRight && powerupRight > shipLeft;
    const verticalOverlap = powerup.y > SHIP_Y - 0.1 && powerup.y < SHIP_Y + 0.1;

    if (horizontalOverlap && verticalOverlap) {
      collectedIds.add(powerup.id);
      const now = Date.now();

      switch (powerup.type) {
        case "shield":
          newState.hasShield = true;
          break;
        case "slowmo":
          newState.activePowerUps = [
            ...newState.activePowerUps.filter(p => p.type !== "slowmo"),
            { type: "slowmo", endTime: now + 5000 } // 5 seconds
          ];
          break;
        case "double_xp":
          newState.activePowerUps = [
            ...newState.activePowerUps.filter(p => p.type !== "double_xp"),
            { type: "double_xp", endTime: now + 10000 } // 10 seconds
          ];
          break;
        case "extra_life":
          newState.lives = Math.min(5, newState.lives + 1); // Max 5 lives
          break;
      }
    }
  }

  newState.powerups = newState.powerups.filter(p => !collectedIds.has(p.id));
  return newState;
}

/**
 * Update active power-ups (remove expired ones)
 */
export function updateActivePowerUps(state: GameState): GameState {
  const now = Date.now();
  const activePowerUps = state.activePowerUps.filter(p => p.endTime > now);
  return { ...state, activePowerUps };
}

/**
 * Check if a power-up is currently active
 */
export function hasActivePowerUp(state: GameState, type: PowerUpType): boolean {
  return state.activePowerUps.some(p => p.type === type);
}

/**
 * Update the wave lifecycle (transitions)
 */
export function updateWaveLifecycle(state: GameState): GameState {
  const now = Date.now();
  const TRANSITION_DURATION = 3000; // 3 seconds for intro/cleared screens

  if (state.waveStatus === "intro" || state.waveStatus === "boss_intro") {
    if (now - state.waveTransitionTime > TRANSITION_DURATION) {
      return { ...state, waveStatus: "playing" };
    }
  }

  if (state.waveStatus === "cleared") {
    if (now - state.waveTransitionTime > TRANSITION_DURATION) {
      return startNextWave(state);
    }
  }

  return state;
}

/**
 * Initialize next wave
 */
export function startNextWave(state: GameState): GameState {
  const nextWaveNumber = state.waveNumber + 1;
  const nextMission = generateMission(nextWaveNumber);
  const isBossWave = nextWaveNumber % 5 === 0;

  const nextState: GameState = {
    ...state,
    enemies: [], // Clear screen
    bullets: [],
    powerups: [],
    waveNumber: nextWaveNumber,
    mission: nextMission,
    waveTarget: nextMission.targetCount,
    waveProgress: 0,
    waveStatus: isBossWave ? "boss_intro" : "intro",
    waveTransitionTime: Date.now(),
    lastEnemySpawnTime: Date.now(),
    currentDialogue: getDialogueForWave(nextWaveNumber),
    dialogueIndex: 0,
  };

  return {
    ...nextState,
    boss: isBossWave ? {
      id: generateId(),
      name: "CENTURION X-1",
      hp: 15,
      maxHp: 15,
      x: 0.5,
      y: 0.2,
      phase: 1
    } : null
  };
}

/**
 * Activate Super Ability
 */
export function activateSuper(state: GameState): GameState {
  if (state.superBar < 100 || state.superActive) return state;

  return {
    ...state,
    superActive: true,
    superBar: 0,
    superStartTime: Date.now(),
    // Clear all distractors currently on screen
    enemies: state.enemies.map(e => e.isTarget ? e : { ...e, y: 1.2 }), // Send distractors off-screen
    explosions: [
      ...state.explosions,
      {
        id: generateId(),
        x: 0.5,
        y: 0.5,
        type: "hit",
        life: 0,
        maxLife: 100
      }
    ]
  };
}

/**
 * Update Super state duration
 */
export function updateSuperState(state: GameState): GameState {
  if (!state.superActive) return state;
  const now = Date.now();
  if (now - state.superStartTime > 5000) { // 5 seconds duration
    return { ...state, superActive: false };
  }
  return state;
}

/**
 * Start the game
 */
export function startGame(state: GameState): GameState {
  const now = Date.now();
  const firstMission = generateMission(1);
  return {
    ...state,
    isRunning: true,
    gameOver: false,
    mission: firstMission,
    waveNumber: 1,
    waveTarget: firstMission.targetCount,
    waveProgress: 0,
    waveStatus: "intro",
    waveTransitionTime: now,
    lastMissionChangeTime: now,
    lastEnemySpawnTime: now,
    lastBulletTime: 0,
    upcomingEnemy: null,
    upcomingEnemySpawnTime: 0,
    currentDialogue: getDialogueForWave(1),
    dialogueIndex: 0,
  };
}

/**
 * Get dialogue for a specific wave
 */
export function getDialogueForWave(waveNumber: number): Dialogue | null {
  if (waveNumber === 1) {
    return {
      id: "wave_1",
      lines: [
        { speaker: "COMMANDER", text: "Welcome to the Sector 7, Recruit. We have a lexical breach!" },
        { speaker: "COMMANDER", text: "Your mission is simple: shoot the words that match your mission profile." },
        { speaker: "AI GUIDE", text: "I will assist you. Use the Super EMP [SPACE] once the bar is full." },
      ]
    };
  }

  if (waveNumber === 5) {
    return {
      id: "wave_5_boss",
      lines: [
        { speaker: "AI GUIDE", text: "WARNING: High power lexical entity detected ahead." },
        { speaker: "COMMANDER", text: "That's the Centurion X-1! Don't let its distractors confuse you." },
        { speaker: "COMMANDER", text: "Focus fire on the core by shooting the required synonyms!" },
      ]
    };
  }

  return null;
}

/**
 * Advance dialogue to next line
 */
export function advanceDialogue(state: GameState): GameState {
  if (!state.currentDialogue) return state;

  const nextIndex = state.dialogueIndex + 1;
  if (nextIndex >= state.currentDialogue.lines.length) {
    return closeDialogue(state);
  }

  return {
    ...state,
    dialogueIndex: nextIndex
  };
}

/**
 * Close current dialogue
 */
export function closeDialogue(state: GameState): GameState {
  const isIntro = state.waveStatus === "intro" || state.waveStatus === "boss_intro";
  return {
    ...state,
    currentDialogue: null,
    dialogueIndex: 0,
    waveTransitionTime: isIntro ? Date.now() : state.waveTransitionTime
  };
}

/**
 * Pause the game
 */
export function pauseGame(state: GameState): GameState {
  return {
    ...state,
    isRunning: false,
  };
}

/**
 * Resume the game
 */
export function resumeGame(state: GameState): GameState {
  return {
    ...state,
    isRunning: true,
  };
}

/**
 * Reset the game
 */
export function resetGame(state: GameState): GameState {
  return createGameState();
}

/**
 * Move ship left or right
 */
export function moveShip(state: GameState, direction: "left" | "right" | "stop"): GameState {
  const ACCELERATION = 0.005;
  const MAX_VELOCITY = 0.005;
  const FRICTION = 0.985;

  let newVelocity = state.shipVelocity;

  if (direction === "left") {
    newVelocity = Math.max(-MAX_VELOCITY, newVelocity - ACCELERATION);
  } else if (direction === "right") {
    newVelocity = Math.min(MAX_VELOCITY, newVelocity + ACCELERATION);
  } else {
    // Apply friction when stopping
    newVelocity *= FRICTION;
    if (Math.abs(newVelocity) < 0.0001) {
      newVelocity = 0;
    }
  }

  return {
    ...state,
    shipVelocity: newVelocity,
  };
}

/**
 * Set ship target position (for touch/mouse input)
 */
export function setShipTarget(state: GameState, targetX: number): GameState {
  const SMOOTH_FACTOR = 0.04; // Lower = smoother but slower
  const clampedX = Math.max(0.02, Math.min(0.98, targetX));

  // Smooth interpolation towards target
  const newX = state.shipX + (clampedX - state.shipX) * SMOOTH_FACTOR;

  return {
    ...state,
    shipX: newX,
  };
}

/**
 * Update ship position based on velocity
 */
export function updateShipPosition(state: GameState, deltaTime: number): GameState {
  const normalizedDelta = deltaTime / 16.67;
  const FRICTION = 0.985;

  // Apply friction
  let newVelocity = state.shipVelocity * FRICTION;
  if (Math.abs(newVelocity) < 0.0001) {
    newVelocity = 0;
  }

  // Update position
  let newX = state.shipX + newVelocity * normalizedDelta;

  // Clamp to screen bounds
  newX = Math.max(0.02, Math.min(0.98, newX));

  return {
    ...state,
    shipX: newX,
    shipVelocity: newVelocity,
  };
}
