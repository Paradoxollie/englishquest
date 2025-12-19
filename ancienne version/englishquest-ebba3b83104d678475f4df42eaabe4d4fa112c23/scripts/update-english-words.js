/**
 * Script to download a complete list of valid English words for Wordfall free mode
 * 
 * This script downloads comprehensive English word lists from free sources
 * and creates a complete dictionary of valid English words (2-20 letters)
 * 
 * Sources used (all public domain / open source):
 * - dwyl/english-words (Public Domain) - Large comprehensive list
 * - google-10000-english (MIT) - Common words
 * 
 * Run with: node scripts/update-english-words.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const WORDS_DIR = path.join(__dirname, '../lib/games/words');
const OUTPUT_FILE = path.join(WORDS_DIR, 'english-words.json');
const INAPPROPRIATE_WORDS_FILE = path.join(WORDS_DIR, 'inappropriate-words.txt');

/**
 * Free word list sources (public domain / open source)
 * Using sources that exclude proper nouns, abbreviations, and contractions
 */
const WORD_LIST_SOURCES = [
  // GitHub: first20hours/google-10000-english (MIT license) - Common words, no proper nouns
  {
    name: 'google-10000',
    url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-medium.txt',
    description: 'Top 10,000 English words (common words, no profanity, no proper nouns)',
    priority: 1 // Main source - most reliable
  },
  // GitHub: dwyl/english-words but with strict filtering (lowercase words only = no proper nouns)
  {
    name: 'dwyl-english-words-filtered',
    url: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
    description: 'English words (heavily filtered to exclude proper nouns, abbreviations)',
    priority: 2,
    strictFilter: true // Apply strict filtering
  },
  // GitHub: first20hours - other word lists
  {
    name: 'google-10000-top',
    url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-top.txt',
    description: 'Top English words (no proper nouns)',
    optional: true,
    priority: 3
  },
  {
    name: 'google-10000-long',
    url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-long.txt',
    description: 'Longer English words (no proper nouns)',
    optional: true,
    priority: 4
  }
];

/**
 * Common abbreviations to exclude
 */
const COMMON_ABBREVIATIONS = new Set([
  'TV', 'USA', 'UK', 'EU', 'UN', 'NATO', 'CEO', 'CFO', 'CTO', 'AI', 'IT', 'PC', 'CD', 'DVD',
  'GPS', 'PDF', 'HTML', 'CSS', 'JS', 'API', 'URL', 'HTTP', 'HTTPS', 'WWW', 'WWII', 'WWI',
  'US', 'U.S.', 'U.K.', 'E.U.', 'A.M.', 'P.M.', 'A.D.', 'B.C.', 'IQ', 'EQ', 'DNA', 'RNA',
  'OK', 'OKAY', 'FYI', 'ASAP', 'RSVP', 'FAQ', 'VIP', 'HR', 'PR', 'R&D',
  'ID', 'IDK', 'LOL', 'OMG', 'WTF', 'BTW', 'IMO', 'IMHO', 'TLDR', 'TL;DR', 'ETA', 'TBA',
  'AKA', 'DIY'
]);

/**
 * Common proper nouns to exclude (cities, countries, names, brands)
 */
const COMMON_PROPER_NOUNS = new Set([
  // Common first names
  'JOHN', 'MARY', 'JAMES', 'ROBERT', 'MICHAEL', 'WILLIAM', 'DAVID', 'RICHARD', 'JOSEPH', 'THOMAS',
  'CHARLES', 'CHRISTOPHER', 'DANIEL', 'MATTHEW', 'ANTHONY', 'MARK', 'DONALD', 'STEVEN', 'PAUL',
  'ANDREW', 'JOSHUA', 'KENNETH', 'KEVIN', 'BRIAN', 'GEORGE', 'EDWARD', 'RONALD', 'TIMOTHY',
  'JASON', 'JEFFREY', 'RYAN', 'JACOB', 'GARY', 'NICHOLAS', 'ERIC', 'JONATHAN', 'STEPHEN',
  'LARRY', 'JUSTIN', 'SCOTT', 'BRANDON', 'BENJAMIN', 'SAMUEL', 'FRANK', 'GREGORY', 'RAYMOND',
  'ALEXANDER', 'PATRICK', 'JACK', 'DENNIS', 'JERRY', 'TYLER', 'AARON', 'JOSE', 'HENRY',
  'ADAM', 'DOUGLAS', 'NATHAN', 'ZACHARY', 'KYLE', 'NOAH', 'ETHAN', 'JEREMY', 'WALTER',
  'CHRISTIAN', 'KEITH', 'ROGER', 'TERRY', 'AUSTIN', 'SEAN', 'GERALD', 'CARL', 'HAROLD',
  'DYLAN', 'LOUIS', 'WAYNE', 'RANDY', 'ALAN', 'JUAN', 'ROY', 'RALPH', 'EUGENE', 'RUSSELL',
  'BOBBY', 'MASON', 'PHILIP', 'JESSE', 'CRAIG', 'ALBERT', 'CHRISTOPHER', 'SAMUEL', 'JOSHUA',
  'JONATHAN', 'RYAN', 'JUSTIN', 'BRANDON', 'TYLER', 'NICHOLAS', 'ERIC', 'STEPHEN', 'JACOB',
  'LARRY', 'FRANK', 'JONATHAN', 'SCOTT', 'BRANDON', 'BENJAMIN', 'SAMUEL', 'GREGORY', 'RAYMOND',
  'ALEXANDER', 'PATRICK', 'JACK', 'DENNIS', 'JERRY', 'TYLER', 'AARON', 'JOSE', 'HENRY',
  // Common cities/countries
  'PARIS', 'LONDON', 'NEWYORK', 'TOKYO', 'BERLIN', 'ROME', 'MADRID', 'MOSCOW', 'BEIJING',
  'CAIRO', 'MUMBAI', 'SYDNEY', 'TORONTO', 'MEXICO', 'BRAZIL', 'CHINA', 'JAPAN', 'FRANCE',
  'GERMANY', 'ITALY', 'SPAIN', 'RUSSIA', 'INDIA', 'AUSTRALIA', 'CANADA', 'EGYPT', 'GREECE',
  'TURKEY', 'POLAND', 'SWEDEN', 'NORWAY', 'DENMARK', 'FINLAND', 'BELGIUM', 'NETHERLANDS',
  'PORTUGAL', 'AUSTRIA', 'SWITZERLAND', 'IRELAND', 'SCOTLAND', 'WALES', 'ENGLAND'
]);

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
 * Check if a word is likely a proper noun (starts with capital in original)
 * We check if it appears capitalized in common proper noun patterns
 */
function isLikelyProperNoun(word, originalLine) {
  // If the original line starts with uppercase and is a single word, likely a proper noun
  const trimmed = originalLine.trim();
  if (trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase() && trimmed === trimmed.toLowerCase().charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()) {
    // Check if it's a common word that should be lowercase
    const commonWords = ['i', 'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    if (commonWords.includes(trimmed.toLowerCase())) {
      return false; // Common words are fine even if capitalized
    }
    // If it's a single capitalized word and not in common words, likely proper noun
    if (!trimmed.includes(' ') && trimmed.length > 1) {
      return true;
    }
  }
  return false;
}

/**
 * Check if word is an abbreviation (all caps, short, or contains periods)
 */
function isAbbreviation(word, originalLine) {
  // Common abbreviation patterns
  if (COMMON_ABBREVIATIONS.has(word)) return true;
  
  // Very short all-caps words (2-3 letters) are often abbreviations
  if (word.length <= 3 && word === word.toUpperCase() && originalLine === originalLine.toUpperCase()) {
    // But allow common short words
    const commonShortWords = ['I', 'A', 'AN', 'AM', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'HI', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE'];
    if (!commonShortWords.includes(word)) {
      return true;
    }
  }
  
  // Words with periods are abbreviations (A.M., U.S., etc.)
  if (originalLine.includes('.')) return true;
  
  return false;
}

/**
 * Check if word is a contraction (contains apostrophe)
 */
function isContraction(originalLine) {
  return originalLine.includes("'") || originalLine.includes("'");
}

/**
 * Process words from raw text with strict filtering
 */
function processWords(rawText, inappropriateWords, minLength = 2, maxLength = 20, strictFilter = false) {
  const words = new Set();
  
  const lines = rawText.split('\n');
  for (const line of lines) {
    const originalLine = line.trim();
    if (!originalLine) continue;
    
    const word = originalLine.toUpperCase().trim();
    
    // Filter criteria
    if (word.length < minLength || word.length > maxLength) continue;
    if (!/^[A-Z]+$/.test(word)) continue; // Only letters, no spaces, no special chars
    if (inappropriateWords.has(word)) continue;
    
    // Exclude contractions
    if (isContraction(originalLine)) continue;
    
    // Exclude abbreviations
    if (isAbbreviation(word, originalLine)) continue;
    
    // Exclude common proper nouns
    if (COMMON_PROPER_NOUNS.has(word)) continue;
    
    // Strict filtering for sources like dwyl that contain proper nouns
    if (strictFilter) {
      // Only accept words that are lowercase in original (no proper nouns)
      // Proper nouns in dwyl list are usually capitalized
      if (originalLine !== originalLine.toLowerCase()) {
        // Word has capital letters - likely a proper noun
        // Exception: allow "I" which is always capitalized
        if (word !== 'I') {
          continue;
        }
      }
      
      // Additional checks for strict mode
      // Exclude very short all-caps words (abbreviations)
      if (word.length <= 3 && originalLine === originalLine.toUpperCase() && word !== 'I' && word !== 'A') {
        const commonShortWords = ['AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'HI', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE'];
        if (!commonShortWords.includes(word)) {
          continue;
        }
      }
    } else {
      // Less strict filtering for sources that are already filtered (like google-10000)
      // Still check for proper nouns
      if (isLikelyProperNoun(word, originalLine)) continue;
      
      // Exclude words that are all caps in original (likely abbreviations or proper nouns)
      const commonWords = new Set(['I', 'A', 'AN', 'THE', 'AND', 'OR', 'BUT', 'IN', 'ON', 'AT', 'TO', 'FOR', 'OF', 'WITH', 'BY', 'IS', 'AM', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING', 'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'COULD', 'SHOULD', 'MAY', 'MIGHT', 'CAN', 'MUST']);
      if (originalLine === originalLine.toUpperCase() && word.length > 1 && !commonWords.has(word)) {
        continue;
      }
    }
    
    words.add(word);
  }
  
  return Array.from(words).sort();
}

/**
 * Download and merge words from multiple sources
 */
async function downloadAndMergeWords() {
  const inappropriateWords = await loadInappropriateWords();
  const allWords = new Set();
  
  console.log('Downloading English word lists from free sources...\n');
  
  // Sort sources by priority
  const sortedSources = [...WORD_LIST_SOURCES].sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  for (const source of sortedSources) {
    try {
      console.log(`Downloading from ${source.name}...`);
      const text = await downloadText(source.url);
      const words = processWords(text, inappropriateWords, 2, 20, source.strictFilter || false);
      
      // Add all words to the set (duplicates automatically handled)
      for (const word of words) {
        allWords.add(word);
      }
      
      console.log(`  ✓ Added ${words.length} words from ${source.name}`);
    } catch (error) {
      if (source.optional) {
        console.warn(`  ⚠ Skipped optional source ${source.name}:`, error.message);
      } else {
        console.error(`  ✗ Failed to download from ${source.name}:`, error.message);
        // For critical sources, we might want to fail, but continue for now
      }
    }
  }
  
  // Convert to sorted array
  const wordsArray = Array.from(allWords).sort();
  
  // Organize by length for easier lookup
  const wordsByLength = {};
  for (const word of wordsArray) {
    const length = word.length;
    if (!wordsByLength[length]) {
      wordsByLength[length] = [];
    }
    wordsByLength[length].push(word);
  }
  
  return {
    allWords: wordsArray,
    wordsByLength,
    totalCount: wordsArray.length
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Updating English words dictionary for Wordfall free mode...\n');
  
  try {
    // Ensure words directory exists
    await fs.mkdir(WORDS_DIR, { recursive: true });
    
    // Download and merge words
    const wordData = await downloadAndMergeWords();
    
    // Create output structure
    const output = {
      allWords: wordData.allWords,
      wordsByLength: wordData.wordsByLength,
      _metadata: {
        lastUpdated: new Date().toISOString(),
        sources: WORD_LIST_SOURCES.map(s => s.name),
        totalWords: wordData.totalCount,
        wordsByLengthCount: Object.keys(wordData.wordsByLength).reduce((acc, len) => {
          acc[len] = wordData.wordsByLength[len].length;
          return acc;
        }, {})
      }
    };
    
    // Write to file
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(output, null, 2),
      'utf-8'
    );
    
    console.log('\n✅ English words dictionary updated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total words: ${wordData.totalCount}`);
    console.log(`   Words by length:`);
    for (let len = 2; len <= 20; len++) {
      const count = wordData.wordsByLength[len]?.length || 0;
      if (count > 0) {
        console.log(`     ${len} letters: ${count}`);
      }
    }
    console.log(`\n📁 Output: ${OUTPUT_FILE}`);
    console.log(`\n💡 To update again, run: node scripts/update-english-words.js`);
    
  } catch (error) {
    console.error('\n❌ Error updating English words dictionary:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

