import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CharacterFigure } from "@/components/rewards/character-art";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { COLLECTION_ALBUMS, getAlbumProgress } from "@/lib/shop/collection";
import { formatGold } from "@/lib/shop/format-gold";
import { withNextParam } from "@/lib/navigation/safe-next";
import type { ShopItem } from "@/types/shop";
import { AlbumGallery } from "./album-gallery";
import { CharacterRoster } from "./character-roster";
import "./collection.css";

const featuredCharacters = {
  depart: "eq_depart_maya",
  enquete: "eq_enquete_sam",
  studio: "eq_studio_maya",
  aurore: "eq_aurore_zenith",
};

export const metadata: Metadata = {
  title: "Les personnages et les albums d’English Quest",
  description: "Rejoins Maya, Sam et les héros d’English Quest. Découvre les personnages à recruter, les décors et les vaisseaux à gagner dans quatre albums.",
  alternates: { canonical: "/collection" },
};

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ album?: string; personnage?: string }> }) {
  const [params, user, db] = await Promise.all([searchParams, getServerUser(), createSupabaseServerClient()]);
  const [catalogue, holdings, profile] = await Promise.all([
    db.from("shop_items").select("*").eq("is_active", true).eq("is_public", true)
      .in("collection_key", COLLECTION_ALBUMS.map(entry => entry.key)).order("display_order"),
    user ? db.from("user_items").select("shop_item_id").eq("user_id", user.id) : null,
    user ? db.from("profiles").select("level,gold").eq("id", user.id).maybeSingle() : null,
  ]);
  const items = ((catalogue.data ?? []) as ShopItem[]).filter(item => !item.item_key.startsWith("custom_"));
  const characters = items.filter(item => item.item_type === "avatar");
  const initialCharacter = characters.find(item => item.item_key === params.personnage);
  const album = COLLECTION_ALBUMS.find(entry => entry.key === (initialCharacter?.collection_key ?? params.album)) ?? COLLECTION_ALBUMS[0];
  const featured = COLLECTION_ALBUMS.flatMap(entry => {
    const cast = characters.filter(item => item.collection_key === entry.key);
    const member = cast.find(item => item.item_key === featuredCharacters[entry.key]) ?? cast[0];
    return member ? [member] : [];
  });
  const coverCast = featured.slice(1);
  const pieces = items.filter(item => item.collection_key === album.key);
  const ownedIds = new Set<string>((holdings?.data ?? []).map(item => item.shop_item_id));
  const player = user && profile?.data && !holdings?.error ? { level: profile.data.level, gold: profile.data.gold } : null;
  const progress = getAlbumProgress(pieces, ownedIds, player?.level ?? 0, album.key);
  const wardrobeHref = user ? "/profile#boutique" : withNextParam("/auth/signup", "/profile#boutique");

  return (
    <div className="eq-container collection-page">
      <section className="collection-cover">
        <div className="collection-intro">
          <h1>Recrute ton <span>équipe d’aventure</span></h1>
          <p>Maya et Sam t’attendent sur les quais. Gagne de l’expérience et de l’or pour recruter d’autres héros, choisir le décor de ta carte et piloter de nouveaux vaisseaux dans Lexicon Blaster.</p>
          <div className="collection-cover-actions">
            <a className="eq-btn eq-btn-gold" href="#personnages">Rencontrer les personnages</a>
            <a className="collection-text-link" href="#albums">Explorer les albums</a>
            <Link href={wardrobeHref} className="collection-text-link">{user ? "Mon vestiaire" : "Créer mon vestiaire"}</Link>
          </div>
        </div>
        {coverCast.length > 0 ? (
          <div className="collection-cover-troupe" role="img"
            aria-label={`${new Intl.ListFormat("fr").format(coverCast.map(item => item.name.split(",")[0]))} sur les quais de Londres.`}>
            <Image className="collection-cover-setting" src={COLLECTION_ALBUMS[0].cover} alt="" fill sizes="(max-width: 700px) 100vw, 58vw" preload />
            <div className="collection-cover-lineup">
              {coverCast.map(item => <span key={item.id}><CharacterFigure face={item.image_url} inCard eager /></span>)}
            </div>
          </div>
        ) : <Image className="collection-cover-art" src="/art/collection/couverture.webp" alt="Maya et Sam dans leur atelier londonien." width={1400} height={780} sizes="(max-width: 700px) 100vw, 58vw" preload />}
      </section>

      <CharacterRoster characters={characters} featuredIds={featured.map(item => item.id)} />

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
            <AlbumGallery key={`${album.key}/${initialCharacter?.id ?? ""}`} pieces={pieces} ownedIds={[...ownedIds]} player={player}
              signedIn={Boolean(user)} initialCharacterId={initialCharacter?.id} />
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
