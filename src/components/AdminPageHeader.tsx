"use client";

import { Plus } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  action?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

export default function AdminPageHeader({
  title,
  action,
  onAdd,
  addLabel = "新建",
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        {title}
      </h1>
      {action
        ? action
        : onAdd && (
            <button onClick={onAdd} className="btn-primary btn-sm">
              <Plus className="h-4 w-4 mr-1" />
              {addLabel}
            </button>
          )}
    </div>
  );
}
