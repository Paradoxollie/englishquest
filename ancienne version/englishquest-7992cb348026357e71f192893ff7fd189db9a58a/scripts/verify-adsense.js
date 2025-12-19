#!/usr/bin/env node

/**
 * Script de vérification automatique de l'intégration AdSense
 * 
 * Ce script vérifie que tous les éléments nécessaires pour AdSense sont en place.
 * 
 * Usage: node scripts/verify-adsense.js [url]
 * Exemple: node scripts/verify-adsense.js https://englishquest-omega.vercel.app
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const AD_CLIENT = 'ca-pub-6094969027977372';
const AD_SLOT = '1844574488';
const SITE_URL = process.argv[2] || 'https://englishquest-omega.vercel.app';

console.log('🔍 Vérification de l\'intégration AdSense...\n');
console.log(`Site: ${SITE_URL}\n`);

const results = {
  adsTxt: false,
  htmlSource: false,
  scriptTag: false,
  adContainer: false,
  metadata: false,
};

// Fonction pour faire une requête HTTP/HTTPS
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

// 1. Vérifier ads.txt
async function checkAdsTxt() {
  console.log('1️⃣  Vérification de ads.txt...');
  try {
    const { status, data } = await fetchUrl(`${SITE_URL}/ads.txt`);
    if (status === 200) {
      const expectedLine = `google.com, pub-6094969027977372, DIRECT, f08c47fec0942fa0`;
      if (data.includes('pub-6094969027977372')) {
        console.log('   ✅ ads.txt est accessible et contient le bon ID');
        results.adsTxt = true;
      } else {
        console.log('   ❌ ads.txt ne contient pas le bon ID');
      }
    } else {
      console.log(`   ❌ ads.txt retourne le statut ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur lors de la vérification de ads.txt: ${error.message}`);
  }
  console.log('');
}

// 2. Vérifier le HTML source
async function checkHtmlSource() {
  console.log('2️⃣  Vérification du HTML source...');
  try {
    const { status, data } = await fetchUrl(SITE_URL);
    if (status === 200) {
      // Vérifier le script AdSense
      const scriptPattern = new RegExp(
        `https://pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=${AD_CLIENT.replace(/-/g, '\\-')}`,
        'i'
      );
      if (scriptPattern.test(data)) {
        console.log('   ✅ Script AdSense trouvé dans le HTML source');
        results.scriptTag = true;
      } else {
        console.log('   ❌ Script AdSense non trouvé dans le HTML source');
      }

      // Vérifier le conteneur AdSense
      if (data.includes('adsbygoogle') && data.includes(AD_CLIENT) && data.includes(AD_SLOT)) {
        console.log('   ✅ Conteneur AdSense trouvé dans le HTML source');
        results.adContainer = true;
      } else {
        console.log('   ❌ Conteneur AdSense non trouvé dans le HTML source');
      }

      // Vérifier les meta tags
      if (data.includes('google-adsense-account') || data.includes(AD_CLIENT)) {
        console.log('   ✅ Meta tag AdSense trouvé');
        results.metadata = true;
      } else {
        console.log('   ⚠️  Meta tag AdSense non trouvé (optionnel)');
      }

      results.htmlSource = true;
    } else {
      console.log(`   ❌ Le site retourne le statut ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur lors de la vérification du HTML: ${error.message}`);
  }
  console.log('');
}

// 3. Vérifier le fichier local ads.txt
async function checkLocalAdsTxt() {
  console.log('3️⃣  Vérification du fichier local ads.txt...');
  const adsTxtPath = path.join(process.cwd(), 'public', 'ads.txt');
  if (fs.existsSync(adsTxtPath)) {
    const content = fs.readFileSync(adsTxtPath, 'utf-8');
    if (content.includes('pub-6094969027977372')) {
      console.log('   ✅ Fichier local ads.txt est correct');
    } else {
      console.log('   ❌ Fichier local ads.txt ne contient pas le bon ID');
    }
  } else {
    console.log('   ❌ Fichier local ads.txt non trouvé');
  }
  console.log('');
}

// 4. Vérifier le code source local
async function checkLocalCode() {
  console.log('4️⃣  Vérification du code source local...');
  
  // Vérifier app/layout.tsx
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf-8');
    if (content.includes(AD_CLIENT) && content.includes('adsbygoogle')) {
      console.log('   ✅ app/layout.tsx contient le code AdSense');
    } else {
      console.log('   ❌ app/layout.tsx ne contient pas le code AdSense');
    }
  }

  // Vérifier components/ads/FooterAdServer.tsx
  const footerAdPath = path.join(process.cwd(), 'components', 'ads', 'FooterAdServer.tsx');
  if (fs.existsSync(footerAdPath)) {
    const content = fs.readFileSync(footerAdPath, 'utf-8');
    if (content.includes(AD_CLIENT) && content.includes(AD_SLOT)) {
      console.log('   ✅ FooterAdServer.tsx contient le code AdSense');
    } else {
      console.log('   ❌ FooterAdServer.tsx ne contient pas le code AdSense');
    }
  }
  console.log('');
}

// Résumé
function printSummary() {
  console.log('📊 Résumé de la vérification:\n');
  console.log(`   ads.txt accessible: ${results.adsTxt ? '✅' : '❌'}`);
  console.log(`   HTML source accessible: ${results.htmlSource ? '✅' : '❌'}`);
  console.log(`   Script AdSense dans HTML: ${results.scriptTag ? '✅' : '❌'}`);
  console.log(`   Conteneur AdSense dans HTML: ${results.adContainer ? '✅' : '❌'}`);
  console.log(`   Meta tag AdSense: ${results.metadata ? '✅' : '⚠️'}`);
  console.log('');

  const allCritical = results.adsTxt && results.htmlSource && results.scriptTag && results.adContainer;
  
  if (allCritical) {
    console.log('✅ Tous les éléments critiques sont en place !');
    console.log('');
    console.log('📋 Prochaines étapes (à faire manuellement):');
    console.log('   1. Vérifiez votre site dans Google Search Console:');
    console.log('      https://search.google.com/search-console');
    console.log('   2. Ajoutez votre site dans Google AdSense:');
    console.log('      https://www.google.com/adsense');
    console.log('   3. Attendez 24-48h pour que Google détecte le code');
  } else {
    console.log('❌ Certains éléments critiques manquent.');
    console.log('   Vérifiez les erreurs ci-dessus et redéployez si nécessaire.');
  }
}

// Exécuter toutes les vérifications
async function run() {
  await checkLocalAdsTxt();
  await checkLocalCode();
  await checkAdsTxt();
  await checkHtmlSource();
  printSummary();
}

run().catch(console.error);



