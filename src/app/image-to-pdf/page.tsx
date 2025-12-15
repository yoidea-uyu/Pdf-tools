"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import Link from "next/link";
import { FileDown, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { FileUploader } from "@/components/file-uploader";
import { SortableFileList } from "@/components/sortable-file-list";
import { ConfirmModal } from "@/components/confirm-modal";
import { processImageFile } from "@/utils/image-utils";
import { createPdfFromImages, downloadBlob, type PdfSettings, type PaperSize } from "@/utils/image-pdf-utils";
import { generateUUID } from "@/utils/uuid";
import type { ImageTaskItem } from "@/utils/types";

export default function ImageToPdfPage() {
  const [imageFiles, setImageFiles] = useState<ImageTaskItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    paperSize: "A4",
    margin: 0,
  });

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const newImageFiles: ImageTaskItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        try {
          const imageFile = await processImageFile(file, generateUUID());
          newImageFiles.push(imageFile);
        } catch (error) {
          setUploadError(
            (prev) =>
              `${prev ? prev + "\n" : ""}${file.name}の処理に失敗しました: ${
                error instanceof Error ? error.message : "不明なエラー"
              }`
          );
        }
      }

      if (newImageFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...newImageFiles]);
      }
    } catch (error) {
      setUploadError(
        `ファイルのアップロードに失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  const handleReorder = useCallback((items: ImageTaskItem[]) => {
    setImageFiles(items);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setImageFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleNewProjectClick = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleNewProjectConfirm = useCallback(() => {
    imageFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
    });
    
    setImageFiles([]);
    setUploadError(null);
    setUploadProgress(null);
    setShowConfirmModal(false);
  }, [imageFiles]);

  const handleNewProjectCancel = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleGeneratePdf = useCallback(async () => {
    if (imageFiles.length === 0) return;

    setIsGenerating(true);
    try {
      const pdfBlob = await createPdfFromImages(imageFiles, pdfSettings);
      const fileName = `images_${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlob(pdfBlob, fileName);
    } catch (error) {
      alert("PDFの生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  }, [imageFiles, pdfSettings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            画像からPDF
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            スマホで撮った板書やノートをPDF化できます
          </p>
        </header>

        <div className="space-y-6">
          {imageFiles.length === 0 && (
            <div className="space-y-4">
              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept="image/*"
                label="画像ファイルをアップロード"
                description="JPG、PNGなどの画像ファイルを選択してください"
                disabled={isUploading || isGenerating}
              />

              {isUploading && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        ファイルを処理中...
                      </p>
                      {uploadProgress && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          {uploadProgress.current} / {uploadProgress.total} ファイル
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        エラーが発生しました
                      </p>
                      <pre className="text-xs text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap">
                        {uploadError}
                      </pre>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      アップロード済み画像
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {imageFiles.length} 個の画像がアップロードされました
                    </p>
                  </div>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || imageFiles.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        PDF生成中...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        PDFを生成
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 ヒント: 画像をドラッグして順序を変更できます。
                  </p>
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    PDF設定
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        用紙サイズ
                      </label>
                      <select
                        value={pdfSettings.paperSize}
                        onChange={(e) =>
                          setPdfSettings((prev) => ({
                            ...prev,
                            paperSize: e.target.value as PaperSize,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Fit">画像サイズに合わせる</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        余白 (mm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={pdfSettings.margin}
                        onChange={(e) =>
                          setPdfSettings((prev) => ({
                            ...prev,
                            margin: Number(e.target.value),
                          }))
                        }
                        disabled={pdfSettings.paperSize === "Fit"}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <SortableFileList
                  items={imageFiles}
                  onReorder={handleReorder}
                  onDelete={handleDelete}
                  getItemLabel={(item) => item.file.name}
                  getItemPreview={(item) => item.previewUrl}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  さらに画像を追加する
                </p>
                <FileUploader
                  onFilesSelected={handleFilesSelected}
                  accept="image/*"
                  disabled={isUploading || isGenerating}
                />
              </div>

              {isUploading && uploadProgress && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        ファイルを処理中...
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {uploadProgress.current} / {uploadProgress.total} ファイル
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        エラーが発生しました
                      </p>
                      <pre className="text-xs text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap">
                        {uploadError}
                      </pre>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <button
                  onClick={handleNewProjectClick}
                  disabled={isUploading || isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="font-medium">次のプロジェクトを作成する</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  現在のプロジェクトをクリアして、新しい画像をアップロードできます
                </p>
              </div>
            </div>
          )}
        </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="プロジェクトをクリアしますか？"
        message="現在のプロジェクトがすべてクリアされます。この操作は取り消せません。"
        confirmText="クリアする"
        cancelText="キャンセル"
        onConfirm={handleNewProjectConfirm}
        onCancel={handleNewProjectCancel}
      />
      </div>
    </div>
  );
}

