"use client";

/**
 * Shop Items Manager - Gestion des items de la boutique (avatars, titres, backgrounds)
 */

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ itemId: string; imageUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, [selectedType]);

  async function loadItems() {
    setLoading(true);
    setError(null);
    
    try {
      // Use server action to bypass RLS (admin only)
      const result = await getShopItemsAction(selectedType);
      
      if (result.success && result.items) {
        console.log(`Loaded ${result.items.length} items of type ${selectedType}`);
        setShopItems(result.items);
      } else {
        console.error("Error loading shop items:", result.error);
        setError(result.error || "Erreur lors du chargement");
        setShopItems([]);
      }
    } catch (err) {
      console.error("Unexpected error loading items:", err);
      setError("Erreur inattendue lors du chargement");
      setShopItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = (itemId: string, file: File) => {
    console.log("handleFileSelect called:", { itemId, fileName: file.name, fileSize: file.size, fileType: file.type, selectedType });
    
    // Only allow upload for avatars, backgrounds, and ship_skins, not titles
    if (selectedType === "title") {
      setError("Les titres ne nécessitent pas d'image, seulement du texte");
      return;
    }

    // Load image to verify it's valid, then show cropper
    // The cropper will handle the portrait format automatically
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      console.log("Image loaded successfully:", { width: img.width, height: img.height });
      // No need to check if portrait - cropper will handle it
      // Show cropper - it will force portrait format (2:3 ratio)
      console.log("Opening cropper for item:", itemId);
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
    if (!croppingImage) return;

    setUploading(croppingImage.itemId);
    setError(null);
    setSuccess(null);

    try {
      // Convert cropped image URL to File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      // Use PNG to match the cropper output format
      const file = new File([blob], "cropped-avatar.png", { type: "image/png" });

      const result = await uploadShopItemImageAction(croppingImage.itemId, file);
      console.log("Upload result:", result);

      if (result.success) {
        setSuccess("Image uploadée avec succès !");
        await loadItems();
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
      setCroppingImage(null);
      URL.revokeObjectURL(croppedImageUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateItem = async (formData: FormData) => {
    const itemId = formData.get("itemId") as string;
    console.log("Updating item:", itemId, "FormData:", Object.fromEntries(formData.entries()));
    setError(null);
    setSuccess(null);

    try {
      const result = await updateShopItemAction(formData);
      console.log("Update result:", result);

      if (result.success) {
        setSuccess("Item mis à jour avec succès !");
        setEditingItem(null);
        await loadItems();
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
      setSuccess("Item créé avec succès !");
      setShowCreateForm(false);
      loadItems();
    } else {
      setError(result.error || "Erreur lors de la création");
    }
  };

  // No need to filter, items are already filtered by selectedType in the query
  const filteredItems = shopItems;

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
                  setEditingItem(null);
                  setShowCreateForm(false);
                }}
                className={`eq-btn eq-btn-sm ${
                  selectedType === type ? "eq-btn-primary" : "eq-btn-ghost"
                }`}
              >
                {type === "avatar" ? "Avatars" : type === "title" ? "Titres" : type === "background" ? "Arrière-plans" : "Skins de vaisseau"}
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
            + Créer ({selectedType === "avatar" ? "Avatar" : selectedType === "title" ? "Titre" : selectedType === "background" ? "Arrière-plan" : "Skin de vaisseau"})
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="eq-card p-6">
          <h3 className="eq-h3 mb-4">Créer un élément ({selectedType})</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCreateItem(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold mb-1.5">Nom</label>
              <input
                type="text"
                name="name"
                required
                className="eq-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">Description</label>
              <textarea
                name="description"
                className="eq-input w-full px-3.5 py-2.5 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1.5">Prix (or)</label>
                <input
                  type="number"
                  name="price_gold"
                  required
                  min="0"
                  defaultValue="0"
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Niveau requis</label>
                <input
                  type="number"
                  name="required_level"
                  required
                  min="1"
                  defaultValue="1"
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
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
                    style={{ aspectRatio: "2/3", width: "100%" }}
                  >
                    {item.image_url ? (
                      <img
                        src={addCacheBustingIfSupabase(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
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
                    <div>Prix : {item.price_gold} or</div>
                    <div>Niveau requis : {item.required_level}</div>
                    <div>Ordre : {item.display_order}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedType !== "title" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
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
                      {uploading === item.id ? "Upload…" : croppingImage ? "Traitement…" : "Uploader une image"}
                    </label>
                    {uploading === item.id && (
                      <p className="eq-muted text-xs mt-1">Upload en cours…</p>
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
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleUpdateItem(formData);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="itemId" value={editingItem.id} />
            <div>
              <label className="block text-sm font-bold mb-1.5">Nom</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={editingItem.name}
                className="eq-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">Description</label>
              <textarea
                name="description"
                defaultValue={editingItem.description || ""}
                className="eq-input w-full px-3.5 py-2.5 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold mb-1.5">Prix (or)</label>
                <input
                  type="number"
                  name="price_gold"
                  required
                  min="0"
                  defaultValue={editingItem.price_gold}
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Niveau requis</label>
                <input
                  type="number"
                  name="required_level"
                  required
                  min="1"
                  defaultValue={editingItem.required_level}
                  className="eq-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">Ordre d&apos;affichage</label>
              <input
                type="number"
                name="display_order"
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
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          aspectRatio={2 / 3}
        />
      )}
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

