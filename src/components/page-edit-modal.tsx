"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { generateAllPageThumbnails } from "@/utils/pdf-utils";
import type { PdfFile } from "@/utils/types";

interface PageEditModalProps {
  pdfFile: PdfFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, excludedPageIndices: number[]) => void;
}

export function PageEditModal({
  pdfFile,
  isOpen,
  onClose,
  onSave,
}: PageEditModalProps) {
  const [excludedPages, setExcludedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && pdfFile) {
      setExcludedPages(new Set(pdfFile.excludedPageIndices));
      
      const loadThumbnails = async () => {
        setLoading(true);
        try {
          const thumbnailUrls = await generateAllPageThumbnails(pdfFile.file);
          setThumbnails(thumbnailUrls);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };

      loadThumbnails();
    } else {
      setThumbnails([]);
      setExcludedPages(new Set());
    }
  }, [isOpen, pdfFile]);

  const togglePage = (pageIndex: number) => {
    const newExcluded = new Set(excludedPages);
    if (newExcluded.has(pageIndex)) {
      newExcluded.delete(pageIndex);
    } else {
      newExcluded.add(pageIndex);
    }
    setExcludedPages(newExcluded);
  };

  const handleSave = () => {
    if (pdfFile) {
      onSave(pdfFile.id, Array.from(excludedPages));
      onClose();
    }
  };

  const handleClose = () => {
    thumbnails.forEach((url) => URL.revokeObjectURL(url));
    onClose();
  };

  if (!isOpen || !pdfFile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ページ編集: {pdfFile.fileName}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">
                ページを読み込み中...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {thumbnails.map((thumbnailUrl, index) => {
                const isExcluded = excludedPages.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => togglePage(index)}
                    className={cn(
                      "relative aspect-[3/4] rounded border-2 transition-all",
                      isExcluded
                        ? "border-red-500 opacity-50 grayscale"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-500"
                    )}
                  >
                    <img
                      src={thumbnailUrl}
                      alt={`ページ ${index + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                    {isExcluded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                        <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                          除外
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {excludedPages.size > 0
              ? `${excludedPages.size} ページが除外されます`
              : "すべてのページが含まれます"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

