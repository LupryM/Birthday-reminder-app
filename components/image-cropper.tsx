"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { X, Check, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Apply transformations
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-size / 2 + position.x / 2, -size / 2 + position.y / 2);

    const img = imageRef.current;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth = size;
    let drawHeight = size;

    if (aspectRatio > 1) {
      drawHeight = size;
      drawWidth = size * aspectRatio;
    } else {
      drawWidth = size;
      drawHeight = size / aspectRatio;
    }

    const offsetX = (size - drawWidth) / 2;
    const offsetY = (size - drawHeight) / 2;

    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      "image/png",
      1.0
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="p-2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </motion.button>
        <span className="text-foreground font-semibold">Crop Photo</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCrop}
          className="p-2 text-primary hover:text-primary/80 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Check className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Crop area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Image */}
        <div
          className="relative cursor-move"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc || "/placeholder.svg"}
            alt="Crop preview"
            className="max-w-[80vw] max-h-[60vh] object-contain pointer-events-none"
            crossOrigin="anonymous"
          />
        </div>

        {/* Circular overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id="circleMask">
                <rect width="100%" height="100%" fill="white" />
                <circle cx="50%" cy="50%" r="120" fill="black" />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.7)"
              mask="url(#circleMask)"
            />
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="none"
              stroke="#32cd32"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4 bg-card border-t border-border">
        {/* Zoom */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-3 bg-secondary rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ZoomOut className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1 h-1 bg-secondary rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((scale - 0.5) / 1.5) * 100}%` }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="p-3 bg-secondary rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ZoomIn className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>

        {/* Rotate */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-secondary rounded-xl text-foreground min-h-[44px]"
        >
          <RotateCw className="w-5 h-5" />
          <span>Rotate</span>
        </motion.button>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
