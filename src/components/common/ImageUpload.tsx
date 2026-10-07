"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { UploadFolder } from "@/lib/cloudinary";

interface ImageUploadProps {
  label?: string;
  sublabel?: string;
  folder?: UploadFolder;
  value?: string | null;
  onChange: (url: string | null) => void;
  aspectRatio?: "1:1" | "16:9" | "any";
  className?: string;
  previewHeight?: string;
}

export default function ImageUpload({
  label = "Upload Image",
  sublabel = "PNG, JPG, WEBP, or SVG up to 5MB",
  folder = "opportunities",
  value,
  onChange,
  aspectRatio = "any",
  className = "",
  previewHeight = "h-40",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploadSuccess(false);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file format. Please upload PNG, JPG, WEBP, or SVG.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getAspectClass = () => {
    if (aspectRatio === "1:1") return "aspect-square max-w-[160px]";
    if (aspectRatio === "16:9") return "aspect-video w-full";
    return previewHeight;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] font-semibold">
            {label}
          </label>
          {aspectRatio !== "any" && (
            <span className="text-[10px] font-mono text-[#7E807B]">
              Recommended: {aspectRatio}
            </span>
          )}
        </div>
      )}

      {value ? (
        <div className="space-y-2">
          <div className={`relative rounded-[14px] overflow-hidden bg-[#090B0B] border border-white/[0.12] group ${getAspectClass()}`}>
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Prevent infinite loop if broken
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
              }}
            />

            <div className="absolute inset-0 bg-black/60 opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-rose-500/80 text-white hover:bg-rose-600 transition-colors flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Visible actions bar for mobile / quick access */}
          <div className="flex sm:hidden items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[#D8B77A] font-mono hover:underline"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-rose-400 font-mono hover:underline flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Remove Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-[14px] border-2 border-dashed transition-all cursor-pointer p-6 flex flex-col items-center justify-center text-center ${
            dragOver
              ? "border-[#D8B77A] bg-[#D8B77A]/5"
              : "border-white/[0.12] hover:border-white/[0.25] bg-[#0E1110] hover:bg-[#111615]"
          } ${aspectRatio === "1:1" ? "aspect-square max-w-[160px] p-4" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
              <span className="text-xs text-[#D8B77A] font-mono">Uploading media...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D8B77A]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#F5F1E8]">
                  Click to upload or drag & drop
                </p>
                <p className="text-[10.5px] text-[#A9AAA5] mt-0.5 font-mono">
                  {sublabel}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center space-x-1.5 text-xs text-[#8FA58E] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Image uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}
