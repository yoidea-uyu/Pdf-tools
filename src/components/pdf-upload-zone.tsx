"use client";

import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/utils/cn";

interface PdfUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function PdfUploadZone({
  onFilesSelected,
  disabled = false,
}: PdfUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf"
      );

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        (file) => file.type === "application/pdf"
      );

      if (files.length > 0) {
        onFilesSelected(files);
      }

      e.target.value = "";
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        id="pdf-upload"
        accept="application/pdf"
        multiple
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
      <label
        htmlFor="pdf-upload"
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isDragging ? (
            <FileText className="w-12 h-12 mb-4 text-blue-500" />
          ) : (
            <Upload className="w-12 h-12 mb-4 text-gray-400" />
          )}
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">クリックしてファイルを選択</span>
            またはドラッグ＆ドロップ
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDFファイルのみ対応
          </p>
        </div>
      </label>
    </div>
  );
}

