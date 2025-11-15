"use client";

/**
 * Image Cropper Component - Permet de cropper une image en format portrait
 * Style WhatsApp pour sélectionner la zone à afficher
 */

import { useState, useCallback } from "react";
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

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        "image/jpeg",
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
              style={{
                containerStyle: {
                  backgroundColor: "#1e293b",
                  borderRadius: "0.5rem",
                },
              }}
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-white text-outline mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
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

