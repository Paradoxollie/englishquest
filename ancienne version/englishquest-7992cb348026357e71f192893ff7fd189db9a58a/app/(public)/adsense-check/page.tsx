import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification AdSense",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdSenseCheckPage() {
  const AD_CLIENT = "ca-pub-6094969027977372";
  const AD_SLOT = "1844574488";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://englishquest-omega.vercel.app";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h1 className="mb-4 text-2xl font-bold text-white">
          🔍 Vérification de l'intégration AdSense
        </h1>
        
        <div className="space-y-6">
          {/* Vérification 1: Code dans le HTML */}
          <section className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. Code AdSense dans le HTML source
            </h2>
            <p className="mb-2 text-sm text-slate-300">
              Le code suivant doit être visible dans le HTML source de votre page d'accueil :
            </p>
            <div className="rounded bg-slate-900 p-3 font-mono text-xs text-slate-300">
              <div className="mb-2">
                <span className="text-slate-500">Script:</span>
                <br />
                <code>
                  {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}"></script>`}
                </code>
              </div>
              <div>
                <span className="text-slate-500">Conteneur:</span>
                <br />
                <code>
                  {`<ins class="adsbygoogle" data-ad-client="${AD_CLIENT}" data-ad-slot="${AD_SLOT}"></ins>`}
                </code>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              💡 Pour vérifier : Ouvrez votre site, faites clic droit → "Afficher le code source" et recherchez "adsbygoogle"
            </p>
          </section>

          {/* Vérification 2: ads.txt */}
          <section className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. Fichier ads.txt
            </h2>
            <p className="mb-2 text-sm text-slate-300">
              Le fichier doit être accessible à :{" "}
              <a
                href={`${SITE_URL}/ads.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                {SITE_URL}/ads.txt
              </a>
            </p>
            <div className="rounded bg-slate-900 p-3 font-mono text-xs text-slate-300">
              <code>google.com, pub-6094969027977372, DIRECT, f08c47fec0942fa0</code>
            </div>
          </section>

          {/* Vérification 3: Google Search Console */}
          <section className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Google Search Console (⚠️ Action requise)
            </h2>
            <p className="mb-2 text-sm text-slate-300">
              Votre site doit être vérifié dans Google Search Console avant qu'AdSense puisse le détecter.
            </p>
            <div className="mt-3">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Ouvrir Google Search Console →
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              📝 Étapes :
              <br />
              1. Ajoutez votre propriété : <code className="text-cyan-400">{SITE_URL}</code>
              <br />
              2. Vérifiez la propriété (fichier HTML, balise meta, ou DNS)
              <br />
              3. Attendez que Google indexe votre site
            </p>
          </section>

          {/* Vérification 4: Google AdSense */}
          <section className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Google AdSense (⚠️ Action requise)
            </h2>
            <p className="mb-2 text-sm text-slate-300">
              Ajoutez votre site dans votre compte AdSense.
            </p>
            <div className="mt-3">
              <a
                href="https://www.google.com/adsense"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Ouvrir Google AdSense →
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              📝 Étapes :
              <br />
              1. Allez dans "Sites"
              <br />
              2. Cliquez sur "Ajouter un site"
              <br />
              3. Entrez : <code className="text-cyan-400">{SITE_URL}</code>
              <br />
              4. Suivez les instructions
            </p>
          </section>

          {/* Checklist */}
          <section className="rounded-lg border border-cyan-700 bg-cyan-900/20 p-4">
            <h2 className="mb-3 text-lg font-semibold text-cyan-300">
              ✅ Checklist de vérification
            </h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">□</span>
                <span>Le code AdSense est visible dans le HTML source</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">□</span>
                <span>Le fichier ads.txt est accessible publiquement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">□</span>
                <span>Le site est vérifié dans Google Search Console</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">□</span>
                <span>Le site est ajouté dans Google AdSense</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">□</span>
                <span>Attendu 24-48h après toutes les vérifications</span>
              </li>
            </ul>
          </section>

          {/* Informations importantes */}
          <section className="rounded-lg border border-yellow-700 bg-yellow-900/20 p-4">
            <h2 className="mb-2 text-lg font-semibold text-yellow-300">
              ⚠️ Informations importantes
            </h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                • Google peut prendre <strong>24-48 heures</strong> pour détecter le code AdSense après l'ajout
              </li>
              <li>
                • Le site doit être <strong>indexé par Google</strong> avant qu'AdSense puisse le vérifier
              </li>
              <li>
                • Assurez-vous que votre site a <strong>suffisamment de contenu</strong> (AdSense nécessite du contenu de qualité)
              </li>
              <li>
                • Si vous avez un domaine personnalisé, utilisez-le plutôt que le domaine Vercel
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}



