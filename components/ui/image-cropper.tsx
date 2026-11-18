"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  outputWidth?: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 2 / 3,
  outputWidth = 400,
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

    const outputHeight = Math.round(outputWidth / aspectRatio);

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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        "image/webp",
        0.92
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="eq-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--pro-border)] pb-3">
            <h3 className="eq-h3">Ajuster l&apos;image</h3>
            <button
              type="button"
              onClick={onCancel}
              className="eq-btn eq-btn-ghost eq-btn-sm"
            >
              Annuler
            </button>
          </div>

          <div className="relative w-full overflow-hidden rounded-[var(--pro-radius)] border border-[var(--pro-border)]" style={{ height: "400px" }}>
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
                  backgroundColor: "var(--pro-surface-2)",
                  borderRadius: "var(--pro-radius)",
                },
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="shop-image-zoom" className="block text-sm font-bold mb-2">
                Zoom : {Math.round(zoom * 100)}%
              </label>
              <input
                id="shop-image-zoom"
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
                type="button"
                onClick={handleSave}
                disabled={isProcessing || !croppedAreaPixels}
                className="eq-btn eq-btn-primary flex-1"
              >
                {isProcessing ? "Traitement…" : "Valider"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="eq-btn eq-btn-ghost"
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

