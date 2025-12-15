export type PdfFile = {
  id: string;
  file: File;
  fileName: string;
  thumbnailUrl: string;
  pageCount: number;
  excludedPageIndices: number[];
};

export interface UploadedFileBase {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PdfTaskItem extends UploadedFileBase {
  pageCount: number;
  excludedPageIndices: number[];
}

export interface ImageTaskItem extends UploadedFileBase {
  rotation: 0 | 90 | 180 | 270;
}
