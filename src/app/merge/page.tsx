"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { FileDown, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { PdfUploadZone } from "@/components/pdf-upload-zone";
import { PdfList } from "@/components/pdf-list";
import { PageEditModal } from "@/components/page-edit-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { processPdfFile, mergePdfs, downloadBlob } from "@/utils/pdf-utils";
import { generateUUID } from "@/utils/uuid";
import type { PdfFile } from "@/utils/types";
import Link from "next/link";

export default function MergePage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const newPdfFiles: PdfFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        try {
          const pdfFile = await processPdfFile(file, generateUUID());
          newPdfFiles.push(pdfFile);
        } catch (error) {
          setUploadError(
            (prev) =>
              `${prev ? prev + "\n" : ""}${file.name}の処理に失敗しました: ${
                error instanceof Error ? error.message : "不明なエラー"
              }`
          );
        }
      }

      if (newPdfFiles.length > 0) {
        setPdfFiles((prev) => [...prev, ...newPdfFiles]);
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

  const handleDelete = useCallback((id: string) => {
    setPdfFiles((prev) => {
      const fileToDelete = prev.find((f) => f.id === id);
      if (fileToDelete) {
        URL.revokeObjectURL(fileToDelete.thumbnailUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingPdfId(id);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string, excludedPageIndices: number[]) => {
      setPdfFiles((prev) =>
        prev.map((file) =>
          file.id === id
            ? { ...file, excludedPageIndices }
            : file
        )
      );
      setEditingPdfId(null);
    },
    []
  );

  const handleReorder = useCallback((newFiles: PdfFile[]) => {
    setPdfFiles(newFiles);
  }, []);

  const handleNewProjectClick = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleNewProjectConfirm = useCallback(() => {
    pdfFiles.forEach((file) => {
      URL.revokeObjectURL(file.thumbnailUrl);
    });
    
    setPdfFiles([]);
    setEditingPdfId(null);
    setUploadError(null);
    setUploadProgress(null);
    setShowConfirmModal(false);
  }, [pdfFiles]);

  const handleNewProjectCancel = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleMerge = useCallback(async () => {
    if (pdfFiles.length === 0) return;

    setIsMerging(true);
    try {
      const mergedBlob = await mergePdfs(pdfFiles);
      const fileName = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlob(mergedBlob, fileName);
    } catch (error) {
      alert("PDFの結合に失敗しました。もう一度お試しください。");
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles]);

  const editingPdf = pdfFiles.find((f) => f.id === editingPdfId) || null;

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
            PDF結合
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            複数のPDFファイルをアップロードし、並べ替えて結合できます
          </p>
        </header>

        <div className="space-y-6">
          {pdfFiles.length === 0 && (
            <div className="space-y-4">
              <PdfUploadZone
                onFilesSelected={handleFilesSelected}
                disabled={isUploading || isMerging}
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

          {pdfFiles.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      アップロード済みファイル
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {pdfFiles.length} 個のファイルがアップロードされました
                    </p>
                  </div>
                  <button
                    onClick={handleMerge}
                    disabled={isMerging || pdfFiles.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isMerging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        結合中...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        結合する
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 ヒント: ファイルをドラッグして順序を変更できます。各ファイルの「編集」ボタンから不要なページを除外できます。
                  </p>
                </div>

                <PdfList
                  pdfFiles={pdfFiles}
                  onReorder={handleReorder}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  さらにファイルを追加する
                </p>
                <PdfUploadZone
                  onFilesSelected={handleFilesSelected}
                  disabled={isUploading || isMerging}
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
                  disabled={isUploading || isMerging}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="font-medium">次のプロジェクトを作成する</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  現在のプロジェクトをクリアして、新しいPDFファイルを結合できます
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PageEditModal
        pdfFile={editingPdf}
        isOpen={editingPdf !== null}
        onClose={() => setEditingPdfId(null)}
        onSave={handleSaveEdit}
      />

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
  );
}

