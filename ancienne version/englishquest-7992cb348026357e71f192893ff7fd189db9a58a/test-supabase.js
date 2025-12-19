// Script simple pour vérifier les variables d'environnement
console.log('=== VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ DÉFINI' : '✗ MANQUANT');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ DÉFINI' : '✗ MANQUANT');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ DÉFINI' : '✗ MANQUANT');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL ? '✓ DÉFINI' : '✗ MANQUANT');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ DES VARIABLES D\'ENVIRONNEMENT SONT MANQUANTES!');
  console.error('Crée un fichier .env.local avec :');
  console.error('NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon');
  console.error('SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role');
  console.error('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  process.exit(1);
}

console.log('\n✅ Toutes les variables d\'environnement sont définies!');
