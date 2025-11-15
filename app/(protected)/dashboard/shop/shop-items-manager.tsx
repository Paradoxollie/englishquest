"use client";

/**
 * Shop Items Manager - Gestion des items de la boutique (avatars, titres, backgrounds)
 */

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ShopItem } from "@/types/shop";
import { uploadShopItemImageAction, updateShopItemAction, createShopItemAction } from "./actions";
import { ImageCropper } from "@/components/ui/image-cropper";

export function ShopItemsManager() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"avatar" | "title" | "background">("avatar");
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
    const supabase = createSupabaseBrowserClient();
    const { data: items } = await supabase
      .from("shop_items")
      .select("*")
      .eq("item_type", selectedType)
      .order("display_order");

    if (items) setShopItems(items as ShopItem[]);
    setLoading(false);
  }

  const handleFileSelect = (itemId: string, file: File) => {
    console.log("handleFileSelect called:", { itemId, fileName: file.name, fileSize: file.size, fileType: file.type, selectedType });
    
    // Only allow upload for avatars and backgrounds, not titles
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
      const file = new File([blob], "cropped-avatar.jpg", { type: "image/jpeg" });

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
      URL.revokeObjectURL(croppingImageUrl);
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

  const filteredItems = shopItems.filter((item) => item.item_type === selectedType);

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="comic-panel bg-red-600 border-2 border-black p-4 text-white text-outline">
          {error}
        </div>
      )}
      {success && (
        <div className="comic-panel bg-green-600 border-2 border-black p-4 text-white text-outline">
          {success}
        </div>
      )}

      {/* Type Selector */}
      <div className="comic-panel-dark p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {(["avatar", "title", "background"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setEditingItem(null);
                  setShowCreateForm(false);
                }}
                className={`comic-button px-6 py-2 font-bold text-outline ${
                  selectedType === type
                    ? "bg-cyan-500 text-white border-4 border-black"
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
              >
                {type === "avatar" ? "Avatars" : type === "title" ? "Titres" : "Backgrounds"}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingItem(null);
            }}
            className="comic-button bg-emerald-500 text-white px-6 py-2 font-bold text-outline hover:bg-emerald-600"
          >
            + Créer un {selectedType === "avatar" ? "Avatar" : selectedType === "title" ? "Titre" : "Background"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="comic-panel-dark p-6">
          <h3 className="text-xl font-bold text-white text-outline mb-4">
            Créer un nouveau {selectedType}
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await handleCreateItem(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Nom
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Description
              </label>
              <textarea
                name="description"
                className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white text-outline mb-2">
                  Prix (or)
                </label>
                <input
                  type="number"
                  name="price_gold"
                  required
                  min="0"
                  defaultValue="0"
                  className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white text-outline mb-2">
                  Niveau requis
                </label>
                <input
                  type="number"
                  name="required_level"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="comic-button bg-cyan-500 text-white px-6 py-2 font-bold text-outline hover:bg-cyan-600"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="comic-button bg-slate-600 text-white px-6 py-2 font-bold text-outline hover:bg-slate-500"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="comic-panel-dark p-8 text-center">
          <p className="text-slate-300 text-outline">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="comic-panel border-2 border-black p-4 bg-slate-800"
            >
              <div className="space-y-3">
                {/* Item Preview - Format portrait pour avatars/backgrounds, texte pour titres */}
                {selectedType === "title" ? (
                  <div className="flex items-center justify-center rounded-lg border-2 border-black bg-slate-900 p-4 min-h-[120px]">
                    <span className="text-2xl font-bold text-cyan-400 text-outline text-center">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border-2 border-black bg-slate-900 overflow-hidden" style={{ aspectRatio: "2/3", width: "100%" }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.color_theme ? (
                      <div className={`w-full h-full ${getItemColor(item.color_theme)}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Item Info */}
                <div>
                  <h3 className="font-bold text-white text-outline text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-300 text-outline mt-1">{item.description}</p>
                  )}
                  <div className="mt-2 text-xs text-slate-400 text-outline">
                    <div>Prix: {item.price_gold} or</div>
                    <div>Niveau requis: {item.required_level}</div>
                    <div>Ordre: {item.display_order}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {/* Upload Image - Only for avatars and backgrounds */}
                  {selectedType !== "title" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          console.log("File selected:", file?.name, file?.size, file?.type);
                          if (file) {
                            handleFileSelect(item.id, file);
                          } else {
                            console.log("No file selected");
                          }
                        }}
                        className="hidden"
                        id={`upload-${item.id}`}
                        disabled={uploading === item.id || !!croppingImage}
                      />
                      <label
                        htmlFor={`upload-${item.id}`}
                        className={`comic-button w-full text-center px-4 py-2 text-sm font-bold text-outline ${
                          uploading === item.id || croppingImage
                            ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                            : "bg-purple-500 text-white hover:bg-purple-600 cursor-pointer"
                        }`}
                      >
                        {uploading === item.id ? "Upload..." : croppingImage ? "Traitement..." : "📤 Upload Image"}
                      </label>
                      {uploading === item.id && (
                        <p className="text-xs text-slate-400 mt-1">Upload en cours...</p>
                      )}
                    </div>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Edit button clicked for item:", item.id);
                      setEditingItem(item);
                      setShowCreateForm(false);
                    }}
                    className="comic-button w-full bg-cyan-500 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-cyan-600 active:bg-cyan-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      {editingItem && (
        <div className="comic-panel-dark p-6 border-4 border-cyan-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white text-outline">
              Modifier {editingItem.name}
            </h3>
            <button
              onClick={() => {
                console.log("Closing edit form");
                setEditingItem(null);
              }}
              className="comic-button bg-red-600 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-red-700"
            >
              ✕ Fermer
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
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Nom
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={editingItem.name}
                className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingItem.description || ""}
                className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white text-outline mb-2">
                  Prix (or)
                </label>
                <input
                  type="number"
                  name="price_gold"
                  required
                  min="0"
                  defaultValue={editingItem.price_gold}
                  className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white text-outline mb-2">
                  Niveau requis
                </label>
                <input
                  type="number"
                  name="required_level"
                  required
                  min="1"
                  defaultValue={editingItem.required_level}
                  className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                name="display_order"
                required
                defaultValue={editingItem.display_order}
                className="w-full comic-panel bg-slate-800 border-2 border-black p-3 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="comic-button bg-cyan-500 text-white px-6 py-2 font-bold text-outline hover:bg-cyan-600"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="comic-button bg-slate-600 text-white px-6 py-2 font-bold text-outline hover:bg-slate-500"
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

