/**
 * Enigma Scroll - Clean Game Engine
 * 
 * Pure TypeScript implementation of the word-guessing game logic.
 * NO DOM, NO CSS, NO database, NO API calls - just gameplay.
 * 
 * This engine implements:
 * - Wordle-style feedback (correct/present/absent)
 * - Scoring with combos and bonuses
 * - Multiple difficulty levels (4/5/6 letter words)
 * - Session scoring with streaks
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LetterStatus = "correct" | "present" | "absent" | "empty";

export type Cell = {
  letter: string;        // single uppercase letter or ""
  status: LetterStatus; // feedback for this cell
};

export type Row = {
  cells: Cell[];
  isSubmitted: boolean;
};

export type GameConfig = {
  maxAttempts: number;
  wordLength: number;
  basePointsPerWin: number;
  streakBonusMultiplier: number; // e.g. 1.0, 1.5, 2.0... (capped at 2.5)
};

export type GameState = {
  targetWord: string;    // the secret word, uppercase
  rows: Row[];           // grid of attempts
  currentAttemptIndex: number;
  isFinished: boolean;
  isWin: boolean;
  totalScore: number;    // session score
  currentStreak: number; // consecutive wins
  bestStreak: number;    // best streak in session
  wordsFound: number;    // total words found in session
  config: GameConfig;
};

export type GuessResult = {
  isValid: boolean;
  isWin: boolean;
  isGameOver: boolean;
  pointsEarned: number;
  newStreak: number;
  errorMessage?: string;
};

/**
 * Word Lists Configuration
 * Contains target words (for secret words) and valid guesses (for player guesses)
 */
export type WordLists = {
  targetWords: Record<number, string[]>;  // Words that can be selected as secret words
  validGuesses: Record<number, string[]>; // Words that can be used as guesses
};

// ============================================================================
// DEFAULT WORD LISTS (fallback - will be replaced by loaded lists)
// ============================================================================

/**
 * TARGET WORDS: Words that can be selected as the secret word to guess
 * These are common, well-known English words (similar to Wordle's answer list)
 */
const TARGET_WORDS_4: string[] = [
  "ABLE", "ACHE", "ACID", "AGED", "AIDE", "AIMS", "AIRS", "ALSO", "AMID", "ANTS", "ARCH", "AREA", "ARMS", "ARMY", "ARTS", "ATOM",
  "AWAY", "BABY", "BACK", "BAGS", "BALL", "BAND", "BANK", "BARE", "BARK", "BARN", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BEER",
  "BELL", "BELT", "BEST", "BIKE", "BILL", "BIND", "BIRD", "BITE", "BLOW", "BLUE", "BOAT", "BODY", "BONE", "BOOK", "BOOT", "BORN",
  "BOTH", "BOWL", "BOYS", "BULK", "BURN", "BUSY", "BYTE", "CAFE", "CAGE", "CAKE", "CALL", "CALM", "CAME", "CAMP", "CARD", "CARE",
  "CARS", "CASE", "CASH", "CAST", "CATS", "CAVE", "CELL", "CHAT", "CHIP", "CITY", "CLAD", "CLAY", "CLIP", "CLUB", "COAL", "COAT",
  "CODE", "COIN", "COLD", "COME", "COOK", "COOL", "COPY", "CORD", "CORN", "COST", "COZY", "CREW", "CROP", "CROW", "CUBE", "CURE",
  "CUTE", "CUTS", "CYAN", "DARK", "DATA", "DATE", "DAWN", "DAYS", "DEAD", "DEAL", "DEAR", "DEBT", "DECK", "DEEP", "DEER", "DEMO",
  "DESK", "DIAL", "DICE", "DIED", "DIET", "DIME", "DIRT", "DISH", "DOCK", "DOES", "DOGS", "DONE", "DOOR", "DOTS", "DOWN", "DRAW",
  "DREW", "DROP", "DRUG", "DRUM", "DUCK", "DUDE", "DULL", "DUMP", "DUST", "DUTY", "EACH", "EARL", "EARN", "EARS", "EAST", "EASY",
  "EATS", "ECHO", "EDGE", "EDIT", "EGGS", "ELSE", "EMIT", "ENDS", "EPIC", "EVEN", "EVER", "EVIL", "EXAM", "EXIT", "EYES", "FACE",
  "FACT", "FAIL", "FAIR", "FALL", "FAME", "FANS", "FARM", "FAST", "FATE", "FEAR", "FEED", "FEEL", "FEET", "FELL", "FELT", "FILE",
  "FILM", "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIST", "FITS", "FIVE", "FLAG", "FLAT", "FLED", "FLIP", "FLOW", "FOLK", "FOOD",
  "FOOL", "FOOT", "FORD", "FORK", "FORM", "FORT", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "FURY", "GAME", "GANG", "GAPS",
  "GATE", "GAVE", "GEAR", "GEMS", "GETS", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOAT", "GOES", "GOLD", "GOLF", "GONE", "GOOD",
  "GRAB", "GREW", "GREY", "GRID", "GRIN", "GROW", "GUYS", "HACK", "HAIR", "HALF", "HALL", "HAND", "HANG", "HARD", "HARM", "HATE",
  "HAVE", "HEAD", "HEAL", "HEAR", "HEAT", "HEEL", "HELD", "HELL", "HELP", "HERB", "HERE", "HERO", "HIDE", "HIGH", "HILL", "HINT",
  "HIRE", "HITS", "HOLD", "HOLE", "HOLY", "HOME", "HOOD", "HOOK", "HOPE", "HORN", "HOST", "HOUR", "HUGE", "HUNG", "HUNT", "HURT",
  "ICON", "IDEA", "INCH", "INFO", "IRON", "ITEM", "JAIL", "JAZZ", "JOBS", "JOIN", "JOKE", "JUMP", "JUNE", "JURY", "JUST", "KEEN",
  "KEEP", "KEPT", "KEYS", "KICK", "KIDS", "KILL", "KIND", "KING", "KISS", "KITE", "KNEE", "KNEW", "KNOW", "LABS", "LACK", "LADY",
  "LAID", "LAKE", "LAMP", "LAND", "LANE", "LAST", "LATE", "LAWN", "LAWS", "LAZY", "LEAD", "LEAF", "LEAN", "LEAP", "LEFT", "LEGS",
  "LENS", "LESS", "LIED", "LIES", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LIST", "LIVE", "LOAD", "LOAN", "LOCK", "LOGO", "LONG",
  "LOOK", "LOOP", "LORD", "LOSE", "LOSS", "LOST", "LOTS", "LOUD", "LOVE", "LUCK", "LUNG", "MADE", "MAIL", "MAIN", "MAKE", "MALE",
  "MALL", "MANY", "MAPS", "MARK", "MARS", "MASK", "MASS", "MATH", "MEAL", "MEAN", "MEAT", "MEET", "MELT", "MEMO", "MENU", "MESS",
  "MICE", "MILE", "MILK", "MIND", "MINE", "MINT", "MISS", "MODE", "MOLD", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST",
  "NAME", "NAVY", "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE", "NODE", "NONE", "NOON", "NOTE", "NUTS", "OBEY", "ODDS",
  "OILS", "OKAY", "ONCE", "ONLY", "ONTO", "OPEN", "ORAL", "OVAL", "OVEN", "OVER", "PACK", "PAGE", "PAID", "PAIN", "PAIR", "PALM",
  "PARK", "PART", "PASS", "PAST", "PATH", "PAWS", "PAYS", "PEAK", "PICK", "PILE", "PILL", "PINK", "PIPE", "PLAN", "PLAY", "PLOT",
  "PLUG", "PLUS", "POEM", "POET", "POLE", "POLL", "POOL", "POOR", "PORT", "POST", "POUR", "PRAY", "PREP", "PREY", "PULL", "PUMP",
  "PURE", "PUSH", "QUIT", "RACE", "RAIN", "RANG", "RANK", "RARE", "RATE", "RATS", "RAYS", "READ", "REAL", "REAR", "RELY", "RENT",
  "REST", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOF", "ROOM", "ROOT", "ROPE", "ROSE", "ROWS",
  "RUDE", "RULE", "RUNS", "RUSH", "RUST", "SAFE", "SAID", "SAIL", "SAKE", "SALE", "SALT", "SAME", "SAND", "SAVE", "SAYS", "SCAN",
  "SEAL", "SEAT", "SEED", "SEEK", "SEEM", "SEEN", "SELF", "SELL", "SEND", "SENT", "SETS", "SHIP", "SHOE", "SHOP", "SHOT", "SHOW",
  "SHUT", "SICK", "SIDE", "SIGN", "SILK", "SING", "SINK", "SITE", "SIZE", "SKIN", "SKIP", "SLIP", "SLOW", "SNAP", "SNOW", "SOAP",
  "SOFT", "SOIL", "SOLD", "SOLE", "SOME", "SONG", "SOON", "SORT", "SOUL", "SOUP", "SOUR", "SPIN", "SPOT", "STAR", "STAY", "STEM",
  "STEP", "STOP", "SUCH", "SUIT", "SUNG", "SURE", "SWIM", "TAIL", "TAKE", "TALE", "TALK", "TALL", "TANK", "TAPE", "TASK", "TEAM",
  "TEAR", "TECH", "TELL", "TENT", "TEST", "TEXT", "THAN", "THAT", "THEM", "THEN", "THEY", "THIN", "THIS", "THUS", "TIDE", "TIED",
  "TIES", "TIME", "TINY", "TIPS", "TIRE", "TOLD", "TONE", "TOOK", "TOOL", "TOPS", "TORN", "TOUR", "TOWN", "TREE", "TRIP", "TRUE",
  "TUBE", "TUNE", "TURN", "TWIN", "TYPE", "UNIT", "UPON", "USED", "USER", "USES", "VARY", "VAST", "VERY", "VIEW", "WAIT", "WAKE",
  "WALK", "WALL", "WANT", "WARM", "WARN", "WASH", "WAVE", "WAYS", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST", "WHAT",
  "WHEN", "WILD", "WILL", "WIND", "WINE", "WING", "WIRE", "WISE", "WISH", "WITH", "WOOD", "WOOL", "WORD", "WORK", "WORN", "YARD",
  "YEAR", "YOUR", "ZERO", "ZONE"
];

const TARGET_WORDS_5: string[] = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM",
  "ALERT", "ALIEN", "ALIGN", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE",
  "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BAKER",
  "BASES", "BASIC", "BATCH", "BEACH", "BEGAN", "BEGIN", "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLANK", "BLAST",
  "BLIND", "BLOCK", "BLOOD", "BLOOM", "BOARD", "BOAST", "BOBBY", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE", "BREAD",
  "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BURST", "BUYER", "CABLE", "CACHE", "CANDY", "CARGO",
  "CARRY", "CARVE", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHAOS", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD",
  "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLIMB", "CLOCK", "CLOSE", "CLOUD", "CLOWN", "CLUBS", "COACH",
  "COAST", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CRAZY", "CREAM", "CRIME", "CRISP", "CROSS", "CROWD", "CROWN", "CRUDE",
  "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DENSE", "DEPOT", "DEPTH", "DOING", "DOUBT", "DOZEN",
  "DRAFT", "DRAMA", "DRANK", "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT",
  "ELDER", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE",
  "FAULT", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE",
  "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS",
  "GLOBE", "GLORY", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRASS", "GRAVE", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD",
  "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX",
  "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE", "KNIFE", "KNOCK", "KNOWN", "LABEL", "LARGE", "LASER", "LATER",
  "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL", "LOOSE",
  "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL",
  "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVED", "MOVIE", "MUSIC",
  "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER",
  "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIANO", "PICKED", "PIECE", "PILOT", "PITCH",
  "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE",
  "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "READY",
  "REALM", "REBEL", "REFER", "RELAX", "RELAY", "REPLY", "RIDER", "RIDGE", "RIGHT", "RIGID", "RISKY", "RIVER", "ROBOT", "ROGER", "ROMAN",
  "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SAFER", "SALLY", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SETUP", "SEVEN",
  "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIDES",
  "SIGHT", "SILLY", "SIMON", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE",
  "SNAKE", "SNEAK", "SOLID", "SOLVE", "SORRY", "SORTS", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT",
  "SPOKE", "SPORT", "SQUAD", "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE", "STEAM", "STEEL", "STEEP", "STEER", "STICK", "STILL",
  "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET",
  "SWIFT", "SWING", "SWISS", "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TEAMS", "TEETH", "TERRY", "TEXAS", "THANK", "THEFT", "THEIR",
  "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "THUMB", "TIGER", "TIGHT", "TIMES",
  "TIRED", "TITLE", "TODAY", "TOKEN", "TOOLS", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIL", "TRAIN", "TRAIT",
  "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRIES", "TRUCK", "TRULY", "TRUNK", "TRUST", "TRUTH", "TRYING", "TUMOR", "TUNED",
  "TURNS", "TWICE", "TWINS", "TYPED", "ULTRA", "UNCLE", "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE",
  "USERS", "USING", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOCAL", "VOICE", "WASTE", "WATCH", "WATER", "WAVES",
  "WEIRD", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WILDE", "WINDS", "WINES", "WINGS", "WIRED", "WIVES",
  "WOMAN", "WOMEN", "WORDS", "WORKS", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WRITE", "WRONG", "WROTE", "YARDS", "YEAH",
  "YEARS", "YOUNG", "YOURS", "YOUTH"
];

const TARGET_WORDS_6: string[] = [
  "ACCEPT", "ACCESS", "ACCORD", "ACROSS", "ACTION", "ACTIVE", "ACTUAL", "ADVICE", "AFFORD", "AFRAID", "AFRICA", "AGENDA", "AGREED", "ALEXEI",
  "ALMOST", "AMOUNT", "ANCHOR", "ANDREW", "ANIMAL", "ANNUAL", "ANSWER", "ANYONE", "ANYWAY", "APPEAL", "APPEAR", "AROUND", "ARREST", "ARRIVE",
  "ARTIST", "ASPECT", "ASSIST", "ASSUME", "ATTACH", "ATTACK", "ATTEND", "AUTHOR", "AUTUMN", "AVENUE", "BACKED", "BACKUP", "BATTLE", "BEAUTY",
  "BECOME", "BEHALF", "BELIEF", "BELONG", "BERLIN", "BETTER", "BEYOND", "BINARY", "BISHOP", "BOUGHT", "BRANCH", "BREATH", "BRIDGE", "BRIEF",
  "BRIGHT", "BRING", "BROKEN", "BUDGET", "BUTTON", "BUYING", "CAMERA", "CAMPUS", "CANCER", "CANNOT", "CARBON", "CAREER", "CASTLE",
  "CASUAL", "CENTRE", "CHANCE", "CHANGE", "CHARGE", "CHOICE", "CHOOSE", "CHOSEN", "CHURCH", "CIRCLE", "CLIENT", "CLOSED", "CLOSER", "COFFEE",
  "COLUMN", "COMBAT", "COMEDY", "COMING", "COMMIT", "COMMON", "COMPLY", "COPPER", "CORNER", "COTTON", "COUPLE", "COURSE", "COVERS", "CREATE",
  "CREDIT", "CRISIS", "CUSTOM", "DAMAGE", "DANGER", "DEALER", "DEBATE", "DEBRIS", "DECADE", "DECIDE", "DEFEAT", "DEFEND", "DEFINE", "DEGREE",
  "DEMAND", "DEPEND", "DEPLOY", "DEPUTY", "DERIVE", "DESIGN", "DESIRE", "DETAIL", "DETECT", "DEVICE", "DIALOG", "DIFFER", "DINING", "DIRECT",
  "DOLLAR", "DOMAIN", "DOUBLE", "DRIVEN", "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT", "EIGHTH", "EITHER", "ELEVEN",
  "EMERGE", "EMPIRE", "EMPLOY", "ENABLE", "ENERGY", "ENGINE", "ENOUGH", "ENSURE", "ENTIRE", "ENTITY", "EQUITY", "ESCAPE", "ESTATE",
  "ETHNIC", "EUROPE", "EVENTS", "EVERY", "EXCEPT", "EXCUSE", "EXPAND", "EXPECT", "EXPERT", "EXPORT", "EXTEND", "EXTENT", "FABRIC", "FACIAL",
  "FAIRLY", "FALLEN", "FAMILY", "FAMOUS", "FATHER", "FELLOW", "FEMALE", "FINGER", "FINISH", "FISCAL", "FLIGHT", "FOLLOW", "FOOTER", "FOREST",
  "FORGET", "FORMAT", "FORMER", "FOURTH", "FRIDAY", "FRIEND", "FROZEN", "FUTURE", "GADGET", "GARAGE", "GARDEN", "GATHER", "GENDER", "GENTLE",
  "GERMAN", "GLOBAL", "GOLDEN", "GOTTEN", "GROUND", "GROWTH", "GUITAR", "HANDLE", "HAPPEN", "HARDLY", "HEALTH", "HEAVEN", "HEIGHT", "HIDDEN",
  "HOLDER", "HONEST", "HOPING", "HORROR", "IMPACT", "IMPORT", "INCOME", "INDEED", "INFANT", "INFORM", "INJURY", "INSECT", "INSERT", "INSIDE",
  "INTENT", "INVEST", "ISLAND", "ITSELF", "JOINED", "JUNGLE", "JUNIOR", "KILLED", "KILLER", "KNIGHT", "LADIES", "LATEST", "LATTER", "LAUNCH",
  "LAWYER", "LEADER", "LEAGUE", "LEAVES", "LENGTH", "LESSON", "LETTER", "LIGHTS", "LIKELY", "LINEAR", "LIQUID", "LISTEN", "LITTLE", "LIVING",
  "LOCATE", "LOCKED", "LONDON", "LOVELY", "LOVERS", "LOVING", "LUXURY", "MADRID", "MAKING", "MANAGE", "MANNER", "MARBLE", "MARGIN", "MARINE",
  "MARKET", "MASTER", "MATRIX", "MATTER", "MATURE", "MEADOW", "MEMBER", "MEMORY", "MENTAL", "MERGER", "METHOD", "MIDDLE", "MILLER", "MINING",
  "MINUTE", "MIRROR", "MOBILE", "MODERN", "MODIFY", "MODULE", "MOMENT", "MONDAY", "MOTHER", "MOTION", "MOVING", "MURDER", "MUSCLE", "MUSEUM",
  "MUTUAL", "NATION", "NATIVE", "NATURE", "NEARBY", "NEARLY", "NEEDLE", "NEPHEW", "NEURAL", "NEWEST", "NICELY", "NIGHTS", "NOBODY", "NORMAL",
  "NOTICE", "NOTION", "NUMBER", "NURSES", "OBJECT", "OBTAIN", "OFFICE", "ONLINE", "OPTION", "ORANGE", "ORIGIN", "OUTPUT", "OXFORD", "PACKED",
  "PALACE", "PARADE", "PARENT", "PARTLY", "PATENT", "PATROL", "PAYOFF", "PEOPLE", "PERIOD", "PERMIT", "PERSON", "PHRASE", "PICKUP", "PICNIC",
  "PILLOW", "PLACED", "PLANET", "PLAYER", "PLEASE", "PLENTY", "POCKET", "POETRY", "POLICE", "POLICY", "POLISH", "PORTAL", "POSTER", "POTATO",
  "POWDER", "PRAISE", "PRAYER", "PREFER", "PRETTY", "PRIEST", "PRINCE", "PRISON", "PROFIT", "PROPER", "PROVEN", "PUBLIC", "PURPLE", "PURSUE",
  "PUZZLE", "RABBIT", "RACIAL", "RADIUS", "RANDOM", "RARELY", "RATHER", "RATING", "READER", "REALLY", "REASON", "REBEL", "RECALL", "RECENT",
  "RECORD", "REDUCE", "REFORM", "REFUSE", "REGION", "RELATE", "RELIEF", "REMAIN", "REMOTE", "REMOVE", "REPAIR", "REPEAT", "REPLY", "REPORT",
  "RESCUE", "RESIST", "RESORT", "RESULT", "RETAIL", "RETIRE", "RETURN", "REVEAL", "REVIEW", "REVOLT", "REWARD", "RIDING", "RISING", "ROBUST",
  "ROCKET", "ROTATE", "ROUTER", "RUBBER", "RULING", "RUNNER", "SAFETY", "SALARY", "SAMPLE", "SAVING", "SAYING", "SCHEME", "SCHOOL", "SCREEN",
  "SCRIPT", "SEARCH", "SEASON", "SECOND", "SECRET", "SECTOR", "SECURE", "SELECT", "SENIOR", "SERIAL", "SERIES", "SERVER", "SETTLE", "SEVERE",
  "SHADOW", "SHAPED", "SHARED", "SHIELD", "SHIFT", "SHOULD", "SHOWED", "SHOWER", "SHRIMP", "SIGNAL", "SIMPLE", "SINGLE", "SISTER", "SKETCH",
  "SLIGHT", "SMOOTH", "SOCCER", "SOCIAL", "SOCKET", "SODIUM", "SOONER", "SOURCE", "SOVIET", "SPEAKS", "SPIRIT", "SPLIT", "SPREAD", "SPRING",
  "SQUARE", "STABLE", "STANCE", "STATUE", "STATUS", "STAYED", "STEADY", "STOLEN", "STRAIN", "STRAND", "STREAM", "STREET", "STRESS", "STRICT",
  "STRIKE", "STRING", "STROKE", "STRONG", "STRUCK", "STUDIO", "SUBMIT", "SUDDEN", "SUFFER", "SUMMIT", "SUNDAY", "SUNSET", "SUPPLY", "SURELY",
  "SURVEY", "SWITCH", "SYMBOL", "SYNTAX", "SYSTEM", "TACKLE", "TAKING", "TALENT", "TARGET", "TAUGHT", "TEMPLE", "TENDER", "TENNIS", "THEORY",
  "THIRTY", "THREAD", "THREAT", "THROWN", "THRUST", "TICKET", "TIMBER", "TISSUE", "TOGGLE", "TOMATO", "TONGUE", "TOPICS", "TOWARD", "TRADER",
  "TRAVEL", "TREATY", "TRYING", "TUNNEL", "TWELVE", "TWENTY", "UNABLE", "UNFAIR", "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UPDATE", "UPLOAD",
  "UPWARD", "URGENT", "USEFUL", "VALLEY", "VENDOR", "VERSUS", "VICTIM", "VIEWER", "VIRGIN", "VIRTUE", "VISION", "VISUAL", "VOLUME", "WALKER",
  "WALLET", "WANDER", "WEAPON", "WEEKLY", "WEIGHT", "WINDOW", "WINTER", "WITHIN", "WIZARD", "WONDER", "WOODEN", "WORKER", "WORTHY", "WRITER",
  "YELLOW", "YOGURT"
];

/**
 * VALID GUESSES: Words that can be used as guesses (larger list)
 * For now, same as TARGET_WORDS. In the future, this can be expanded
 * to include more words (like Wordle's ~13,000 valid guesses vs ~2,300 targets)
 */
// Default fallback lists (small, for testing/fallback)
const DEFAULT_TARGET_WORDS: Record<number, string[]> = {
  4: TARGET_WORDS_4,
  5: TARGET_WORDS_5,
  6: TARGET_WORDS_6
};

const DEFAULT_VALID_GUESSES: Record<number, string[]> = {
  4: TARGET_WORDS_4,
  5: TARGET_WORDS_5,
  6: TARGET_WORDS_6
};

// Global word lists (injected from outside)
let globalWordLists: WordLists | null = null;

/**
 * Initialize word lists (call this before using the engine)
 */
export function initializeWordLists(wordLists: WordLists): void {
  globalWordLists = wordLists;
}

/**
 * Get current word lists (fallback to defaults if not initialized)
 */
function getWordLists(): WordLists {
  if (globalWordLists) {
    return globalWordLists;
  }
  return {
    targetWords: DEFAULT_TARGET_WORDS,
    validGuesses: DEFAULT_VALID_GUESSES
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

function isValidWord(word: string, wordLength: number): boolean {
  const normalized = normalizeWord(word);
  
  if (normalized.length !== wordLength) {
    return false;
  }
  
  if (!/^[A-Z]+$/.test(normalized)) {
    return false;
  }
  
  const wordLists = getWordLists();
  const validGuesses = wordLists.validGuesses[wordLength];
  return validGuesses ? validGuesses.includes(normalized) : false;
}

function getRandomWord(wordLength: number, excludeWords: Set<string> = new Set()): string {
  const wordLists = getWordLists();
  const targetWords = wordLists.targetWords[wordLength];
  
  if (!targetWords || targetWords.length === 0) {
    throw new Error(`No words available for length ${wordLength}`);
  }
  
  const availableWords = targetWords.filter(word => !excludeWords.has(word));
  
  if (availableWords.length === 0) {
    const randomIndex = Math.floor(Math.random() * targetWords.length);
    return targetWords[randomIndex];
  }
  
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}

function calculateFeedback(guess: string, targetWord: string): LetterStatus[] {
  const normalizedGuess = normalizeWord(guess);
  const normalizedTarget = normalizeWord(targetWord);
  
  if (normalizedGuess.length !== normalizedTarget.length) {
    throw new Error('Guess and target must have same length');
  }
  
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  const feedback: LetterStatus[] = new Array(normalizedGuess.length).fill('absent');
  
  const letterCounts: Record<string, number> = {};
  targetLetters.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });
  
  // First pass: mark exact matches
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      feedback[i] = 'correct';
      letterCounts[guessLetters[i]]--;
    }
  }
  
  // Second pass: mark letters that exist but in wrong position
  for (let i = 0; i < guessLetters.length; i++) {
    if (feedback[i] === 'absent') {
      const letter = guessLetters[i];
      if (letterCounts[letter] > 0) {
        feedback[i] = 'present';
        letterCounts[letter]--;
      }
    }
  }
  
  return feedback;
}

function createEmptyRow(wordLength: number): Row {
  return {
    cells: Array(wordLength).fill(null).map(() => ({
      letter: "",
      status: "empty"
    })),
    isSubmitted: false
  };
}

function createInitialGrid(maxAttempts: number, wordLength: number): Row[] {
  return Array(maxAttempts).fill(null).map(() => createEmptyRow(wordLength));
}

function calculateScore(
  config: GameConfig,
  attemptsUsed: number,
  timeRemaining: number,
  currentStreak: number
): number {
  const basePoints = config.basePointsPerWin;
  const attemptBonus = Math.max(0, (config.maxAttempts - attemptsUsed) * 2);
  const timeBonus = Math.min(Math.floor(timeRemaining / 6), 15);
  const rawScore = basePoints + attemptBonus + timeBonus;
  const streakMultiplier = 1 + Math.min(currentStreak - 1, 1.5) * 0.1;
  return Math.floor(rawScore * streakMultiplier);
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

export const DEFAULT_CONFIGS: Record<number, GameConfig> = {
  4: {
    maxAttempts: 5,
    wordLength: 4,
    basePointsPerWin: 10,
    streakBonusMultiplier: 2.5
  },
  5: {
    maxAttempts: 6,
    wordLength: 5,
    basePointsPerWin: 15,
    streakBonusMultiplier: 2.5
  },
  6: {
    maxAttempts: 7,
    wordLength: 6,
    basePointsPerWin: 20,
    streakBonusMultiplier: 2.5
  }
};

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

export function createInitialGameState(
  targetWord: string,
  config?: Partial<GameConfig>
): GameState {
  const normalizedTarget = normalizeWord(targetWord);
  const wordLength = normalizedTarget.length;
  
  if (!isValidWord(normalizedTarget, wordLength)) {
    throw new Error(`Word "${normalizedTarget}" is not in the word list for length ${wordLength}`);
  }
  
  const defaultConfig = DEFAULT_CONFIGS[wordLength];
  if (!defaultConfig) {
    throw new Error(`No default config for word length ${wordLength}`);
  }
  
  const finalConfig: GameConfig = {
    ...defaultConfig,
    ...config,
    wordLength
  };
  
  return {
    targetWord: normalizedTarget,
    rows: createInitialGrid(finalConfig.maxAttempts, finalConfig.wordLength),
    currentAttemptIndex: 0,
    isFinished: false,
    isWin: false,
    totalScore: 0,
    currentStreak: 1,
    bestStreak: 1,
    wordsFound: 0,
    config: finalConfig
  };
}

export function createRandomGameState(
  wordLength: 4 | 5 | 6,
  config?: Partial<GameConfig>,
  excludeWords: Set<string> = new Set()
): GameState {
  const targetWord = getRandomWord(wordLength, excludeWords);
  return createInitialGameState(targetWord, config);
}

export function submitGuess(
  state: GameState,
  guess: string,
  timeRemaining: number = 0
): { state: GameState; result: GuessResult } {
  if (state.isFinished) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: true,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "Game is already finished"
      }
    };
  }
  
  const normalizedGuess = normalizeWord(guess);
  
  if (normalizedGuess.length !== state.config.wordLength) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: false,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: `Guess must be ${state.config.wordLength} letters long`
      }
    };
  }
  
  if (!isValidWord(normalizedGuess, state.config.wordLength)) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: false,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "Word not found in dictionary"
      }
    };
  }
  
  if (state.currentAttemptIndex >= state.config.maxAttempts) {
    return {
      state,
      result: {
        isValid: false,
        isWin: false,
        isGameOver: true,
        pointsEarned: 0,
        newStreak: state.currentStreak,
        errorMessage: "No attempts remaining"
      }
    };
  }
  
  const feedback = calculateFeedback(normalizedGuess, state.targetWord);
  const isWin = normalizedGuess === state.targetWord;
  const attemptsUsed = state.currentAttemptIndex + 1;
  
  const cells: Cell[] = normalizedGuess.split('').map((letter, index) => ({
    letter,
    status: feedback[index]
  }));
  
  const updatedRows = [...state.rows];
  updatedRows[state.currentAttemptIndex] = {
    cells,
    isSubmitted: true
  };
  
  let pointsEarned = 0;
  let newStreak = state.currentStreak;
  let newBestStreak = state.bestStreak;
  
  if (isWin) {
    pointsEarned = calculateScore(
      state.config,
      attemptsUsed,
      timeRemaining,
      state.currentStreak
    );
    newStreak = state.currentStreak + 1;
    newBestStreak = Math.max(state.bestStreak, newStreak);
  } else if (attemptsUsed >= state.config.maxAttempts) {
    newStreak = 1;
  }
  
  const isGameOver = isWin || (attemptsUsed >= state.config.maxAttempts);
  
  const newState: GameState = {
    ...state,
    rows: updatedRows,
    currentAttemptIndex: state.currentAttemptIndex + 1,
    isFinished: isGameOver,
    isWin: isWin,
    totalScore: state.totalScore + pointsEarned,
    currentStreak: newStreak,
    bestStreak: newBestStreak,
    wordsFound: isWin ? state.wordsFound + 1 : state.wordsFound
  };
  
  return {
    state: newState,
    result: {
      isValid: true,
      isWin: isWin,
      isGameOver: isGameOver,
      pointsEarned: pointsEarned,
      newStreak: newStreak
    }
  };
}

export function resetForNewWord(
  state: GameState,
  newTargetWord: string
): GameState {
  const normalizedTarget = normalizeWord(newTargetWord);
  const wordLength = normalizedTarget.length;
  
  if (!isValidWord(normalizedTarget, wordLength)) {
    throw new Error(`Word "${normalizedTarget}" is not in the word list for length ${wordLength}`);
  }
  
  const config: GameConfig = {
    ...state.config,
    wordLength
  };
  
  return {
    ...state,
    targetWord: normalizedTarget,
    rows: createInitialGrid(config.maxAttempts, config.wordLength),
    currentAttemptIndex: 0,
    isFinished: false,
    isWin: false,
    config
  };
}

export function resetForNewRandomWord(
  state: GameState,
  excludeWords: Set<string> = new Set()
): GameState {
  const newTargetWord = getRandomWord(state.config.wordLength, excludeWords);
  return resetForNewWord(state, newTargetWord);
}

export function addLetterToCurrentGuess(
  state: GameState,
  letter: string
): GameState {
  if (state.isFinished) {
    return state;
  }
  
  const normalizedLetter = normalizeWord(letter);
  
  if (normalizedLetter.length !== 1 || !/^[A-Z]$/.test(normalizedLetter)) {
    return state;
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  if (currentRow.isSubmitted) {
    return state;
  }
  
  const emptyIndex = currentRow.cells.findIndex(cell => cell.letter === "");
  if (emptyIndex === -1) {
    return state;
  }
  
  const updatedRows = [...state.rows];
  const updatedCells = [...currentRow.cells];
  updatedCells[emptyIndex] = {
    letter: normalizedLetter,
    status: "empty"
  };
  
  updatedRows[state.currentAttemptIndex] = {
    ...currentRow,
    cells: updatedCells
  };
  
  return {
    ...state,
    rows: updatedRows
  };
}

export function removeLetterFromCurrentGuess(state: GameState): GameState {
  if (state.isFinished) {
    return state;
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  if (currentRow.isSubmitted) {
    return state;
  }
  
  let lastIndex = -1;
  for (let i = currentRow.cells.length - 1; i >= 0; i--) {
    if (currentRow.cells[i].letter !== "") {
      lastIndex = i;
      break;
    }
  }
  
  if (lastIndex === -1) {
    return state;
  }
  
  const updatedRows = [...state.rows];
  const updatedCells = [...currentRow.cells];
  updatedCells[lastIndex] = {
    letter: "",
    status: "empty"
  };
  
  updatedRows[state.currentAttemptIndex] = {
    ...currentRow,
    cells: updatedCells
  };
  
  return {
    ...state,
    rows: updatedRows
  };
}

export function getCurrentGuess(state: GameState): string {
  if (state.isFinished || state.currentAttemptIndex >= state.rows.length) {
    return "";
  }
  
  const currentRow = state.rows[state.currentAttemptIndex];
  return currentRow.cells.map(cell => cell.letter).join("");
}

export function validateWord(word: string, wordLength: number): boolean {
  return isValidWord(word, wordLength);
}

