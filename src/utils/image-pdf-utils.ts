import { PDFDocument, rgb } from "pdf-lib";
import type { ImageTaskItem } from "./types";

export type PaperSize = "A4" | "Letter" | "Fit";

export interface PdfSettings {
  paperSize: PaperSize;
  margin: number;
}

function getPaperSizeInPoints(size: PaperSize): { width: number; height: number } {
  const mmToPt = 2.83465;
  
  switch (size) {
    case "A4":
      return { width: 210 * mmToPt, height: 297 * mmToPt };
    case "Letter":
      return { width: 215.9 * mmToPt, height: 279.4 * mmToPt };
    case "Fit":
      return { width: 0, height: 0 };
    default:
      return { width: 210 * mmToPt, height: 297 * mmToPt };
  }
}

function rotateImage(
  imageBytes: Uint8Array,
  rotation: 0 | 90 | 180 | 270
): Uint8Array {
  return imageBytes;
}

export async function createPdfFromImages(
  imageItems: ImageTaskItem[],
  settings: PdfSettings = { paperSize: "A4", margin: 0 }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const item of imageItems) {
    const arrayBuffer = await item.file.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    const isJpg = item.file.type === "image/jpeg" || item.file.name.toLowerCase().endsWith(".jpg");
    const isPng = item.file.type === "image/png";

    let embeddedImage;
    if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } else if (isPng) {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    }

    let pageWidth: number;
    let pageHeight: number;
    let imageWidth: number;
    let imageHeight: number;

    if (settings.paperSize === "Fit") {
      imageWidth = embeddedImage.width;
      imageHeight = embeddedImage.height;
      pageWidth = imageWidth;
      pageHeight = imageHeight;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: imageWidth,
        height: imageHeight,
      });
    } else {
      const paperSize = getPaperSizeInPoints(settings.paperSize);
      pageWidth = paperSize.width;
      pageHeight = paperSize.height;

      const marginPt = settings.margin * 2.83465;
      const contentWidth = pageWidth - marginPt * 2;
      const contentHeight = pageHeight - marginPt * 2;

      const imageAspect = embeddedImage.width / embeddedImage.height;
      const contentAspect = contentWidth / contentHeight;

      if (imageAspect > contentAspect) {
        imageWidth = contentWidth;
        imageHeight = contentWidth / imageAspect;
      } else {
        imageHeight = contentHeight;
        imageWidth = contentHeight * imageAspect;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const x = marginPt + (contentWidth - imageWidth) / 2;
      const y = pageHeight - marginPt - imageHeight - (contentHeight - imageHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
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

