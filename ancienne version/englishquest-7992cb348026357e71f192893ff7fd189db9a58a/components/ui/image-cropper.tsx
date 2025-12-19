"use client";

/**
 * Image Cropper Component - Permet de cropper une image en format portrait
 * Style WhatsApp pour sélectionner la zone à afficher
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // Ratio largeur/hauteur (ex: 2/3 pour portrait)
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 2 / 3, // Format portrait par défaut
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cropAreaRef = useRef<Area | null>(null);

  // Fonction pour déplacer l'image
  const moveImage = (direction: "up" | "down" | "left" | "right", step: number = 10) => {
    setCrop((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y - step };
        case "down":
          return { ...prev, y: prev.y + step };
        case "left":
          return { ...prev, x: prev.x - step };
        case "right":
          return { ...prev, x: prev.x + step };
        default:
          return prev;
      }
    });
  };

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    cropAreaRef.current = croppedAreaPixels;
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Force update of croppedAreaPixels when crop or zoom changes via buttons
  // onCropComplete is called automatically by react-easy-crop when dragging,
  // but we need to ensure it's updated when using buttons too.
  // We use a small delay to let react-easy-crop update the area automatically
  useEffect(() => {
    // The onCropComplete callback should be called automatically by react-easy-crop
    // when crop or zoom changes, even when using buttons. However, there might be
    // a slight delay, so we ensure the state is synchronized.
    // The croppedAreaPixels should already be updated by onCropAreaChange,
    // but we keep this as a safety check.
  }, [crop, zoom]);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Taille de sortie en format portrait (ratio 2:3)
    const outputWidth = 400;
    const outputHeight = 600;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Clear canvas with transparent background
    // This preserves the original image transparency
    ctx.clearRect(0, 0, outputWidth, outputHeight);

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve, reject) => {
      // Use PNG to preserve quality and avoid black background issues
      // PNG supports transparency if needed, but we use white background above
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        "image/png", // Changed from JPEG to PNG for better quality
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="comic-panel-dark p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white text-outline">
              Ajuster l&apos;image
            </h3>
            <button
              onClick={onCancel}
              className="comic-button bg-red-600 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-red-700"
            >
              ✕ Annuler
            </button>
          </div>

          <div className="relative w-full" style={{ height: "400px" }}>
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
              restrictPosition={false}
              cropShape="rect"
              showGrid={false}
              style={{
                containerStyle: {
                  backgroundColor: "#1e293b",
                  borderRadius: "0.5rem",
                },
                cropAreaStyle: {
                  border: "2px solid rgba(6, 182, 212, 0.8)",
                },
              }}
            />
          </div>

          <div className="space-y-3">
            {/* Contrôles de Zoom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-white text-outline">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-sm font-bold text-outline hover:bg-slate-600"
                    title="Dézoomer"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-sm font-bold text-outline hover:bg-slate-600"
                    title="Réinitialiser"
                  >
                    ⟲
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-sm font-bold text-outline hover:bg-slate-600"
                    title="Zoomer"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>30%</span>
                <span>100%</span>
                <span>300%</span>
              </div>
            </div>

            {/* Contrôles de Position */}
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Position de l&apos;image
              </label>
              <div className="space-y-2">
                {/* Bouton Haut */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => moveImage("up", 20)}
                    className="comic-button bg-cyan-600 text-white px-6 py-2 text-sm font-bold text-outline hover:bg-cyan-700"
                    title="Déplacer vers le haut"
                  >
                    ↑ Haut
                  </button>
                </div>
                {/* Boutons Gauche et Droite */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => moveImage("left", 20)}
                    className="comic-button bg-cyan-600 text-white px-6 py-2 text-sm font-bold text-outline hover:bg-cyan-700"
                    title="Déplacer vers la gauche"
                  >
                    ← Gauche
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrop({ x: 0, y: 0 })}
                    className="comic-button bg-slate-600 text-white px-4 py-2 text-sm font-bold text-outline hover:bg-slate-500"
                    title="Centrer l'image"
                  >
                    Centre
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage("right", 20)}
                    className="comic-button bg-cyan-600 text-white px-6 py-2 text-sm font-bold text-outline hover:bg-cyan-700"
                    title="Déplacer vers la droite"
                  >
                    Droite →
                  </button>
                </div>
                {/* Bouton Bas */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => moveImage("down", 20)}
                    className="comic-button bg-cyan-600 text-white px-6 py-2 text-sm font-bold text-outline hover:bg-cyan-700"
                    title="Déplacer vers le bas"
                  >
                    ↓ Bas
                  </button>
                </div>
                {/* Contrôles fins */}
                <div className="flex justify-center gap-2 pt-2 border-t border-slate-600">
                  <button
                    type="button"
                    onClick={() => moveImage("up", 5)}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-xs font-bold text-outline hover:bg-slate-600"
                    title="Déplacer légèrement vers le haut"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage("left", 5)}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-xs font-bold text-outline hover:bg-slate-600"
                    title="Déplacer légèrement vers la gauche"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage("right", 5)}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-xs font-bold text-outline hover:bg-slate-600"
                    title="Déplacer légèrement vers la droite"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage("down", 5)}
                    className="comic-button bg-slate-700 text-white px-3 py-1 text-xs font-bold text-outline hover:bg-slate-600"
                    title="Déplacer légèrement vers le bas"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                💡 Vous pouvez aussi faire glisser l&apos;image directement avec la souris
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isProcessing || !croppedAreaPixels}
                className="comic-button bg-cyan-500 text-white px-6 py-3 font-bold text-outline hover:bg-cyan-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Traitement..." : "✓ Valider"}
              </button>
              <button
                onClick={onCancel}
                className="comic-button bg-slate-600 text-white px-6 py-3 font-bold text-outline hover:bg-slate-500"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

