# Architecture d’English Quest Omega

Next.js 16 avec App Router, React 19, TypeScript, Tailwind CSS 4 et styles du projet. Supabase fournit l’authentification, PostgreSQL et le stockage. L’hébergement public passe par Vercel. L’exploitation vise les offres gratuites. [Installation locale](../../README.md)

| Domaine | Source de référence |
| --- | --- |
| En-tête selon le rôle | [Composant commun](../../components/layout/app-header.tsx), [état de navigation](../../lib/navigation/header-state.ts) |
| Cours classiques et carte | [Cours](../../lib/courses), [carte](../../components/quest/course-roadmap.tsx) |
| Aventure illustrée | [Catalogue, scènes, quiz et reçus](../../lib/adventure) |
| Jeux et récompenses | [Moteurs et scores](../../lib/games), [vestiaire](../../lib/shop) |
| Classes et messagerie | [Gestion des séances](../../lib/classes), [conversations et reçus](../../lib/contact) |
| Base réellement appliquée | [Migrations et état de production](../../supabase/README.md) |

Les clients navigateur, serveur et de service se trouvent dans `lib/supabase/`. Les variables de service restent côté serveur. En cas d’évolution du schéma, partir de l’historique appliqué et des migrations versionnées. Pour vérifier un parcours, utiliser les [essais existants](../../scripts/README.md) et comparer la révision de l’alias Omega à celle du dépôt.
