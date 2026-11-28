// A word belongs to a theme in either column. Only the guided column is
// used as a target in French-guided missions (levels 1 and 2).
import { vocabularyTopics } from "./words/vocabulary-topics";

interface Family {
  guided?: string[];
  extra: string[];
}

const families: Record<string, Family> = {
  TRAVEL: {
    guided: [
      "train", "bus", "plane", "boat", "bike", "car", "taxi", "ferry", "airplane", "airport",
      "station", "platform", "stop", "hotel", "passport", "ticket", "suitcase", "backpack",
      "map", "trip", "holiday", "tourist", "travel", "journey", "flight", "passenger",
      "pilot", "driver", "airport gate", "bus stop", "train station", "return ticket",
      "boarding pass", "seat", "luggage", "tour guide",
    ],
    extra: [
      "hostel", "visa", "destination", "tourism", "reservation", "booking", "departure", "arrival",
      "delay", "cancellation", "boarding", "customs", "border", "itinerary", "layover", "timetable",
      "one-way ticket", "carriage", "railway", "car hire", "fellow traveller", "baggage claim",
    ],
  },
  FOOD: {
    guided: [
      "bread", "apple", "milk", "egg", "rice", "pasta", "cheese", "butter", "fish", "chicken",
      "carrot", "potato", "tomato", "banana", "pear", "orange", "grape", "lemon", "strawberry",
      "yoghurt", "salad", "sandwich", "soup", "pizza", "cake", "biscuit", "water", "juice",
      "menu", "kitchen", "sweet", "salty", "snack", "dessert", "meal", "breakfast", "lunch",
      "dinner", "restaurant", "cafe", "beans", "onion", "flour", "honey",
    ],
    extra: [
      "canteen", "recipe", "ingredient", "flavour", "spice", "bitter", "sour", "healthy", "unhealthy",
      "balanced", "diet", "allergy", "portion", "lentils", "chickpeas", "seafood", "pastry",
      "poultry", "wholemeal bread", "dairy", "oats", "aubergine",
    ],
  },
  SPORTS: {
    guided: [
      "football", "basketball", "tennis", "swimming", "cycling", "running", "rugby", "volleyball",
      "badminton", "baseball", "hockey", "skating", "skiing", "gymnastics", "table tennis",
      "ball", "goal", "net", "racket", "bat", "race", "match", "medal", "winner", "stadium",
      "field", "player", "team", "coach", "training", "competition", "victory", "score", "exercise",
      "goalkeeper", "swimming pool", "golf", "athletics",
    ],
    extra: [
      "arena", "pitch", "court", "athlete", "opponent", "referee", "supporter", "practice", "tournament",
      "championship", "league", "defeat", "draw", "fitness", "performance", "relay", "hurdles",
      "marathon", "spectator", "penalty", "qualifier", "archery", "fencing", "rowing",
    ],
  },
  NATURE: {
    guided: [
      "tree", "leaf", "flower", "grass", "seed", "plant", "branch", "root", "wood", "rock",
      "stone", "sand", "hill", "field", "pond", "waterfall", "cave", "stream", "forest", "jungle",
      "mountain", "river", "lake", "ocean", "sea", "desert", "island", "beach", "valley", "cliff",
      "coast", "wildlife", "shell", "earth", "sky", "wave",
    ],
    extra: [
      "species", "habitat", "sunrise", "sunset", "landscape", "environment", "ecosystem", "storm",
      "rain", "wind", "snow", "season", "woodland", "meadow", "wetland", "reef", "glacier",
      "volcano", "shoreline", "tide", "soil", "moss",
    ],
  },
  EDUCATION: {
    guided: [
      "school", "classroom", "lesson", "teacher", "student", "pupil", "homework", "mark", "subject",
      "timetable", "library", "book", "pen", "pencil", "paper", "notebook", "ruler", "rubber",
      "eraser", "pencil case", "schoolbag", "desk", "board", "playground", "classmate", "test",
      "exam", "question", "answer", "break time", "textbook", "dictionary", "maths", "science",
      "history", "geography", "art", "music",
    ],
    extra: [
      "college", "university", "course", "grade", "result", "knowledge", "learning", "revision",
      "deadline", "scholarship", "syllabus", "curriculum", "qualification", "lecture", "seminar",
      "assignment", "assessment", "enrolment", "headteacher", "tuition",
    ],
  },
  CLOTHES: {
    guided: [
      "shirt", "t-shirt", "jeans", "trousers", "shorts", "skirt", "dress", "coat", "jacket", "jumper",
      "shoes", "boots", "socks", "hat", "cap", "scarf", "gloves", "sweater", "hoodie", "trainers",
      "sneakers", "belt", "tie", "pyjamas", "uniform", "sandals", "slippers", "raincoat", "swimsuit",
      "suit", "blouse", "underwear", "sleeve", "pocket", "button",
    ],
    extra: [
      "cardigan", "waistcoat", "overcoat", "tracksuit", "leggings", "tights", "dressing gown",
      "overalls", "bow tie", "mittens", "zip", "collar", "cuff", "denim", "wool", "linen",
    ],
  },
  "HOUSE & HOME": {
    guided: [
      "house", "home", "flat", "garden", "kitchen", "bathroom", "bedroom", "living room", "garage",
      "sofa", "chair", "table", "bed", "window", "door", "roof", "wall", "floor", "lamp", "mirror",
      "stairs", "shower", "bath", "sink", "fridge", "oven", "cupboard", "shelf", "carpet", "curtain",
      "pillow", "blanket", "wardrobe", "balcony", "dining room", "armchair", "towel", "apartment",
    ],
    extra: [
      "furniture", "ceiling", "attic", "basement", "landing", "hallway", "doorstep", "doormat",
      "fireplace", "bookcase", "chest of drawers", "dishwasher", "windowsill", "driveway",
      "front porch", "kettle", "washing machine",
    ],
  },
  FAMILY: {
    guided: [
      "mother", "father", "mum", "dad", "parents", "brother", "sister", "grandmother", "grandfather",
      "uncle", "aunt", "cousin", "son", "daughter", "child", "baby", "twins", "grandparents",
      "grandson", "granddaughter", "grandchildren", "niece", "nephew", "husband", "wife",
      "stepfather", "stepmother", "only child",
    ],
    extra: [
      "sibling", "relative", "ancestor", "descendant", "generation", "great-grandmother",
      "great-grandfather", "half-brother", "half-sister", "stepsister", "stepbrother", "father-in-law",
      "mother-in-law", "family tree", "foster parent", "guardian", "adoption", "kinship",
    ],
  },
  "BODY PARTS": {
    guided: [
      "head", "face", "eye", "nose", "mouth", "ear", "hair", "neck", "arm", "hand", "finger", "leg",
      "knee", "foot", "back", "shoulder", "elbow", "wrist", "thumb", "toe", "ankle", "chin", "cheek",
      "lip", "tooth", "tongue", "forehead", "stomach", "skin", "heart", "brain", "chest", "heel",
    ],
    extra: [
      "eyebrow", "eyelash", "eyelid", "nostril", "jaw", "throat", "palm", "knuckle", "fingernail",
      "calf", "shin", "hip", "spine", "rib", "lung", "liver", "kidney", "muscle", "tendon",
    ],
  },
  ANIMALS: {
    guided: [
      "cat", "dog", "bird", "fish", "rabbit", "hamster", "mouse", "horse", "cow", "pig", "sheep",
      "chicken", "duck", "lion", "tiger", "elephant", "monkey", "bear", "snake", "spider", "fox",
      "wolf", "deer", "goat", "donkey", "frog", "turtle", "dolphin", "whale", "shark", "penguin",
      "owl", "eagle", "giraffe", "zebra", "kangaroo", "bee", "butterfly", "ant", "seal",
    ],
    extra: [
      "otter", "badger", "hedgehog", "squirrel", "leopard", "rhinoceros", "flamingo", "heron",
      "sparrow", "jellyfish", "octopus", "seahorse", "dragonfly", "ladybird", "beetle", "lizard",
    ],
  },
  WEATHER: {
    guided: [
      "sun", "rain", "cloud", "wind", "snow", "storm", "fog", "hot", "cold", "warm", "sunny",
      "rainy", "cloudy", "windy", "snowy", "foggy", "stormy", "wet", "dry", "cool", "icy",
      "thunder", "lightning", "ice", "frost", "breeze", "rainbow", "sunshine", "rainfall",
      "snowflake", "temperature", "forecast", "hail",
    ],
    extra: [
      "mist", "drizzle", "downpour", "sleet", "blizzard", "gust", "gale", "overcast", "humid",
      "humidity", "heatwave", "drought", "hurricane", "tornado", "thunderstorm", "cold snap",
      "weather front", "air pressure",
    ],
  },
  COLOURS: {
    guided: [
      "red", "blue", "green", "yellow", "black", "white", "grey", "orange", "purple", "pink",
      "brown", "gold", "silver", "beige", "violet", "navy blue", "sky blue", "light blue",
      "dark blue", "light green", "dark green", "pale pink", "dark red", "light brown",
    ],
    extra: [
      "indigo", "turquoise", "lilac", "lavender", "scarlet", "crimson", "burgundy", "maroon",
      "amber", "ivory", "cream", "olive green", "teal", "coral", "bronze", "peach", "mint green",
      "charcoal grey", "colourful", "bright", "dark", "pale", "light",
    ],
  },
  TECHNOLOGY: { extra: [
    "computer", "laptop", "tablet", "smartphone", "screen", "keyboard", "mouse", "software",
    "program", "application", "app", "internet", "website", "platform", "network", "wi-fi", "data",
    "file", "robot", "algorithm", "digital", "device", "update", "password", "security", "headphones",
    "microphone", "charger", "printer", "battery", "touchscreen", "browser", "download", "upload",
    "server", "sensor", "processor", "storage", "backup", "database",
  ] },
  ENVIRONMENT_ISSUES: { extra: [
    "nature", "climate", "weather", "global warming", "climate change", "recycling", "waste", "rubbish",
    "litter", "plastic", "pollution", "smog", "carbon", "carbon footprint", "renewable", "solar", "wind",
    "sustainable", "biodiversity", "deforestation", "endangered", "conservation", "greenhouse gas",
    "emissions", "protect", "landfill", "compost", "drought", "flooding", "habitat loss", "wildfire",
    "fossil fuels", "wind farm", "solar panel", "clean energy", "reforestation", "sea level",
    "air quality", "water shortage", "single-use plastic",
  ] },
  SOCIAL_MEDIA: { extra: [
    "account", "profile", "post", "comment", "like", "share", "follower", "influencer", "trend",
    "hashtag", "content", "video", "story", "stream", "message", "chat", "notification", "privacy",
    "filter", "community", "fake news", "bullying", "troll", "addiction", "algorithm", "username",
    "feed", "caption", "emoji", "repost", "direct message", "group chat", "livestream", "subscriber",
    "moderator", "viral", "tag", "block", "unfollow", "screen time",
  ] },
  FEELINGS: { extra: [
    "happy", "sad", "angry", "afraid", "anxious", "worried", "relieved", "disappointed", "confident",
    "proud", "ashamed", "embarrassed", "frustrated", "jealous", "curious", "bored", "lonely", "hopeful",
    "shocked", "surprised", "excited", "tired", "stressed", "relaxed", "motivated", "grateful",
    "delighted", "upset", "nervous", "calm", "homesick", "amused", "furious", "cheerful", "confused",
    "overwhelmed", "content", "discouraged", "joy", "fear", "regret",
  ] },
  CITY_LIFE: { extra: [
    "street", "avenue", "square", "neighbourhood", "district", "traffic", "rush hour", "crowd", "noise",
    "pollution", "building", "skyscraper", "block", "shop", "mall", "market", "bus", "tram",
    "underground", "station", "pedestrian", "crossing", "park", "bench", "streetlight", "pavement",
    "cycle lane", "roundabout", "traffic lights", "town hall", "suburb", "high street", "bus lane",
    "car park", "commuter", "fountain", "junction", "city centre", "tower block", "pedestrian zone",
  ] },
  FUTURE_JOBS: { extra: [
    "job", "career", "workplace", "office", "factory", "salary", "income", "wage", "internship",
    "training", "qualification", "skills", "experience", "interview", "promotion", "colleague",
    "manager", "boss", "company", "remote work", "resignation", "unemployment", "contract", "full-time",
    "part-time", "apprentice", "vacancy", "application", "employer", "employee", "recruitment",
    "shift", "overtime", "electrician", "plumber", "mechanic", "architect", "designer", "engineer", "chef",
  ] },
  SPACE_MISSION: { extra: [
    "space", "spaceship", "station", "rocket", "launch", "mission", "crew", "astronaut", "cosmonaut",
    "galaxy", "planet", "moon", "asteroid", "comet", "orbit", "gravity", "black hole", "solar system",
    "signal", "scanner", "radar", "shield", "engine", "fuel", "base", "satellite", "spacecraft",
    "space station", "space suit", "spacewalk", "rover", "probe", "lander", "telescope", "meteor",
    "crater", "constellation", "countdown", "liftoff", "launch pad", "light-year",
  ] },
  DIPLOMACY: { extra: [
    "agreement", "negotiation", "compromise", "alliance", "partnership", "cooperation", "trust",
    "respect", "peace", "truce", "treaty", "conflict", "tension", "sanction", "embassy", "protocol",
    "misunderstanding", "concession", "proposal", "resolution", "ambassador", "diplomat", "envoy",
    "delegate", "delegation", "consulate", "summit", "ceasefire", "mediation", "peace talks",
    "foreign policy", "diplomatic ties", "ratification", "joint statement", "bilateral talks", "consensus",
  ] },
  "HEALTH & MEDICINE": { extra: [
    "hospital", "medicine", "symptom", "treatment", "disease", "illness", "patient", "doctor", "nurse",
    "surgery", "operation", "recovery", "immune", "virus", "bacteria", "vaccine", "pharmacy",
    "prescription", "therapy", "clinic", "ambulance", "dentist", "surgeon", "fever", "cough",
    "headache", "sore throat", "allergy", "bandage", "thermometer", "check-up", "diagnosis",
    "ward", "first aid", "painkiller", "infection", "appointment", "blood pressure",
  ] },
  "ART & CULTURE": { extra: [
    "masterpiece", "exhibition", "gallery", "museum", "performance", "literature", "novel", "poetry",
    "sculpture", "painting", "theatre", "cinema", "festival", "heritage", "tradition", "culture",
    "creative", "artistic", "abstract", "classic", "portrait", "sketch", "canvas", "mural", "pottery",
    "photography", "choir", "orchestra", "concert", "ballet", "opera", "playwright", "audience",
    "rehearsal", "sculptor", "choreography", "printmaking", "watercolour",
  ] },
  "BUSINESS & ECONOMY": { extra: [
    "profit", "investment", "market", "economy", "entrepreneur", "startup", "company", "budget",
    "finance", "revenue", "inflation", "recession", "consumer", "producer", "trade", "industry",
    "product", "service", "strategy", "growth", "customer", "supplier", "retailer", "invoice", "loan",
    "debt", "interest rate", "turnover", "shareholder", "supply", "demand", "export", "import",
    "currency", "tax", "savings", "merger", "bankruptcy",
  ] },
  "CRIME & JUSTICE": { extra: [
    "evidence", "witness", "verdict", "investigation", "sentence", "crime", "criminal", "police",
    "lawyer", "judge", "court", "trial", "guilty", "innocent", "prison", "suspect", "theft", "victim",
    "justice", "illegal", "jury", "defendant", "prosecutor", "detective", "alibi", "arrest", "fine",
    "bail", "appeal", "burglary", "fraud", "robbery", "fingerprint", "testimony", "courtroom",
    "community service", "conviction", "acquittal",
  ] },
  COOKING: { extra: [
    "boil", "fry", "roast", "bake", "grill", "steam", "chop", "slice", "mix", "stir", "whisk", "pour",
    "ingredient", "seasoning", "flavour", "tasty", "delicious", "savoury", "utensil", "pan", "peel",
    "grate", "mash", "knead", "simmer", "melt", "toast", "drain", "sprinkle", "weigh", "saucepan",
    "ladle", "spatula", "sieve", "rolling pin", "chopping board", "baking tray", "mixing bowl",
  ] },
};

export const WORD_FAMILIES: Record<string, string[]> = {};
export const EASY_WORD_FAMILIES: Record<string, string[]> = {};
for (const [theme, { guided, extra }] of Object.entries(families)) {
  WORD_FAMILIES[theme] = guided ? [...guided, ...extra] : extra;
  if (guided) EASY_WORD_FAMILIES[theme] = guided;
}

const newGuidedThemes = new Set(["MUSIC", "GARDEN", "SEASIDE", "CAMPING", "TIME", "WORKSHOP"]);
for (const [theme, level, entries] of vocabularyTopics) {
  const words = entries.map(([english]) => english.toLowerCase());
  WORD_FAMILIES[theme] = [...new Set([...(WORD_FAMILIES[theme] ?? []), ...words])];
  if (level <= 2 && (EASY_WORD_FAMILIES[theme] || newGuidedThemes.has(theme))) {
    EASY_WORD_FAMILIES[theme] = [...new Set([...(EASY_WORD_FAMILIES[theme] ?? []), ...words])];
  }
}

// Small, hand-picked contrasts keep ambiguous answers out of the firing line.
// For instance, a bat can be an animal or sports equipment; a peach can be a
// fruit or a colour. Neither should be drawn at random as a "wrong" word.
const contrasts = {
  kin: ["aunt", "uncle", "niece", "nephew", "grandmother", "grandson", "cousin", "stepsister"],
  sport: ["basketball", "volleyball", "badminton", "rugby", "cycling", "gymnastics", "tennis", "baseball"],
  animals: ["penguin", "giraffe", "kangaroo", "zebra", "hedgehog", "leopard", "dolphin", "elephant"],
  anatomy: ["eyebrow", "ankle", "elbow", "chin", "thumb", "eyelash", "wrist", "forehead"],
  clothing: ["pyjamas", "slippers", "raincoat", "scarf", "socks", "skirt", "jumper", "trousers"],
  food: ["noodles", "sandwich", "biscuit", "potato", "lentils", "yoghurt", "onion", "pasta"],
  kitchen: ["saucepan", "teapot", "teaspoon", "rolling pin", "frying pan", "mixing bowl", "oven glove", "ladle"],
  landscape: ["waterfall", "cliff", "valley", "island", "glacier", "cave", "desert", "reef"],
};

const byTheme: Record<string, (keyof typeof contrasts)[]> = {
  TRAVEL: ["anatomy", "kin", "food"], FOOD: ["kin", "sport"],
  SPORTS: ["kin", "kitchen", "food"], NATURE: ["kin", "kitchen", "clothing"],
  EDUCATION: ["anatomy", "kitchen"], CLOTHES: ["animals", "food", "landscape"],
  "HOUSE & HOME": ["sport", "anatomy", "landscape"], FAMILY: ["sport", "kitchen", "landscape"],
  "BODY PARTS": ["kitchen", "food", "landscape"], ANIMALS: ["kitchen", "sport", "clothing"],
  WEATHER: ["kin", "anatomy", "kitchen"], COLOURS: ["kin", "anatomy", "sport"],
  TECHNOLOGY: ["kin", "food", "clothing"], ENVIRONMENT_ISSUES: ["kin", "anatomy"],
  SOCIAL_MEDIA: ["kitchen", "anatomy"], FEELINGS: ["kitchen", "clothing", "landscape"],
  CITY_LIFE: ["anatomy", "animals"], FUTURE_JOBS: ["kin", "anatomy", "landscape"],
  SPACE_MISSION: ["kin", "kitchen", "sport"], DIPLOMACY: ["anatomy", "kitchen", "clothing"],
  "HEALTH & MEDICINE": ["landscape", "kitchen"], "ART & CULTURE": ["anatomy", "kitchen"],
  "BUSINESS & ECONOMY": ["anatomy", "landscape"], "CRIME & JUSTICE": ["kitchen", "sport"],
  COOKING: ["kin", "sport", "landscape"],
  MUSIC: ["anatomy", "food"], GARDEN: ["kin", "clothing"], SEASIDE: ["kin", "kitchen"],
  CAMPING: ["kin", "anatomy"], TIME: ["clothing", "animals"], WORKSHOP: ["kin", "food"],
};

export const concreteDistractors = Object.values(contrasts).flat();
export function themeDistractors(theme: string): string[] {
  return (byTheme[theme] ?? []).flatMap(key => contrasts[key]);
}
