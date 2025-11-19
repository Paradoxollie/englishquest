/**
 * Script to automatically download and update word lists from free sources
 * 
 * Sources used (all public domain / open source):
 * - SCOWL (Spell Checker Oriented Word Lists) - Public domain
 * - dwyl/english-words - Public domain
 * - google-10000-english - MIT license
 * 
 * Run with: node scripts/update-word-lists.js
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const WORDS_DIR = path.join(__dirname, '../lib/games/words');
const OUTPUT_FILE = path.join(WORDS_DIR, 'enigma-scroll-words.json');
const INAPPROPRIATE_WORDS_FILE = path.join(WORDS_DIR, 'inappropriate-words.txt');

/**
 * Free word list sources (public domain / open source)
 */
const WORD_LIST_SOURCES = [
  // GitHub: dwyl/english-words (public domain) - Large comprehensive list
  {
    name: 'dwyl-english-words',
    url: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
    description: 'Large list of English words (public domain)'
  },
  // GitHub: first20hours/google-10000-english (MIT license) - Common words
  {
    name: 'google-10000',
    url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-medium.txt',
    description: 'Top 10,000 English words (common words, no profanity)'
  },
  // GitHub: en-wl/wordlist (SCOWL) - Public domain
  {
    name: 'SCOWL',
    url: 'https://raw.githubusercontent.com/en-wl/wordlist/master/alt12dicts/2of12inf.txt',
    description: 'Common English words from SCOWL project',
    optional: true // This source may not always be available
  },
  // Alternative: GitHub word lists
  {
    name: 'wordlist-english',
    url: 'https://raw.githubusercontent.com/atebits/Words/master/Words/en.txt',
    description: 'English word list',
    optional: true
  }
];

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
 * Filter and normalize words
 */
function processWords(rawText, inappropriateWords, minLength = 4, maxLength = 6) {
  const words = new Set();
  const lines = rawText.split(/\r?\n/);
  
  for (const line of lines) {
    const word = line.trim().toUpperCase();
    
    // Skip empty lines, comments, and invalid words
    if (!word || word.length < minLength || word.length > maxLength) continue;
    if (!/^[A-Z]+$/.test(word)) continue; // Only letters
    if (inappropriateWords.has(word)) continue; // Filter inappropriate
    
    words.add(word);
  }
  
  return Array.from(words).sort();
}

/**
 * Download and merge words from multiple sources
 */
async function downloadAndMergeWords() {
  const inappropriateWords = await loadInappropriateWords();
  const allWords = {
    4: new Set(),
    5: new Set(),
    6: new Set()
  };
  
  console.log('Downloading word lists from free sources...\n');
  
  for (const source of WORD_LIST_SOURCES) {
    try {
      console.log(`Downloading from ${source.name}...`);
      const text = await downloadText(source.url);
      const words = processWords(text, inappropriateWords);
      
      // Organize by length
      for (const word of words) {
        if (word.length >= 4 && word.length <= 6) {
          allWords[word.length].add(word);
        }
      }
      
      console.log(`  ✓ Added ${words.length} words from ${source.name}`);
    } catch (error) {
      if (source.optional) {
        console.warn(`  ⚠ Skipped optional source ${source.name}:`, error.message);
      } else {
        console.error(`  ✗ Failed to download from ${source.name}:`, error.message);
      }
      // Continue with other sources
    }
  }
  
  // Convert Sets to sorted arrays
  const validGuesses = {
    4: Array.from(allWords[4]).sort(),
    5: Array.from(allWords[5]).sort(),
    6: Array.from(allWords[6]).sort()
  };
  
  return validGuesses;
}

/**
 * Generate common words subset for targetWords (more curated)
 * Uses the google-10000 list as base for target words
 */
async function generateTargetWords() {
  const inappropriateWords = await loadInappropriateWords();
  const targetWords = {
    4: [],
    5: [],
    6: []
  };
  
  // Use the google-10000 list for target words (common words)
  const commonWordsSource = WORD_LIST_SOURCES.find(s => s.name === 'google-10000');
  if (commonWordsSource) {
    try {
      console.log('Generating target words from common words list...');
      const text = await downloadText(commonWordsSource.url);
      const words = processWords(text, inappropriateWords);
      
      for (const word of words) {
        if (word.length >= 4 && word.length <= 6) {
          targetWords[word.length].push(word);
        }
      }
      
      // Sort and remove duplicates
      for (const length of [4, 5, 6]) {
        targetWords[length] = Array.from(new Set(targetWords[length])).sort();
      }
      
      console.log(`  ✓ Generated target words: ${targetWords[4].length} (4), ${targetWords[5].length} (5), ${targetWords[6].length} (6)`);
    } catch (error) {
      console.error('Failed to generate target words:', error.message);
    }
  }
  
  // If we don't have enough 4-letter target words, use a subset from valid guesses
  // We'll generate valid guesses first and then use common ones for targets
  if (targetWords[4].length < 100) {
    console.log('  ⚠ Not enough 4-letter target words, will use common words from all sources');
  }
  
  return targetWords;
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Updating word lists from free sources...\n');
  
  try {
    // Ensure words directory exists
    await fs.mkdir(WORDS_DIR, { recursive: true });
    
    // Generate valid guesses first (all words from all sources)
    const validGuesses = await downloadAndMergeWords();
    
    // Generate target words (common words)
    let targetWords = await generateTargetWords();
    
    // If we don't have enough 4-letter target words, use common words from valid guesses
    if (targetWords[4].length < 100) {
      console.log('\nSupplementing 4-letter target words from common sources...');
      // Take first 500 common 4-letter words from valid guesses as targets
      targetWords[4] = validGuesses[4].slice(0, 500);
      console.log(`  ✓ Added ${targetWords[4].length} common 4-letter words as targets`);
    }
    
    // Ensure all target words are in valid guesses
    for (const length of [4, 5, 6]) {
      const targetSet = new Set(targetWords[length]);
      const validSet = new Set(validGuesses[length]);
      
      // Add missing target words to valid guesses
      for (const word of targetSet) {
        validSet.add(word);
      }
      
      validGuesses[length] = Array.from(validSet).sort();
    }
    
    // Create output structure
    const output = {
      targetWords,
      validGuesses,
      _metadata: {
        lastUpdated: new Date().toISOString(),
        sources: WORD_LIST_SOURCES.map(s => s.name),
        counts: {
          targetWords: {
            4: targetWords[4].length,
            5: targetWords[5].length,
            6: targetWords[6].length
          },
          validGuesses: {
            4: validGuesses[4].length,
            5: validGuesses[5].length,
            6: validGuesses[6].length
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
    
    console.log('\n✅ Word lists updated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Target words: ${targetWords[4].length} (4), ${targetWords[5].length} (5), ${targetWords[6].length} (6)`);
    console.log(`   Valid guesses: ${validGuesses[4].length} (4), ${validGuesses[5].length} (5), ${validGuesses[6].length} (6)`);
    console.log(`\n📁 Output: ${OUTPUT_FILE}`);
    console.log(`\n💡 To update again, run: node scripts/update-word-lists.js`);
    
  } catch (error) {
    console.error('\n❌ Error updating word lists:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

