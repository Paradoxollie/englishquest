import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { COLLECTION_ALBUMS, getAlbumProgress } from "@/lib/shop/collection";
import { formatGold } from "@/lib/shop/format-gold";
import { withNextParam } from "@/lib/navigation/safe-next";
import type { ShopItem } from "@/types/shop";
import { AlbumGallery } from "./album-gallery";
import "./collection.css";

export const metadata: Metadata = {
  title: "La collection de Maya et Sam",
  description: "Essaie les personnages, les décors et les vaisseaux d’English Quest. Découvre les pièces à gagner dans les quatre albums de Maya et Sam.",
  alternates: { canonical: "/collection" },
};

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ album?: string }> }) {
  const [params, user, db] = await Promise.all([searchParams, getServerUser(), createSupabaseServerClient()]);
  const album = COLLECTION_ALBUMS.find(entry => entry.key === params.album) ?? COLLECTION_ALBUMS[0];
  const [catalogue, holdings, profile] = await Promise.all([
    db.from("shop_items").select("*").eq("is_active", true).eq("is_public", true)
      .in("collection_key", COLLECTION_ALBUMS.map(entry => entry.key)).order("display_order"),
    user ? db.from("user_items").select("shop_item_id").eq("user_id", user.id) : null,
    user ? db.from("profiles").select("level,gold").eq("id", user.id).maybeSingle() : null,
  ]);
  const items = ((catalogue.data ?? []) as ShopItem[]).filter(item => !item.item_key.startsWith("custom_"));
  const pieces = items.filter(item => item.collection_key === album.key);
  const ownedIds = new Set<string>((holdings?.data ?? []).map(item => item.shop_item_id));
  const player = user && profile?.data && !holdings?.error ? { level: profile.data.level, gold: profile.data.gold } : null;
  const progress = getAlbumProgress(pieces, ownedIds, player?.level ?? 0, album.key);
  const wardrobeHref = user ? "/profile#boutique" : withNextParam("/auth/signup", "/profile#boutique");

  return (
    <div className="eq-container collection-page">
      <section className="collection-cover">
        <div className="collection-intro">
          <h1>La collection de <span>Maya et Sam</span></h1>
          <p>Essaie leurs tenues, choisis le décor de ta carte et découvre les vaisseaux à piloter dans Lexicon Blaster.</p>
          <div className="collection-cover-actions">
            <a className="eq-btn eq-btn-gold" href="#albums">Explorer les albums</a>
            <Link href={wardrobeHref} className="collection-text-link">{user ? "Mon vestiaire" : "Créer mon vestiaire"}</Link>
          </div>
        </div>
        <Image className="collection-cover-art" src="/art/collection/couverture.webp" alt="Maya et Sam préparent leur prochaine aventure dans leur atelier londonien." width={1400} height={780} sizes="(max-width: 700px) 100vw, 58vw" preload />
      </section>

      <section id="albums" className="collection-albums" aria-labelledby="collection-albums-heading">
        <div className="collection-section-heading">
          <h2 id="collection-albums-heading">Les albums</h2>
          {player ? <p>Niveau {player.level} · {formatGold(player.gold)}</p> : <p>Gagne de l’expérience pour débloquer des pièces et de l’or pour acheter tes préférées.</p>}
        </div>
        <nav aria-label="Choisir un album" className="collection-album-nav">
          {COLLECTION_ALBUMS.map(entry => (
            <Link key={entry.key} href={`/collection?album=${entry.key}#albums`} aria-current={entry.key === album.key ? "page" : undefined}>
              <Image src={entry.cover} width={160} height={106} alt="" sizes="76px" />
              <span>{entry.name}</span>
            </Link>
          ))}
        </nav>
        <section className={`collection-volume volume-${album.key}`} aria-labelledby="collection-volume-name">
          <div className="collection-volume-title">
            <div><h2 id="collection-volume-name">{album.name}</h2><p>{album.description}</p></div>
            {player && progress.total > 0 && <p className="collection-progress">{progress.owned} / {progress.total} pièces réunies</p>}
          </div>
          {pieces.length > 0 ? (
            <AlbumGallery key={album.key} pieces={pieces} ownedIds={[...ownedIds]} player={player} signedIn={Boolean(user)} />
          ) : (
            <div className="collection-unavailable" role="status">
              <p>Les pièces de cet album sont momentanément indisponibles.</p>
              <Link href={`/collection?album=${album.key}#albums`} className="collection-text-link">Recharger l’album</Link>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
