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
import { SortableFileItem } from "./sortable-file-item";
import type { UploadedFileBase } from "@/utils/types";

interface SortableFileListProps<T extends UploadedFileBase> {
  items: T[];
  onReorder: (items: T[]) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  renderItem?: (item: T) => React.ReactNode;
  getItemLabel?: (item: T) => string;
  getItemPreview?: (item: T) => string;
  getItemMeta?: (item: T) => React.ReactNode;
}

export function SortableFileList<T extends UploadedFileBase>({
  items,
  onReorder,
  onDelete,
  onEdit,
  renderItem,
  getItemLabel,
  getItemPreview,
  getItemMeta,
}: SortableFileListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item) => {
            if (renderItem) {
              return <div key={item.id}>{renderItem(item)}</div>;
            }

            return (
              <SortableFileItem
                key={item.id}
                id={item.id}
                label={getItemLabel ? getItemLabel(item) : item.file.name}
                previewUrl={getItemPreview ? getItemPreview(item) : item.previewUrl}
                meta={getItemMeta ? getItemMeta(item) : undefined}
                onDelete={() => onDelete(item.id)}
                onEdit={onEdit ? () => onEdit(item.id) : undefined}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

