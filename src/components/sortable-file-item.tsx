"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit, FileText } from "lucide-react";
import { cn } from "@/utils/cn";

interface SortableFileItemProps {
  id: string;
  label: string;
  previewUrl: string;
  meta?: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
}

export function SortableFileItem({
  id,
  label,
  previewUrl,
  meta,
  onDelete,
  onEdit,
}: SortableFileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
        isDragging && "shadow-lg"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-shrink-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-16 h-20 object-contain rounded border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-16 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {label}
        </h3>
        {meta && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta}</div>}
      </div>

      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="編集"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

