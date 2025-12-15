"use client";

import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/utils/cn";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function FileUploader({
  onFilesSelected,
  accept = "application/pdf",
  disabled = false,
  label,
  description,
}: FileUploaderProps) {
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

      const files = Array.from(e.dataTransfer.files).filter((file) => {
        if (accept === "application/pdf") {
          return file.type === "application/pdf";
        } else if (accept === "image/*") {
          return file.type.startsWith("image/");
        }
        return true;
      });

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled, accept]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) => {
        if (accept === "application/pdf") {
          return file.type === "application/pdf";
        } else if (accept === "image/*") {
          return file.type.startsWith("image/");
        }
        return true;
      });

      if (files.length > 0) {
        onFilesSelected(files);
      }

      e.target.value = "";
    },
    [onFilesSelected, accept]
  );

  const acceptLabel =
    accept === "application/pdf"
      ? "PDFファイルのみ対応"
      : accept === "image/*"
      ? "画像ファイル（JPG/PNG）のみ対応"
      : "ファイルを選択";

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
        id={`file-upload-${accept}`}
        accept={accept}
        multiple
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
      <label
        htmlFor={`file-upload-${accept}`}
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
          {label && (
            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </p>
          )}
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">クリックしてファイルを選択</span>
            またはドラッグ＆ドロップ
          </p>
          {description ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {acceptLabel}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}

