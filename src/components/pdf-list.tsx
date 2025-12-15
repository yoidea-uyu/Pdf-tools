"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PdfCard } from "./pdf-card";
import type { PdfFile } from "@/utils/types";

interface PdfListProps {
  pdfFiles: PdfFile[];
  onReorder: (files: PdfFile[]) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function PdfList({
  pdfFiles,
  onReorder,
  onDelete,
  onEdit,
}: PdfListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pdfFiles.findIndex((file) => file.id === active.id);
      const newIndex = pdfFiles.findIndex((file) => file.id === over.id);

      const newFiles = arrayMove(pdfFiles, oldIndex, newIndex);
      onReorder(newFiles);
    }
  };

  if (pdfFiles.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={pdfFiles.map((file) => file.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {pdfFiles.map((pdfFile) => (
            <PdfCard
              key={pdfFile.id}
              pdfFile={pdfFile}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

