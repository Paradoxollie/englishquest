/**
 * Script to automatically generate Wordfall dictionary with English-French translations
 * 
 * This script:
 * 1. Downloads common English words (from google-10000)
 * 2. Matches them with French translations from free dictionary sources
 * 3. Generates wordfall-words.json with words and translations
 * 
 * Sources used (all public domain / open source):
 * - google-10000-english (MIT license) - Common English words
 * - FreeDict / Wiktionary data - French translations
 * 
 * Run with: node scripts/update-wordfall-dictionary.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const WORDS_DIR = path.join(__dirname, '../lib/games/words');
const OUTPUT_FILE = path.join(WORDS_DIR, 'wordfall-words.json');
const INAPPROPRIATE_WORDS_FILE = path.join(WORDS_DIR, 'inappropriate-words.txt');

/**
 * Free dictionary sources for English-French translations
 * All sources are public domain / open source
 */
const DICTIONARY_SOURCES = [
  // GitHub: FreeDict project - English-French dictionary (TEI format)
  // This is the main source - contains thousands of translations
  {
    name: 'freedict-eng-fra',
    url: 'https://raw.githubusercontent.com/freedict/fd-dictionaries/master/eng-fra/eng-fra.tei',
    description: 'FreeDict English-French dictionary (TEI format)',
    format: 'tei',
    optional: false // Main source
  },
  // Alternative FreeDict format (if available)
  {
    name: 'freedict-alt',
    url: 'https://raw.githubusercontent.com/freedict/fd-dictionaries/master/fra-eng/fra-eng.tei',
    description: 'FreeDict French-English dictionary (reverse, TEI format)',
    format: 'tei-reverse', // Reverse lookup
    optional: true
  }
];

/**
 * Common English words source (for word selection)
 */
const COMMON_WORDS_SOURCE = {
  name: 'google-10000',
  url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-medium.txt',
  description: 'Top 10,000 English words (common words, no profanity)'
};

/**
 * Download text from URL
 */
function downloadText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP error! status: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Load inappropriate words from file
 */
async function loadInappropriateWords() {
  try {
    const content = await fs.readFile(INAPPROPRIATE_WORDS_FILE, 'utf-8');
    const words = content
      .split('\n')
      .map(line => line.trim().toUpperCase())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .filter(line => /^[A-Z]+$/.test(line));
    return new Set(words);
  } catch (error) {
    console.warn('Could not load inappropriate words file, using empty set');
    return new Set();
  }
}

/**
 * Parse TEI dictionary format (FreeDict)
 */
function parseTEIDictionary(teiContent) {
  const translations = {};
  
  // Simple TEI parser - extract <entry> elements
  // FreeDict TEI format can be large, so we process in chunks
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g;
  let match;
  let count = 0;
  const maxEntries = 100000; // Increased limit for large dictionaries
  
  while ((match = entryRegex.exec(teiContent)) !== null && count < maxEntries) {
    count++;
    const entryContent = match[1];
    
    // Extract English word (form/orth) - can appear multiple times
    const orthMatches = entryContent.matchAll(/<orth[^>]*>([^<]+)<\/orth>/gi);
    let englishWord = null;
    
    for (const orthMatch of orthMatches) {
      let word = orthMatch[1].trim().toUpperCase();
      // Remove accents and special chars, keep only letters
      word = word.replace(/[^A-Z]/g, '');
      
      // Use first valid word of correct length
      if (word.length >= 4 && word.length <= 6 && /^[A-Z]+$/.test(word)) {
        englishWord = word;
        break;
      }
    }
    
    if (!englishWord) continue;
    
    // Extract French translation - can be in various formats
    let frenchTranslation = null;
    
    // Try different patterns for translations (improved to catch more)
    // FreeDict TEI format: <sense><cit><quote>translation</quote></cit></sense>
    const transPatterns = [
      // Most common in FreeDict: <cit><quote>translation</quote></cit> within <sense>
      /<sense[^>]*>[\s\S]*?<cit[^>]*>[\s\S]*?<quote[^>]*>([^<]+)<\/quote>/i,
      // Direct translation tags
      /<trans[^>]*>([^<]+)<\/trans>/i,
      /<tr[^>]*>([^<]+)<\/tr>/i,
      // Quote tags (can contain translations)
      /<quote[^>]*>([^<]+)<\/quote>/i,
      // Definition as translation
      /<def[^>]*>([^<]+)<\/def>/i,
      // Any text in <cit> tags
      /<cit[^>]*>([^<]+)<\/cit>/i
    ];
    
    for (const pattern of transPatterns) {
      const transMatch = entryContent.match(pattern);
      if (transMatch) {
        let translation = transMatch[1].trim();
        // Clean up translation more thoroughly
        translation = translation.replace(/<[^>]+>/g, ''); // Remove HTML tags
        translation = translation.replace(/&[a-z]+;/gi, ''); // Remove HTML entities like &amp;
        translation = translation.replace(/&[#\d]+;/g, ''); // Remove numeric entities like &#123;
        // Take first translation if multiple (split by common separators)
        translation = translation.split(/[,;|]/)[0].trim();
        
        // Validate translation
        if (translation && 
            translation.length > 0 && 
            translation.length < 50 &&
            !translation.match(/^[0-9\s\-]+$/) && // Not just numbers or dashes
            !translation.includes('<') && // No remaining HTML
            !translation.includes('&') && // No remaining entities
            !translation.match(/^[A-Z\s]+$/) || translation.length < 20) { // Not all caps (likely not a translation)
          frenchTranslation = translation;
          break;
        }
      }
    }
    
    if (frenchTranslation) {
      // Only add if we don't already have this word (keep first translation found)
      if (!translations[englishWord]) {
        translations[englishWord] = frenchTranslation;
      }
    }
  }
  
  console.log(`    Parsed ${count} entries, extracted ${Object.keys(translations).length} unique translations`);
  
  return translations;
}

/**
 * Parse JSON dictionary format
 */
function parseJSONDictionary(jsonContent) {
  const translations = {};
  try {
    const data = JSON.parse(jsonContent);
    
    // Handle different JSON structures
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.word && item.translations) {
          let word = String(item.word).toUpperCase().trim();
          word = word.replace(/[^A-Z]/g, ''); // Remove non-letters
          
          if (word.length >= 4 && word.length <= 6 && /^[A-Z]+$/.test(word)) {
            let translation = '';
            if (Array.isArray(item.translations)) {
              translation = item.translations[0];
            } else if (typeof item.translations === 'string') {
              translation = item.translations;
            } else if (item.translations.fr) {
              translation = item.translations.fr;
            }
            
            if (translation && typeof translation === 'string' && translation.trim().length > 0) {
              translations[word] = translation.trim().split(/[,;]/)[0].trim(); // Take first translation
            }
          }
        }
      }
    } else if (typeof data === 'object') {
      // Direct word -> translation mapping
      for (const [word, translation] of Object.entries(data)) {
        let upperWord = String(word).toUpperCase().trim();
        upperWord = upperWord.replace(/[^A-Z]/g, ''); // Remove non-letters
        
        if (upperWord.length >= 4 && upperWord.length <= 6 && /^[A-Z]+$/.test(upperWord)) {
          let trans = '';
          if (typeof translation === 'string') {
            trans = translation;
          } else if (translation && typeof translation === 'object' && translation.fr) {
            trans = translation.fr;
          }
          
          if (trans && trans.trim().length > 0 && trans.trim().length < 50) {
            translations[upperWord] = trans.trim().split(/[,;]/)[0].trim();
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse JSON dictionary:', error.message);
  }
  
  return translations;
}

/**
 * Download and parse dictionary from sources
 */
async function downloadDictionary() {
  const translations = {};
  const inappropriateWords = await loadInappropriateWords();
  
  console.log('Downloading dictionary translations from free sources...\n');
  
  // Start with fallback dictionary
  const fallback = createFallbackDictionary();
  Object.assign(translations, fallback);
  console.log(`  ✓ Loaded ${Object.keys(fallback).length} translations from fallback dictionary`);
  
  // Download from online sources
  for (const source of DICTIONARY_SOURCES) {
    try {
      console.log(`Downloading from ${source.name}...`);
      const content = await downloadText(source.url);
      let newTranslations = {};
      
      if (source.format === 'tei') {
        newTranslations = parseTEIDictionary(content);
      } else if (source.format === 'tei-reverse') {
        // For reverse dictionaries (French->English), we need to invert
        const reverseTranslations = parseTEIDictionary(content);
        // Invert: French word -> English word becomes English word -> French word
        // But we need to be careful - we want English->French for our use case
        // Actually, for fra-eng, we'd need to parse differently or skip for now
        console.log(`  ⚠ Reverse dictionary format not yet fully supported, skipping...`);
        newTranslations = {};
      } else if (source.format === 'json') {
        newTranslations = parseJSONDictionary(content);
      }
      
      // Filter inappropriate words
      const filtered = {};
      for (const [word, translation] of Object.entries(newTranslations)) {
        if (!inappropriateWords.has(word)) {
          filtered[word] = translation;
        }
      }
      
      // Merge translations (later sources override earlier ones)
      Object.assign(translations, filtered);
      console.log(`  ✓ Added ${Object.keys(filtered).length} translations from ${source.name}`);
    } catch (error) {
      if (source.optional) {
        console.warn(`  ⚠ Skipped optional source ${source.name}:`, error.message);
      } else {
        console.error(`  ✗ Failed to download from ${source.name}:`, error.message);
      }
    }
  }
  
  return translations;
}

/**
 * Download common English words
 */
async function downloadCommonWords() {
  const inappropriateWords = await loadInappropriateWords();
  
  console.log('\nDownloading common English words...');
  try {
    const text = await downloadText(COMMON_WORDS_SOURCE.url);
    const words = text
      .split('\n')
      .map(line => line.trim().toUpperCase())
      .filter(word => word.length >= 4 && word.length <= 6)
      .filter(word => /^[A-Z]+$/.test(word))
      .filter(word => !inappropriateWords.has(word));
    
    // Remove duplicates and sort
    const uniqueWords = Array.from(new Set(words)).sort();
    
    console.log(`  ✓ Found ${uniqueWords.length} common words`);
    return uniqueWords;
  } catch (error) {
    console.error(`  ✗ Failed to download common words:`, error.message);
    return [];
  }
}

/**
 * Create a simple fallback dictionary for common words
 * This is a basic dictionary that can be extended
 */
function createFallbackDictionary() {
  // Basic common words with translations
  // This can be extended manually or from other sources
  return {

  "I": "je",
"YOU": "tu",
"HE": "il",
"SHE": "elle",
"IT": "ça",
"WE": "nous",
"THEY": "ils",
"ME": "moi",
"HIM": "lui",
"HER": "elle",
"US": "nous",
"THEM": "eux",

"MY": "mon",
"YOUR": "ton",
"HIS": "son",
"ITS": "son",
"OUR": "notre",
"THEIR": "leur",

"THIS": "ceci",
"THAT": "cela",
"THESE": "ceux",
"THOSE": "ceux",

"BE": "être",
"HAVE": "avoir",
"DO": "faire",
"GO": "aller",
"COME": "venir",
"GET": "avoir",
"MAKE": "faire",
"TAKE": "prendre",
"GIVE": "donner",
"PUT": "mettre",
"LEAVE": "partir",
"WANT": "vouloir",
"LIKE": "aimer",
"LOVE": "adorer",
"NEED": "besoin",
"CAN": "pouvoir",
"MUST": "devoir",
"SAY": "dire",
"TELL": "dire",
"ASK": "demander",
"THINK": "penser",
"KNOW": "savoir",
"UNDERSTAND": "comprendre",
"REMEMBER": "retenir",
"FORGET": "oublier",
"SEE": "voir",
"LOOK": "regarder",
"WATCH": "regarder",
"HEAR": "entendre",
"LISTEN": "écouter",
"SPEAK": "parler",
"TALK": "parler",
"READ": "lire",
"WRITE": "écrire",
"STUDY": "étudier",
"LEARN": "apprendre",
"PLAY": "jouer",
"WORK": "travailler",
"SLEEP": "dormir",
"EAT": "manger",
"DRINK": "boire",
"WALK": "marcher",
"RUN": "courir",
"LIVE": "vivre",
"OPEN": "ouvrir",
"CLOSE": "fermer",
"START": "commencer",
"FINISH": "finir",
"HELP": "aider",
"USE": "utiliser",
"TRY": "essayer",
"WAIT": "attendre",

"TIME": "temps",
"DAY": "jour",
"WEEK": "semaine",
"MONTH": "mois",
"YEAR": "année",
"MORNING": "matin",
"EVENING": "soir",
"NIGHT": "nuit",

"MAN": "homme",
"WOMAN": "femme",
"CHILD": "enfant",
"FRIEND": "ami",
"FAMILY": "famille",
"MOTHER": "mère",
"FATHER": "père",
"SISTER": "soeur",
"BROTHER": "frère",

"SCHOOL": "école",
"CLASS": "classe",
"STUDENT": "élève",
"TEACHER": "prof",

"HOME": "maison",
"HOUSE": "maison",
"CITY": "ville",
"TOWN": "ville",
"STREET": "rue",
"SHOP": "magasin",
"PARK": "parc",

"CAR": "voiture",
"BUS": "bus",
"TRAIN": "train",
"BIKE": "vélo",

"WATER": "eau",
"FOOD": "repas",
"MONEY": "argent",
"PHONE": "téléphone",
"COMPUTER": "ordinateur",
"GAME": "jeu",
"MUSIC": "musique",
"FILM": "film",
"BOOK": "livre",
"WORLD": "monde",
"THING": "chose",
"PLACE": "lieu",

"GOOD": "bon",
"BAD": "mauvais",
"BIG": "grand",
"SMALL": "petit",
"LONG": "long",
"SHORT": "court",
"NEW": "nouveau",
"OLD": "vieux",
"YOUNG": "jeune",
"EASY": "facile",
"HARD": "dur",
"IMPORTANT": "important",
"INTERESTING": "intéressant",
"BORING": "ennuyeux",
"HAPPY": "heureux",
"SAD": "triste",
"TIRED": "fatigué",
"HUNGRY": "affamé",
"THIRSTY": "assoiffé",
"BUSY": "occupé",
"FREE": "libre",
"RIGHT": "juste",
"WRONG": "faux",
"HOT": "chaud",
"COLD": "froid",
"EARLY": "tôt",
"LATE": "tard",
"NICE": "sympa",

"VERY": "très",
"ALSO": "aussi",
"ONLY": "seulement",

"ALWAYS": "toujours",
"OFTEN": "souvent",
"SOMETIMES": "parfois",
"NEVER": "jamais",

"NOW": "maintenant",
"TODAY": "aujourd'hui",
"TOMORROW": "demain",
"YESTERDAY": "hier",

"HERE": "ici",
"THERE": "là",

"IN": "dans",
"ON": "sur",
"AT": "à",
"UNDER": "sous",
"OVER": "dessus",
"BETWEEN": "entre",
"BEHIND": "derrière",
"NEAR": "près",
"FAR": "loin",

"BEFORE": "avant",
"AFTER": "après",

"AND": "et",
"BUT": "mais",
"OR": "ou",
"BECAUSE": "car",
"SO": "donc",
"THEN": "puis",

"WHAT": "quoi",
"WHO": "qui",
"WHERE": "où",
"WHEN": "quand",
"WHY": "pourquoi",
"HOW": "comment",

"YES": "oui",
"NO": "non",
"THANKS": "merci",
"SORRY": "pardon",

"SOMEONE": "quelqu'un",
"SOMETHING": "quelque chose",
"ANYONE": "quelqu'un",
"ANYTHING": "quelque chose",
"NO ONE": "personne",
"NOTHING": "rien",

"ALREADY": "déjà",
"ALMOST": "presque",
"STILL": "encore",
"SOON": "bientôt",
"LATER": "plus tard",
"RECENTLY": "récemment",
"QUICKLY": "vite",
"SLOWLY": "lentement",
"CAREFULLY": "prudemment",
"LOUDLY": "fort",
"QUIETLY": "doucement",

"MAYBE": "peut-être",
"PERHAPS": "peut-être",
"PROBABLY": "probablement",
"REALLY": "vraiment",
"QUITE": "plutôt",
"ENOUGH": "assez",
"TOO MUCH": "trop",
"TOO MANY": "trop",

"HOPE": "espérer",
"HATE": "détester",
"ENJOY": "apprécier",
"PREFER": "préférer",
"CHOOSE": "choisir",
"DECIDE": "décider",
"PLAN": "prévoir",
"INVITE": "inviter",
"VISIT": "visiter",
"TRAVEL": "voyager",
"SPEND": "dépenser",
"PAY": "payer",
"SAVE": "économiser",
"CLEAN": "nettoyer",
"COOK": "cuisiner",
"SMILE": "sourire",
"CRY": "pleurer",
"SHOUT": "crier",
"ARRIVE": "arriver",
"MISS": "rater",
"IMAGINE": "imaginer",
"DESCRIBE": "décrire",
"EXPLAIN": "expliquer",
"COMPARE": "comparer",
"IMPROVE": "améliorer",
"PRACTISE": "pratiquer",
"GUESS": "deviner",
"AGREE": "accepter",
"DISAGREE": "refuser",
"BORROW": "emprunter",
"LEND": "prêter",
"JOIN": "rejoindre",
"ORGANISE": "organiser",
"SHARE": "partager",
"FOLLOW": "suivre",

"FUTURE": "avenir",
"PAST": "passé",
"HOLIDAY": "vacances",
"TRIP": "voyage",
"PROJECT": "projet",
"SUBJECT": "matière",
"TOPIC": "thème",
"DETAIL": "détail",
"PROBLEM": "problème",
"SOLUTION": "solution",
"EXAMPLE": "exemple",
"QUESTION": "question",
"ANSWER": "réponse",
"IDEA": "idée",
"CHOICE": "choix",
"REASON": "raison",
"OPINION": "avis",
"DIFFERENCE": "différence",
"SAME": "identique",
"RULE": "règle",
"LEVEL": "niveau",
"MARK": "note",

"HEALTH": "santé",
"HOSPITAL": "hôpital",
"DOCTOR": "médecin",
"PATIENT": "patient",

"AFRAID": "peureux",
"WORRIED": "inquiet",
"EXCITED": "excité",
"UNHAPPY": "triste",
"HEALTHY": "sain",
"NOISY": "bruyant",
"QUIET": "calme",
"FUNNY": "drôle",
"SERIOUS": "sérieux",
"STRANGE": "étrange",
"MODERN": "moderne",
"TRADITIONAL": "ancien",
"LOCAL": "local",
"INTERNATIONAL": "mondial",
"LUCKY": "chanceux",
"UNLUCKY": "malchanceux",

"BETTER": "meilleur",
"WORSE": "pire",
"BEST": "meilleur",
"WORST": "pire",
"MORE": "plus",
"LESS": "moins",

"OF COURSE": "bien sûr",
"IN GENERAL": "en général",
"FOR EXAMPLE": "par exemple",
"FOR INSTANCE": "par exemple",
"IN FACT": "en fait",
"IN THE END": "au final",
"AT FIRST": "au début",
"AFTER THAT": "après cela",

"NEXT WEEK": "semaine prochaine",
"LAST WEEK": "semaine dernière",
"NEXT YEAR": "année prochaine",
"LAST YEAR": "année dernière",

"LOOK FOR": "chercher",
"LOOK AFTER": "garder",
"LOOK LIKE": "ressembler",
"WAIT FOR": "attendre",
"GET UP": "se lever",
"SIT DOWN": "s'asseoir",
"TURN ON": "allumer",
"TURN OFF": "éteindre",
"PUT ON": "enfiler",
"TAKE OFF": "retirer",
"FIND OUT": "découvrir",
"WAKE UP": "réveiller",

"ON HOLIDAY": "en vacances",
"ON TIME": "à l'heure",
"IN TIME": "à temps",
"ON FOOT": "à pied",
"BY CAR": "en voiture",
"BY TRAIN": "en train",
"BY BUS": "en bus",
"BY BIKE": "à vélo",

"NOT YET": "pas encore",
"NOT REALLY": "pas vraiment",
"NOT AT ALL": "pas du tout",


"ARGUMENT": "argument",
"REASON": "raison",
"RESULT": "résultat",
"EFFECT": "effet",
"CAUSE": "cause",
"ADVANTAGE": "avantage",
"DISADVANTAGE": "inconvénient",
"BENEFIT": "bénéfice",
"RISK": "risque",
"CHOICE": "choix",
"OPTION": "option",
"OPPORTUNITY": "chance",
"SOLUTION": "solution",
"CONSEQUENCE": "conséquence",
"SIMILARITY": "ressemblance",
"RELATIONSHIP": "relation",
"CONNECTION": "lien",
"INFLUENCE": "influence",
"IMPACT": "impact",
"DEVELOPMENT": "développement",
"PROGRESS": "progrès",
"PURPOSE": "but",
"GOAL": "objectif",
"CHALLENGE": "défi",
"ISSUE": "problème",
"TOPIC": "sujet",
"SUBJECT": "sujet",
"SITUATION": "situation",
"CONTEXT": "contexte",
"CONDITION": "condition",
"LIMIT": "limite",
"DETAIL": "détail",
"EXAMPLE": "exemple",
"OPINION": "avis",

"ENVIRONMENT": "environnement",
"EDUCATION": "éducation",
"FREEDOM": "liberté",
"EQUALITY": "égalité",
"JUSTICE": "justice",
"RIGHT": "droit",
"RESPONSIBILITY": "devoir",
"BEHAVIOUR": "comportement",
"ATTITUDE": "attitude",
"COMMUNITY": "communauté",
"SOCIETY": "société",
"CULTURE": "culture",
"TRADITION": "tradition",
"TECHNOLOGY": "technologie",
"MEDIA": "médias",
"ADVERTISING": "publicité",
"HEALTH": "santé",

"SUPPORT": "soutenir",
"ARGUE": "argumenter",
"DISCUSS": "discuter",
"DESCRIBE": "décrire",
"EXPLAIN": "expliquer",
"COMPARE": "comparer",
"CONTRAST": "opposer",
"MENTION": "citer",
"NOTICE": "remarquer",
"SEEM": "sembler",
"MEAN": "signifier",
"SUGGEST": "suggérer",
"RECOMMEND": "conseiller",
"EXPECT": "attendre",
"REALISE": "réaliser",
"DEVELOP": "développer",
"CREATE": "créer",
"PRODUCE": "produire",
"INCREASE": "augmenter",
"REDUCE": "réduire",
"LIMIT": "limiter",
"PREVENT": "empêcher",
"AVOID": "éviter",
"SOLVE": "résoudre",
"PROTECT": "protéger",
"CONTROL": "contrôler",
"AFFECT": "toucher",
"INFLUENCE": "influencer",
"ENCOURAGE": "encourager",
"ALLOW": "autoriser",
"FORBID": "interdire",
"COMMUNICATE": "communiquer",

"ESSENTIAL": "essentiel",
"NECESSARY": "nécessaire",
"MAIN": "principal",
"MAJOR": "majeur",
"MINOR": "secondaire",
"GENERAL": "général",
"SPECIAL": "spécial",
"TYPICAL": "typique",
"COMMON": "courant",
"RARE": "rare",
"USUAL": "habituel",
"UNUSUAL": "inhabituel",
"CORRECT": "correct",
"FALSE": "faux",
"POSITIVE": "positif",
"NEGATIVE": "négatif",
"USEFUL": "utile",
"USELESS": "inutile",
"SAFE": "sûr",
"DANGEROUS": "dangereux",
"FAIR": "juste",
"UNFAIR": "injuste",
"HONEST": "honnête",
"SERIOUS": "sérieux",
"CALM": "calme",
"NERVOUS": "nerveux",
"ANXIOUS": "anxieux",
"SIMILAR": "semblable",
"SEPARATE": "séparé",
"POLITE": "poli",
"IMPOLITE": "impoli",
"KIND": "gentil",
"RUDE": "grossier",
"HELPFUL": "serviable",
"SELFISH": "égoïste",
"CONFIDENT": "confiant",
"SHY": "timide",

"QUITE": "assez",
"FAIRLY": "assez",
"EXTREMELY": "extrêmement",
"ESPECIALLY": "surtout",
"PARTICULARLY": "particulièrement",
"ALMOST": "presque",
"NEARLY": "presque",
"SLIGHTLY": "légèrement",
"TOTALLY": "totalement",
"COMPLETELY": "complètement",
"MAINLY": "principalement",
"MOSTLY": "surtout",
"PARTLY": "partiellement",

"HOWEVER": "cependant",
"THOUGH": "pourtant",
"MOREOVER": "de plus",
"IN ADDITION": "en plus",
"INSTEAD": "au lieu",
"AS WELL": "aussi",
"SUCH AS": "comme",
"IN OTHER": "autrement",
"THEREFORE": "donc",
"THUS": "ainsi",
"BECAUSE OF": "à cause",
"DUE TO": "en raison",
"FIRSTLY": "d'abord",
"SECONDLY": "ensuite",
"FINALLY": "finalement",
"IN CONCLUSION": "en conclusion",
"TO SUM": "conclure",



"AWARENESS": "conscience",
"INEQUALITY": "inégalité",
"INJUSTICE": "injustice",
"POVERTY": "pauvreté",
"WEALTH": "richesse",
"PRIVILEGE": "privilège",
"OPPRESSION": "oppression",
"VIOLENCE": "violence",
"SECURITY": "sécurité",
"SAFETY": "sécurité",
"RIGHTS": "droits",
"RACISM": "racisme",
"SEXISM": "sexisme",
"DISCRIMINATION": "discrimination",
"SEGREGATION": "ségrégation",
"INCLUSION": "inclusion",
"DIVERSITY": "diversité",
"IDENTITY": "identité",
"BELONGING": "appartenance",
"MINORITY": "minorité",
"MAJORITY": "majorité",
"CHILDHOOD": "enfance",
"ADULTHOOD": "âge adulte",
"GLOBALIZATION": "mondialisation",
"ADDICTION": "addiction",
"OBESITY": "obésité",
"ANXIETY": "anxiété",
"STRESS": "stress",
"DEPRESSION": "dépression",
"CLIMATE": "climat",
"CLIMATE CHANGE": "changement climatique",
"GLOBAL WARMING": "réchauffement climatique",
"DEFORESTATION": "déforestation",
"POLLUTION": "pollution",
"EMISSIONS": "émissions",
"PRIVACY": "vie privée",
"SURVEILLANCE": "surveillance",
"MISINFORMATION": "désinformation",
"FAKE NEWS": "infox",

"HIGHLIGHT": "souligner",
"EMPHASIZE": "accentuer",
"ILLUSTRATE": "illustrer",
"DEMONSTRATE": "démontrer",
"REVEAL": "révéler",
"INDICATE": "indiquer",
"IMPLY": "impliquer",
"QUESTION": "questionner",
"CHALLENGE": "contester",
"CRITICIZE": "critiquer",
"BLAME": "blâmer",
"ACCUSE": "accuser",
"PRAISE": "louer",
"PROMOTE": "promouvoir",
"DEFEND": "défendre",
"RESPECT": "respecter",
"VIOLATE": "violer",
"HARM": "nuire",
"DAMAGE": "abîmer",
"THREATEN": "menacer",
"DECLINE": "baisser",
"WORSEN": "aggraver",
"GENERATE": "générer",
"CAUSE": "causer",
"LEAD": "mener",
"RESULT": "aboutir",
"RELATE": "relier",
"REFER": "citer",
"BENEFIT": "profiter",
"SUFFER": "souffrir",
"COPE": "gérer",
"DEAL": "gérer",
"RELY": "compter",
"BAN": "interdire",
"RESTRICT": "limiter",
"ENABLE": "permettre",
"ENSURE": "assurer",
"GUARANTEE": "garantir",
"INVOLVE": "impliquer",
"REQUIRE": "exiger",
"CONTRIBUTE": "contribuer",
"FIGURE OUT": "comprendre",
"BREAK DOWN": "analyser",

"SIGNIFICANT": "important",
"RELEVANT": "pertinent",
"APPROPRIATE": "adapté",
"SUITABLE": "convenable",
"EFFICIENT": "productif",
"EFFECTIVE": "efficace",
"REASONABLE": "raisonnable",
"ACCEPTABLE": "acceptable",
"UNACCEPTABLE": "inacceptable",
"CONTROVERSIAL": "controversé",
"WIDESPREAD": "répandu",
"LIMITED": "limité",
"GLOBAL": "mondial",
"ENVIRONMENTAL": "écologique",
"ECONOMIC": "économique",
"FINANCIAL": "financier",
"POLITICAL": "politique",
"SOCIAL": "social",
"CULTURAL": "culturel",
"MENTAL": "mental",
"AVERAGE": "moyen",
"CRUCIAL": "crucial",
"VITAL": "vital",
"ADVANCED": "avancé",
"COMPLEX": "complexe",
"OBVIOUS": "évident",
"UNCERTAIN": "incertain",
"LIKELY": "probable",
"UNLIKELY": "improbable",
"POSSIBLE": "possible",
"AVAILABLE": "disponible",
"AWARE": "conscient",
"RESPONSIBLE": "responsable",
"INDEPENDENT": "autonome",
"DEPENDENT": "dépendant",
"RESILIENT": "résilient",

"SIGNIFICANTLY": "fortement",
"CONSIDERABLY": "beaucoup",
"DRAMATICALLY": "énormément",
"GRADUALLY": "progressivement",
"EVENTUALLY": "finalement",
"ULTIMATELY": "finalement",
"SPECIFICALLY": "spécifiquement",
"PRIMARILY": "surtout",
"ESSENTIALLY": "essentiellement",
"INCREASINGLY": "davantage",
"RELATIVELY": "relativement",
"ROUGHLY": "environ",
"GENERALLY": "généralement",
"OCCASIONALLY": "parfois",
"FREQUENTLY": "souvent",
"CONSTANTLY": "sans cesse",

"ALTHOUGH": "bien que",
"EVEN THOUGH": "même si",
"WHEREAS": "alors que",
"DESPITE": "malgré",
"HOWEVER": "cependant",
"NONETHELESS": "pourtant",
"CONSEQUENTLY": "donc",
"THEREFORE": "donc",
"MEANWHILE": "pendant",
"BESIDES": "d'ailleurs",
"IN CONTRAST": "au contraire",
"BECAUSE OF": "à cause",
"AS A RESULT": "donc",
"UP TO": "jusqu'à",

"RAISE AWARENESS": "sensibiliser",
"RAISE QUESTIONS": "interroger",
"TAKE ACTION": "agir",
"MAKE PROGRESS": "progresser",
"MAKE A DIFFERENCE": "changer",
"HAVE IMPACT": "influencer",
"PLAY ROLE": "jouer rôle",
"BE LIKELY": "être probable",
"BE UNLIKELY": "être improbable",
"BE INVOLVED": "être impliqué",
"BE AWARE": "être conscient",
"BE RESPONSIBLE": "être responsable",

"PARADOX": "paradoxe",
"AMBIGUITY": "ambiguïté",
"NUANCE": "nuance",
"COMPLEXITY": "complexité",
"CONTRADICTION": "contradiction",
"ASSUMPTION": "hypothèse",
"BIAS": "biais",
"STEREOTYPE": "stéréotype",
"PREJUDICE": "préjugé",
"EMPOWERMENT": "émancipation",
"MARGINALIZATION": "marginalisation",
"EXCLUSION": "exclusion",
"LEGACY": "héritage",
"HERITAGE": "patrimoine",
"SUSTAINABILITY": "durabilité",
"ACCOUNTABILITY": "responsabilité",
"LEGITIMACY": "légitimité",
"FRAMEWORK": "cadre",
"APPROACH": "approche",
"PERSPECTIVE": "perspective",
"NARRATIVE": "récit",
"REPRESENTATION": "représentation",
"VISIBILITY": "visibilité",
"TENSION": "tension",
"CONFLICT": "conflit",
"DILEMMA": "dilemme",
"BACKLASH": "réaction",
"PATTERN": "schéma",
"TREND": "tendance",
"FACTOR": "facteur",
"EVIDENCE": "preuve",
"OUTCOME": "issue",
"IMPLICATION": "conséquence",
"PRIORITY": "priorité",
"POLICY": "politique",
"MEASURE": "mesure",
"REFORM": "réforme",
"IMPLEMENTATION": "application",
"REGULATION": "réglementation",
"ACCESSIBILITY": "accessibilité",
"VULNERABILITY": "fragilité",
"RESILIENCE": "résilience",
"INNOVATION": "innovation",
"STABILITY": "stabilité",
"UNCERTAINTY": "incertitude",
"OWNERSHIP": "propriété",
"ENGAGEMENT": "engagement",
"COMMITMENT": "engagement",
"PARTICIPATION": "participation",
"INTERACTION": "interaction",
"INTERDEPENDENCE": "interdépendance",
"DEMOGRAPHICS": "démographie",
"WORKFORCE": "travailleurs",

"UNDERSCORE": "souligner",
"UNDERMINE": "miner",
"PERPETUATE": "perpétuer",
"REINFORCE": "renforcer",
"EXACERBATE": "aggraver",
"MITIGATE": "atténuer",
"FACILITATE": "faciliter",
"FOSTER": "favoriser",
"PROMPT": "inciter",
"TRIGGER": "déclencher",
"SPARK": "susciter",
"SHAPE": "façonner",
"REFLECT": "refléter",
"EMBODY": "incarner",
"ENFORCE": "imposer",
"IMPLEMENT": "appliquer",
"ADVOCATE": "défendre",
"ACKNOWLEDGE": "admettre",
"ADDRESS": "aborder",
"TACKLE": "affronter",
"OVERESTIMATE": "surestimer",
"UNDERESTIMATE": "sous-estimer",
"NORMALIZE": "normaliser",
"STIGMATIZE": "stigmatiser",
"DISCOURAGE": "décourager",
"CONDEMN": "condamner",
"LEGITIMIZE": "légitimer",
"OVERLOOK": "ignorer",
"PORTRAY": "dépeindre",
"DEPICT": "représenter",
"FRAME": "cadrer",
"PRIORITIZE": "prioriser",
"RECONSIDER": "revoir",
"RETHINK": "repenser",
"TRANSFORM": "transformer",
"INTEGRATE": "intégrer",
"BALANCE": "équilibrer",
"COMPROMISE": "compromettre",
"TARGET": "cibler",
"EXPLOIT": "exploiter",
"MANIPULATE": "manipuler",
"BRIDGE": "combler",
"REINVENT": "réinventer",

"AMBIGUOUS": "ambigu",
"NUANCED": "nuancé",
"SUBTLE": "subtil",
"UNDERLYING": "caché",
"INHERENT": "inhérent",
"INEVITABLE": "inévitable",
"IRREVERSIBLE": "irréversible",
"SHORTSIGHTED": "imprévoyant",
"SUSTAINABLE": "durable",
"UNSUSTAINABLE": "instable",
"MARGINALIZED": "marginal",
"INCLUSIVE": "inclusif",
"EXCLUSIVE": "exclusif",
"REPRESENTATIVE": "représentatif",
"SYMBOLIC": "symbolique",
"MEANINGFUL": "fort",
"INSIGNIFICANT": "minime",
"SUBSTANTIAL": "important",
"OVERWHELMING": "écrasant",
"STRIKING": "frappant",
"PROMINENT": "marquant",
"INFLUENTIAL": "influent",
"EMOTIVE": "émotif",
"PROBLEMATIC": "problématique",
"CHALLENGING": "stimulant",
"INNOVATIVE": "innovant",
"OUTSPOKEN": "franc",
"PREJUDICED": "partial",
"BIASED": "biaisé",
"NEUTRAL": "neutre",
"OBJECTIVE": "objectif",
"SUBJECTIVE": "subjectif",
"COMPELLING": "convaincant",
"PERSUASIVE": "persuasif",
"CREDIBLE": "crédible",
"RELIABLE": "fiable",
"VULNERABLE": "vulnérable",
"OUTDATED": "dépassé",
"UPDATED": "actualisé",
"WORTHWHILE": "utile",
"QUESTIONABLE": "douteux",
"ETHICAL": "éthique",
"UNETHICAL": "immoral",
"HARMFUL": "nocif",
"BENEFICIAL": "bénéfique",
"GENUINE": "authentique",
"CONTEMPORARY": "contemporain",

"APPARENTLY": "apparemment",
"ARGUABLY": "probablement",
"NOTABLY": "notamment",
"INEVITABLY": "inévitablement",
"PARADOXICALLY": "paradoxalement",
"DELIBERATELY": "volontairement",
"INTENTIONALLY": "exprès",
"UNINTENTIONALLY": "involontairement",
"PRIVATELY": "en privé",
"PUBLICLY": "publiquement",
"PREDOMINANTLY": "principalement",
"EXPLICITLY": "explicitement",
"IMPLICITLY": "implicitement",
"SIMULTANEOUSLY": "simultanément",
"RESPECTIVELY": "respectivement",

"NEVERTHELESS": "toutefois",
"FURTHERMORE": "de plus",
"HENCE": "d'où",
"INDEED": "en effet",
"REGARDLESS": "malgré",


  };
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Updating Wordfall dictionary with translations...\n');
  
  try {
    // Ensure words directory exists
    await fs.mkdir(WORDS_DIR, { recursive: true });
    
    // Download dictionary translations
    let translations = await downloadDictionary();
    
    // If we don't have enough translations, use fallback
    if (Object.keys(translations).length < 100) {
      console.log('\n⚠ Not enough translations from online sources, using fallback dictionary...');
      const fallback = createFallbackDictionary();
      translations = { ...fallback, ...translations };
      console.log(`  ✓ Using fallback dictionary with ${Object.keys(fallback).length} words`);
    }
    
    // Get manual words from fallback dictionary
    const manualWordsDict = createFallbackDictionary();
    const manualWordsByLength = { 4: [], 5: [], 6: [] };
    const manualTranslations = {};
    
    /**
     * Clean translation: remove parentheses, slashes, and take first part before comma
     * Example: "je / vous" → "je"
     * Example: "mon, ma, mes" → "mon"
     * Example: "il / elle (chose, animal)" → "il"
     * Example: "peu importe ce que / quoi qu'il arrive" → "peu importe ce que"
     * Example: "accepter (difficilement)" → "accepter"
     */
    function cleanTranslation(translation) {
      if (!translation || typeof translation !== 'string') return '';
      
      let cleaned = translation.trim();
      
      // Remove everything in parentheses (including nested parentheses)
      cleaned = cleaned.replace(/\([^()]*\)/g, '');
      // Remove any remaining parentheses content (in case of nested)
      cleaned = cleaned.replace(/\([^()]*\)/g, '');
      
      // Take first part before "/" (remove everything after first slash)
      if (cleaned.includes('/')) {
        cleaned = cleaned.split('/')[0].trim();
      }
      
      // Take first part before "," (remove everything after first comma)
      if (cleaned.includes(',')) {
        cleaned = cleaned.split(',')[0].trim();
      }
      
      // Remove any remaining extra spaces and clean up
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      return cleaned;
    }
    
    // Process ALL manual words (including those with spaces)
    // Separate single words (4-6 letters) from expressions (with spaces or longer)
    const manualExpressions = [];
    
    for (const [word, translation] of Object.entries(manualWordsDict)) {
      const upperWord = word.toUpperCase().trim();
      const cleanedTranslation = cleanTranslation(translation);
      
      if (!cleanedTranslation) continue;
      
      // Check if it's a single word (no spaces, only letters)
      if (/^[A-Z]+$/.test(upperWord)) {
        const length = upperWord.length;
        // Include ALL single words (including 1-letter words like "I")
        if (length >= 1) {
          manualTranslations[upperWord] = cleanedTranslation;
          // Only add to wordsByLength if it's 4-6 letters (for compatibility)
          if (length >= 4 && length <= 6) {
            if (!manualWordsByLength[length]) {
              manualWordsByLength[length] = [];
            }
            manualWordsByLength[length].push(upperWord);
          }
        }
      } else if (upperWord.includes(' ') || upperWord.length > 6) {
        // It's an expression (has spaces or is longer than 6 characters)
        // Store it as an expression
        manualTranslations[upperWord] = cleanedTranslation;
        manualExpressions.push(upperWord);
      }
    }
    
    // Sort manual words by length
    for (const length of [4, 5, 6]) {
      if (manualWordsByLength[length]) {
        manualWordsByLength[length] = Array.from(new Set(manualWordsByLength[length])).sort();
      }
    }
    
    // Sort expressions
    manualExpressions.sort();
    
    // Download common English words
    const commonWords = await downloadCommonWords();
    
    // Filter: only keep words that have translations
    const wordsWithTranslations = {};
    const wordsByLength = { 4: [], 5: [], 6: [] };
    
    for (const word of commonWords) {
      if (translations[word]) {
        wordsWithTranslations[word] = translations[word];
        wordsByLength[word.length].push(word);
      }
    }
    
    // If we still don't have enough, add words from translations directly
    for (const [word, translation] of Object.entries(translations)) {
      if (!wordsWithTranslations[word] && word.length >= 4 && word.length <= 6) {
        wordsWithTranslations[word] = translation;
        wordsByLength[word.length].push(word);
      }
    }
    
    // Sort words by length
    for (const length of [4, 5, 6]) {
      wordsByLength[length] = Array.from(new Set(wordsByLength[length])).sort();
    }
    
    // Create output structure
    const output = {
      translations: wordsWithTranslations,
      wordsByLength,
      // Add manual words section (for use in game)
      manualWords: {
        translations: manualTranslations,
        wordsByLength: manualWordsByLength,
        expressions: manualExpressions, // Words with spaces or longer than 6 chars
      },
      _metadata: {
        lastUpdated: new Date().toISOString(),
        sources: [COMMON_WORDS_SOURCE.name, ...DICTIONARY_SOURCES.map(s => s.name)],
        counts: {
          total: Object.keys(wordsWithTranslations).length,
          byLength: {
            4: wordsByLength[4].length,
            5: wordsByLength[5].length,
            6: wordsByLength[6].length
          },
          manual: {
            total: Object.keys(manualTranslations).length,
            byLength: {
              4: manualWordsByLength[4].length,
              5: manualWordsByLength[5].length,
              6: manualWordsByLength[6].length
            }
          }
        }
      }
    };
    
    // Write to file
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(output, null, 2),
      'utf-8'
    );
    
    console.log('\n✅ Wordfall dictionary updated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total words with translations: ${output._metadata.counts.total}`);
    console.log(`   By length: ${output._metadata.counts.byLength[4]} (4), ${output._metadata.counts.byLength[5]} (5), ${output._metadata.counts.byLength[6]} (6)`);
    console.log(`\n📁 Output: ${OUTPUT_FILE}`);
    console.log(`\n💡 To update again, run: node scripts/update-wordfall-dictionary.js`);
    
  } catch (error) {
    console.error('\n❌ Error updating Wordfall dictionary:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

