import { PDFDocument } from "pdf-lib";
import type { PdfFile } from "./types";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("pdfjs-dist can only be used on the client side");
  }
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

export async function generateThumbnail(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.0 });
  const scale = Math.min(
    maxWidth / viewport.width,
    maxHeight / viewport.height
  );
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context could not be created");
  }

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
    canvas: canvas,
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      "image/png",
      0.95
    );
  });
}

export async function getPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

export async function generateAllPageThumbnails(
  file: File,
  maxWidth: number = 150,
  maxHeight: number = 150
): Promise<string[]> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const thumbnailUrls: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(
      maxWidth / viewport.width,
      maxHeight / viewport.height
    );
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context could not be created");
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    }).promise;

    const url = await new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error(`Failed to create blob for page ${pageNum}`));
          }
        },
        "image/png",
        0.95
      );
    });

    thumbnailUrls.push(url);
  }

  return thumbnailUrls;
}

export async function mergePdfs(pdfFiles: PdfFile[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);

    const totalPages = sourcePdf.getPageCount();
    const pagesToInclude = Array.from({ length: totalPages }, (_, i) => i).filter(
      (index) => !pdfFile.excludedPageIndices.includes(index)
    );

    const copiedPages = await mergedPdf.copyPages(sourcePdf, pagesToInclude);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function processPdfFile(
  file: File,
  id: string
): Promise<PdfFile> {
  const [thumbnailUrl, pageCount] = await Promise.all([
    generateThumbnail(file),
    getPageCount(file),
  ]);

  return {
    id,
    file,
    fileName: file.name,
    thumbnailUrl,
    pageCount,
    excludedPageIndices: [],
  };
}

