"use client";

/**
 * Shop Items Manager - Gestion des items de la boutique (avatars, titres, backgrounds)
 */

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { COLLECTION_ALBUMS } from "@/lib/shop/collection";
import { isCustomItemKey } from "@/lib/shop/visibility";
import { formatGold } from "@/lib/shop/format-gold";
import type { ShopItem } from "@/types/shop";
import { uploadShopItemImageAction, updateShopItemAction, createShopItemAction, getShopItemsAction } from "./actions";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import { ImageCropper } from "@/components/ui/image-cropper";

export function ShopItemsManager() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"avatar" | "title" | "background" | "ship_skin">("avatar");
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ itemId: string; imageUrl: string } | null>(null);
  const editor = useRef<HTMLFormElement>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let current = true;
    async function loadItems() {
      setLoading(true);
      try {
        const result = await getShopItemsAction(selectedType);
        if (!current) return;
        if (!result.success) throw new Error(result.error || "Impossible de charger les pièces.");
        setShopItems(result.items ?? []);
      } catch (reason) {
        if (!current) return;
        setError(reason instanceof Error ? reason.message : "Impossible de charger les pièces.");
        setShopItems([]);
      } finally {
        if (current) setLoading(false);
      }
    }
    void loadItems();
    return () => { current = false; };
  }, [selectedType, revision]);

  useEffect(() => {
    if (editingItem) editor.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus();
  }, [editingItem]);

  const handleFileSelect = (itemId: string, file: File) => {
    // Only allow upload for avatars, backgrounds, and ship_skins, not titles
    if (selectedType === "title") {
      setError("Les titres ne nécessitent pas d'image, seulement du texte");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      setCroppingImage({ itemId, imageUrl: objectUrl });
    };
    
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      setError("Erreur lors du chargement de l'image");
      URL.revokeObjectURL(objectUrl);
    };
    
    img.src = objectUrl;
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!croppingImage) {
      URL.revokeObjectURL(croppedImageUrl);
      return;
    }

    setUploading(croppingImage.itemId);
    setCroppingImage(null);
    setError(null);
    setSuccess(null);

    try {
      // Convert cropped image URL to File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "illustration.webp", { type: blob.type });

      const result = await uploadShopItemImageAction(croppingImage.itemId, file);

      if (result.success) {
        setSuccess("Illustration enregistrée.");
        setRevision(value => value + 1);
      } else {
        const errorMsg = result.error || "Erreur lors de l'upload";
        setError(errorMsg);
        console.error("Upload failed:", errorMsg);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Erreur inattendue lors de l'upload");
    } finally {
      setUploading(null);
      URL.revokeObjectURL(croppingImage.imageUrl);
      URL.revokeObjectURL(croppedImageUrl);
    }
  };

  const handleUpdateItem = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await updateShopItemAction(formData);

      if (result.success) {
        setSuccess("Pièce mise à jour.");
        setEditingItem(null);
        setRevision(value => value + 1);
      } else {
        const errorMsg = result.error || "Erreur lors de la mise à jour";
        setError(errorMsg);
        console.error("Update failed:", errorMsg);
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Erreur inattendue lors de la mise à jour");
    }
  };

  const handleCreateItem = async (formData: FormData) => {
    formData.append("item_type", selectedType);
    setError(null);
    setSuccess(null);

    const result = await createShopItemAction(formData);

    if (result.success) {
      setSuccess("Pièce créée.");
      setShowCreateForm(false);
      setRevision(value => value + 1);
    } else {
      setError(result.error || "Erreur lors de la création");
    }
  };

  const filteredItems = showArchived ? shopItems : shopItems.filter(item => item.is_active && item.is_public !== false);
  const imageRatio = selectedType === "background" ? 1.5 : selectedType === "ship_skin" ? 76 / 92 : 1;

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-[var(--pro-radius)] border border-[var(--pro-error)] bg-[var(--pro-error-soft)] p-4 text-sm font-semibold text-[var(--pro-error)]">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[var(--pro-radius)] border border-[var(--pro-success)] bg-[var(--pro-success-soft)] p-4 text-sm font-semibold text-[var(--pro-success)]">
          {success}
        </div>
      )}

      {/* Type Selector */}
      <div className="eq-card p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(["avatar", "title", "background", "ship_skin"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setError(null);
                  setSuccess(null);
                  setEditingItem(null);
                  setShowCreateForm(false);
                }}
                className={`eq-btn eq-btn-sm ${
                  selectedType === type ? "eq-btn-primary" : "eq-btn-ghost"
                }`}
              >
                {type === "avatar" ? "Personnages" : type === "title" ? "Titres" : type === "background" ? "Décors" : "Vaisseaux"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(true);
              setEditingItem(null);
            }}
            className="eq-btn eq-btn-mint eq-btn-sm"
          >
            Ajouter une pièce
          </button>
        </div>
      </div>

      <label className="eq-muted inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />
        Inclure les pièces archivées et privées
      </label>

      {/* Create Form */}
      {showCreateForm && (
        <div className="eq-card p-6">
          <h3 className="eq-h3 mb-4">Nouvelle pièce</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCreateItem(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="shop-field-name" className="block text-sm font-bold mb-1.5">Nom</label>
              <input
                type="text"
                id="shop-field-name" name="name"
                required
                className="eq-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="shop-field-description" className="block text-sm font-bold mb-1.5">Description</label>
              <textarea
                id="shop-field-description" name="description"
                className="eq-input w-full px-3.5 py-2.5 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shop-field-price_gold" className="block text-sm font-bold mb-1.5">Prix (or)</label>
                <input
                  type="number"
                  id="shop-field-price_gold" name="price_gold"
                  required
                  min="0"
                  defaultValue="0"
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="shop-field-required_level" className="block text-sm font-bold mb-1.5">Niveau requis</label>
                <input
                  type="number"
                  id="shop-field-required_level" name="required_level"
                  required
                  min="1"
                  defaultValue="1"
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <AlbumSettings />
            <div className="flex gap-3">
              <button type="submit" className="eq-btn eq-btn-primary">
                Créer
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="eq-btn eq-btn-ghost"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="eq-card p-8 text-center">
          <p className="eq-muted font-medium">Chargement…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="eq-card p-4 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                {selectedType === "title" ? (
                  <div className="eq-shop-title-plate min-h-[120px]">
                    <span>{item.name}</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-[var(--pro-radius)] border border-[var(--pro-border)] bg-[var(--pro-surface-2)] overflow-hidden"
                    style={{ aspectRatio: imageRatio, width: "100%", maxHeight: "15rem" }}
                  >
                    {item.image_url ? (
                      <NextImage
                        src={addCacheBustingIfSupabase(item.image_url)}
                        alt=""
                        unoptimized={!item.image_url.startsWith("/art/collection/")}
                        width={408} height={Math.round(408 / imageRatio)} sizes="(max-width: 767px) 90vw, 330px"
                        className={selectedType === "ship_skin" ? "w-full h-full object-contain" : "w-full h-full object-cover"}
                      />
                    ) : item.color_theme ? (
                      <div className={`w-full h-full ${getItemColor(item.color_theme)}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="eq-h3">{item.name}</h3>
                  {item.description && (
                    <p className="eq-muted text-sm mt-1">{item.description}</p>
                  )}
                  <div className="eq-muted mt-2 text-xs space-y-0.5 font-medium">
                    <div>{COLLECTION_ALBUMS.find(album => album.key === item.collection_key)?.name ?? "Hors album"}{item.is_collection_reward ? " · Titre d’album" : ""}{!item.is_active || item.is_public === false ? " · Hors catalogue" : ""}</div>
                    <div>{formatGold(item.price_gold)}</div>
                    <div>Niveau requis : {item.required_level}</div>
                    <div>Ordre : {item.display_order}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedType !== "title" && (
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) {
                          handleFileSelect(item.id, file);
                        }
                      }}
                      className="hidden"
                      id={`upload-${item.id}`}
                      disabled={uploading === item.id || !!croppingImage}
                    />
                    <label
                      htmlFor={`upload-${item.id}`}
                      className={`eq-btn eq-btn-sm w-full cursor-pointer ${
                        uploading === item.id || croppingImage ? "eq-btn-ghost opacity-50" : "eq-btn-gold"
                      }`}
                    >
                      {uploading === item.id ? "Enregistrement…" : croppingImage ? "Recadrage…" : "Changer l’illustration"}
                    </label>
                    {uploading === item.id && (
                      <p className="eq-muted text-xs mt-1">Enregistrement en cours…</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingItem(item);
                    setShowCreateForm(false);
                  }}
                  className="eq-btn eq-btn-primary eq-btn-sm w-full"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      {editingItem && (
        <div className="eq-card p-6 border-2 border-[var(--pro-primary)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--pro-border)] pb-3 mb-4">
            <h3 className="eq-h3">Modifier {editingItem.name}</h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="eq-btn eq-btn-ghost eq-btn-sm"
            >
              Fermer
            </button>
          </div>
          <form key={editingItem.id} ref={editor}
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleUpdateItem(formData);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="itemId" value={editingItem.id} />
            <AlbumSettings item={editingItem} />
            <div>
              <label htmlFor="shop-field-name" className="block text-sm font-bold mb-1.5">Nom</label>
              <input
                type="text"
                id="shop-field-name" name="name"
                required
                defaultValue={editingItem.name}
                className="eq-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="shop-field-description" className="block text-sm font-bold mb-1.5">Description</label>
              <textarea
                id="shop-field-description" name="description"
                defaultValue={editingItem.description || ""}
                className="eq-input w-full px-3.5 py-2.5 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shop-field-price_gold" className="block text-sm font-bold mb-1.5">Prix (or)</label>
                <input
                  type="number"
                  id="shop-field-price_gold" name="price_gold"
                  required
                  min="0"
                  defaultValue={editingItem.price_gold}
                  readOnly={editingItem.is_collection_reward}
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="shop-field-required_level" className="block text-sm font-bold mb-1.5">Niveau requis</label>
                <input
                  type="number"
                  id="shop-field-required_level" name="required_level"
                  required
                  min="1"
                  defaultValue={editingItem.required_level}
                  readOnly={editingItem.is_collection_reward}
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="shop-field-display_order" className="block text-sm font-bold mb-1.5">Ordre d&apos;affichage</label>
              <input
                type="number"
                id="shop-field-display_order" name="display_order"
                required
                defaultValue={editingItem.display_order}
                className="eq-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="eq-btn eq-btn-primary">
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="eq-btn eq-btn-ghost"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Cropper Modal */}
      {croppingImage && (
        <ImageCropper
          image={croppingImage.imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCroppingImage(null);
            URL.revokeObjectURL(croppingImage.imageUrl);
          }}
          aspectRatio={imageRatio}
          outputWidth={selectedType === "background" ? 760 : selectedType === "ship_skin" ? 252 : 408}
        />
      )}
    </div>
  );
}

function AlbumSettings({ item }: { item?: ShopItem }) {
  if (item?.owner_user_id || (item && isCustomItemKey(item.item_key))) return null;
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {item?.is_collection_reward ? (
        <p className="eq-muted text-sm">Ce titre est offert quand l’album est complet.</p>
      ) : (
        <div className="grid gap-1.5 text-sm font-bold">
          <label htmlFor="shop-album">Album</label>
          <select id="shop-album" name="collection_key" defaultValue={item?.collection_key ?? ""} className="eq-input px-3 py-2">
            <option value="">Hors album</option>
            {COLLECTION_ALBUMS.map(album => <option key={album.key} value={album.key}>{album.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid gap-1.5 text-sm font-bold">
        <label htmlFor="shop-visibility">Disponibilité</label>
        <select id="shop-visibility" name="shop_visibility" defaultValue={item && (item.is_public === false || !item.is_active) ? "archive" : "public"} className="eq-input px-3 py-2">
          <option value="public">Visible dans le catalogue</option>
          <option value="archive">Réservée à ses propriétaires</option>
        </select>
      </div>
    </div>
  );
}

function getItemColor(theme: string | null) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    gold: "bg-yellow-500",
    dark: "bg-slate-800",
    slate: "bg-slate-600",
    cyan: "bg-cyan-500",
  };
  return colors[theme || "slate"] || "bg-slate-500";
}

