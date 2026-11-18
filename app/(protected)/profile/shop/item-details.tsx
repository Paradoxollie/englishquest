"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GoldIcon, XIcon } from "@/components/ui/icons";
import { getLevelFromXP, XP_PER_LEVEL } from "@/lib/profile/economy";
import { COLLECTION_ALBUMS, getAlbumProgress, isCollectionItemAvailable, isPublicShopItem } from "@/lib/shop/collection";
import { formatGold } from "@/lib/shop/format-gold";
import type { ShopItem } from "@/types/shop";
import { equipItemAction, purchaseShopItemAction } from "./actions";
import { ItemArt, PlayerCard } from "./collection-art";
import { useWardrobe } from "./wardrobe-state";

export function ItemDetails({ item, onClose, openAlbum, openItem }: {
  item: ShopItem;
  onClose: () => void;
  openAlbum: (key: string) => void;
  openItem: (id: string) => void;
}) {
  const state = useWardrobe();
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [unlockedTitles, setUnlockedTitles] = useState<Pick<ShopItem, "id" | "name">[]>([]);
  const album = COLLECTION_ALBUMS.find(entry => entry.key === item.collection_key);
  const progress = album ? getAlbumProgress(state.items, state.ownedIds, state.level, album.key) : null;
  const worn = state.outfit[item.item_type]?.id === item.id;
  const available = worn || isCollectionItemAvailable(item, state.items, state.ownedIds, state.level);
  const missingGold = Math.max(0, item.price_gold - state.gold);
  const missingXp = Math.max(0, (item.required_level - 1) * XP_PER_LEVEL - state.xp);
  const needsLevel = state.level < item.required_level;
  const canBuy = isPublicShopItem(item) && !item.is_collection_reward && !needsLevel && !missingGold;
  const preview = { ...state.outfit, [item.item_type]: item };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function applyItem() {
    if (inFlight.current || state.unavailable || (!available && !canBuy)) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setNotice("");
    try {
      if (available) {
        const newItem = worn ? null : item.id;
        const result = await equipItemAction(newItem, item.item_type);
        if (!result.success) {
          setError(result.error || "L’équipement a échoué. Réessaie.");
          return;
        }
        state.equipped(item.item_type, newItem);
        setNotice(worn ? "L’objet a été retiré de ton équipement." : `Tu as équipé « ${item.name} ».`);
      } else {
        const result = await purchaseShopItemAction(item.id);
        if (!result.success) {
          setError(result.error || "L’achat a échoué. Réessaie.");
          return;
        }
        const titles = result.unlockedTitles ?? [];
        state.purchased([item.id, ...titles.map(title => title.id)], result.newGold ?? Math.max(0, state.gold - item.price_gold));
        setUnlockedTitles(titles);
        setNotice(`Tu as ajouté « ${item.name} » à ta collection.`);
      }
    } catch {
      setError("La réponse n’est pas arrivée. Réessaie pour vérifier l’opération.");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <dialog ref={dialog} className="wardrobe-dialog" aria-labelledby="wardrobe-detail-name"
      onClose={onClose} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
          onClose();
        }
      }}>
      <div className="wardrobe-dialog-head">
        <span>{item.item_type === "ship_skin" ? "Aperçu dans Lexicon Blaster" : "Aperçu sur ta carte"}</span>
        <button type="button" className="wardrobe-close" aria-label="Fermer l’aperçu" onClick={onClose} autoFocus><XIcon /></button>
      </div>
      <div className="wardrobe-dialog-grid">
        <div className="wardrobe-dialog-art">
          {item.item_type === "ship_skin" ? (
            <div className="wardrobe-flight"><ItemArt item={item} eager /></div>
          ) : (
            <PlayerCard outfit={preview} username={state.username} />
          )}
        </div>
        <div className="wardrobe-detail-body">
          {album && <span className="wardrobe-album-label">{album.name}</span>}
          <h2 id="wardrobe-detail-name">{item.name}</h2>
          {item.description && <p className="wardrobe-description">{item.description}</p>}
          {item.is_collection_reward && progress ? (
            <div className="wardrobe-detail-condition">
              <strong>Titre de fin d’album</strong>
              <p>{progress.owned} / {progress.total} pièces obtenues</p>
              {album && !progress.complete && <button type="button" className="wardrobe-text-link"
                onClick={() => openAlbum(album.key)}>Voir les pièces de cet album</button>}
            </div>
          ) : (
            <div className="wardrobe-detail-numbers">
              <span>{item.price_gold > 0 ? <><GoldIcon /> {formatGold(item.price_gold)}</> : "Offert"}</span>
              <span>Niveau {item.required_level}</span>
            </div>
          )}
          {!available && (needsLevel || missingGold > 0 && !item.is_collection_reward) && (
            <div className="wardrobe-detail-condition">
              {needsLevel && (missingXp > 0 && getLevelFromXP(state.xp) === state.level
                ? <p>Encore <b>{missingXp.toLocaleString("fr-FR")} XP</b> pour atteindre le niveau {item.required_level}.</p>
                : <p>Cet objet se débloque au niveau <b>{item.required_level}</b>. Tu es au niveau {state.level}.</p>
              )}
              {missingGold > 0 && !item.is_collection_reward && <p>Il te manque <b>{formatGold(missingGold)}</b>. Ta bourse contient {formatGold(state.gold)}.</p>}
              <Link className="wardrobe-text-link" href="/quest">Continuer mon aventure</Link>
            </div>
          )}
          {available || canBuy ? (
            <button type="button" onClick={applyItem} className={`eq-btn ${worn ? "eq-btn-ghost" : available ? "eq-btn-primary" : "eq-btn-gold"} wardrobe-apply`}
              disabled={pending || state.unavailable}>
              {pending ? "Enregistrement…" : worn ? "Retirer de mon équipement" : available ? "Équiper" : `Acheter pour ${formatGold(item.price_gold)}`}
            </button>
          ) : null}
          <div className="wardrobe-detail-feedback">
            {error && <p role="alert">{error}</p>}
            <p role="status" aria-live="polite">{notice}</p>
            {unlockedTitles.map(title => (
              <div key={title.id} className="wardrobe-title-gift">
                <p role="status">Album complété ! Tu as gagné le titre <strong>{title.name}</strong>.</p>
                <button type="button" className="wardrobe-text-link" onClick={() => openItem(title.id)}>Essayer le titre</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
}
