"use client";

import React, { useState } from 'react';
import { Camera, X, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { requestUploadUrl, uploadFileToS3 } from '../lib/api';

interface ImageUploaderProps {
  images: string[];
  onChangeImages: (urls: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChangeImages,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 3) {
      setErrorMsg('Máximo 3 imágenes por publicación.');
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('El archivo supera el tamaño máximo permitido de 5MB.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      // 1. Request S3 Pre-signed PUT URL from Lambda backend
      const presignedRes = await requestUploadUrl(file.type);

      if (presignedRes.uploadUrl && presignedRes.fileUrl) {
        // 2. Direct browser-to-S3 HTTP PUT upload
        const success = await uploadFileToS3(file, presignedRes.uploadUrl);

        if (success) {
          onChangeImages([...images, presignedRes.fileUrl]);
        } else {
          // Fallback simulation if S3 bucket URL unavailable
          const objectUrl = URL.createObjectURL(file);
          onChangeImages([...images, objectUrl]);
        }
      } else {
        // Local preview fallback
        const objectUrl = URL.createObjectURL(file);
        onChangeImages([...images, objectUrl]);
      }
    } catch (err) {
      console.warn('Upload error, fallback to local URL:', err);
      const objectUrl = URL.createObjectURL(file);
      onChangeImages([...images, objectUrl]);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChangeImages(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-300">
        Fotografías del Espacio (Opcional, máx 3 fotos)
      </label>

      {/* Thumbnails list */}
      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Vista previa ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow opacity-90 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < 3 && (
        <label className="touch-target border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-all">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-slate-400" />
          )}
          <span className="text-xs text-slate-300 font-medium">
            {isUploading ? 'Subiendo imagen a S3...' : 'Agregar foto desde mi dispositivo'}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
      )}
    </div>
  );
};
